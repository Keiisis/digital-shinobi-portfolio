"use client"

import { Check, X, Shield, Clock, Settings, PenTool, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

export function TestimonialScanner() {
    const [counts, setCounts] = useState({ pending: 0, published: 0, archived: 0 })
    const [latest, setLatest] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
        // Realtime
        const channel = supabase.channel('testimonials-widget')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
                fetchData()
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const fetchData = async () => {
        // Fetch Counts
        const { count: pending } = await supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('approved', false)
        const { count: published } = await supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('approved', true)

        // Fetch Latest Pending
        const { data } = await supabase.from('testimonials')
            .select('*')
            .eq('approved', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        setCounts({ pending: pending || 0, published: published || 0, archived: 0 })
        if (data) setLatest(data)
        else setLatest(null) // No pending
        setLoading(false)
    }

    const handleApprove = async (id: string) => {
        await supabase.from('testimonials').update({ approved: true }).eq('id', id)
        // Optimistic update or wait for realtime
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer ce témoignage ?')) return
        await supabase.from('testimonials').delete().eq('id', id)
    }

    if (loading) return <div className="bg-black/40 border border-white/10 rounded-xl h-[300px] animate-pulse" />

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col mb-6">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase mb-4">Gestion des Témoignages</h3>

                <div className="flex gap-4 text-[9px] font-bold font-orbitron tracking-widest text-neutral-500 mb-2">
                    <span className="text-cyan-400 border-b border-cyan-400 pb-1">A VALIDER ({counts.pending})</span>
                    <span className="hover:text-white cursor-pointer transition-colors">EN PUBLIC ({counts.published})</span>
                </div>
            </div>

            <div className="p-4">
                {latest ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 relative group hover:border-cyan-500/30 transition-colors">
                        {/* HUD Corners */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50" />

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-white/20 overflow-hidden relative">
                                {latest.avatar_url ? (
                                    <img src={latest.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 bg-neutral-700 flex items-center justify-center text-[10px] text-white font-bold">
                                        {latest.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="font-rajdhani font-bold text-white text-lg leading-none uppercase">{latest.name}</div>
                                <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{latest.company} // {latest.role}</div>
                            </div>
                            <span className="ml-auto text-[9px] font-mono text-neutral-500 truncate">
                                {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true, locale: fr })}
                            </span>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-inter line-clamp-3">
                            "{latest.content}"
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleApprove(latest.id)}
                                className="flex-1 py-1.5 bg-cyan-900/30 border border-cyan-500/30 rounded text-cyan-400 text-[10px] font-bold uppercase hover:bg-cyan-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <Check className="w-3 h-3" /> APPROUVER
                            </button>
                            <button
                                onClick={() => handleDelete(latest.id)}
                                className="flex-1 py-1.5 bg-red-900/30 border border-red-500/30 rounded text-red-500 text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <X className="w-3 h-3" /> REFUSER
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-neutral-500 text-xs font-mono border border-dashed border-white/10 rounded-lg">
                        AUCUN TÉMOIGNAGE EN ATTENTE
                    </div>
                )}

                <Link href="/admin/testimonials" className="w-full mt-2 py-2 border border-dashed border-white/20 rounded text-[10px] text-cyan-400 uppercase font-bold tracking-wider hover:bg-cyan-950/20 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2">
                    <span className="text-lg leading-none">+</span> GÉRER TOUS LES TÉMOIGNAGES
                </Link>
            </div>
        </div>
    )
}

export function QuickActions() {
    const actions = [
        { label: "GESTION DES CLIENTS", icon: Shield, active: true, href: "/admin/clients" },
        { label: "NOUVEAU PROJET", icon: PenTool, active: false, href: "/admin/projects/new" },
        { label: "PARAMÈTRES SITE", icon: Settings, active: false, href: "/admin/settings" },
    ]

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-orbitron font-bold text-sm text-cyan-400 tracking-wider uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    ACTIONS RAPIDES
                </h3>
            </div>

            <div className="p-2 space-y-1">
                {actions.map((action, i) => (
                    <Link href={action.href} key={i} className="w-full flex items-center justify-between p-3 rounded hover:bg-white/5 group transition-colors border border-transparent hover:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-neutral-800 rounded border border-white/10 group-hover:border-cyan-500/50 group-hover:text-cyan-400 transition-all">
                                <action.icon className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold font-orbitron tracking-wide text-neutral-300 group-hover:text-white">{action.label}</span>
                        </div>
                        {/* Status icon / Arrow */}
                        <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:bg-cyan-900/20 transition-all">
                            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-neutral-600 group-hover:bg-cyan-400'} transition-colors`} />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

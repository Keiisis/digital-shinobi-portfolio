"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Check, X, Trash2, Star, MessageSquare, User, Briefcase, Filter, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Testimonial {
    id: string
    created_at: string
    name: string
    role: string
    company: string
    project_name: string
    content: string
    rating: number
    avatar_url: string
    approved: boolean
}

export default function AdminTestimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

    useEffect(() => {
        fetchTestimonials()
    }, [])

    const fetchTestimonials = async () => {
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setTestimonials(data || [])
        } catch (error) {
            console.error('Error fetching testimonials:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic UI update
            setTestimonials(prev => prev.map(t =>
                t.id === id ? { ...t, approved: !currentStatus } : t
            ))

            const { error } = await supabase
                .from('testimonials')
                .update({ approved: !currentStatus })
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error updating approval:', error)
            fetchTestimonials() // Revert on error
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce témoignage ? Cette action est irréversible.")) return

        try {
            setTestimonials(prev => prev.filter(t => t.id !== id))

            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting testimonial:', error)
            fetchTestimonials()
        }
    }

    const filteredTestimonials = testimonials.filter(t => {
        if (filter === 'pending') return !t.approved
        if (filter === 'approved') return t.approved
        return true
    })

    const bgColors = [
        'bg-red-900/10 border-red-900/30',
        'bg-blue-900/10 border-blue-900/30',
        'bg-purple-900/10 border-purple-900/30',
        'bg-emerald-900/10 border-emerald-900/30',
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-orbitron text-3xl text-white font-bold tracking-wider">GESTION DES ALLIANCES</h1>
                    <p className="text-neutral-400 font-mono text-xs mt-1">
                        {testimonials.length} témoignages total • {testimonials.filter(t => !t.approved).length} en attente
                    </p>
                </div>

                <div className="flex bg-neutral-900 p-1 rounded-lg border border-white/10">
                    {(['all', 'pending', 'approved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded text-xs font-bold uppercase transition-all",
                                filter === f
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {f === 'all' ? 'Tous' : f === 'pending' ? 'En Attente' : 'Approuvés'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
                </div>
            ) : filteredTestimonials.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-neutral-800 rounded-lg text-neutral-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Aucun témoignage trouvé dans cette catégorie.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {filteredTestimonials.map((t, i) => (
                            <motion.div
                                key={t.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "relative p-6 rounded-lg border backdrop-blur-sm transition-all group",
                                    t.approved
                                        ? "bg-neutral-900/50 border-white/5 hover:border-green-500/30"
                                        : "bg-yellow-900/10 border-yellow-500/20 hover:border-yellow-500/50"
                                )}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Avatar & Info */}
                                    <div className="flex-shrink-0 flex md:flex-col items-center gap-4 w-full md:w-32 text-center border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-black border border-white/10">
                                                {t.avatar_url ? (
                                                    <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white/20">
                                                        {t.name ? t.name[0] : '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-neutral-900 rounded-full p-1">
                                                {t.approved ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Loader2 className="w-4 h-4 text-yellow-500 animate-spin-slow" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-left md:text-center">
                                            <div className="font-bold text-white text-sm">{t.name}</div>
                                            <div className="text-xs text-neutral-500">{t.role}</div>
                                            <div className="text-xs text-red-400 font-mono mt-1">{t.company}</div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={cn(
                                                                    "w-3 h-3",
                                                                    i < t.rating ? "fill-yellow-500 text-yellow-500" : "text-neutral-700"
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-neutral-600 text-[10px] uppercase tracking-wider">• {new Date(t.created_at).toLocaleDateString()}</span>
                                                </div>
                                                {t.project_name && (
                                                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-[10px] text-cyan-400 font-mono mb-3 border border-cyan-500/20">
                                                        <Briefcase className="w-3 h-3" /> {t.project_name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleApproval(t.id, t.approved)}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors",
                                                        t.approved
                                                            ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                                                            : "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                                                    )}
                                                >
                                                    {t.approved ? (
                                                        <><X className="w-3 h-3" /> Désapprouver</>
                                                    ) : (
                                                        <><Check className="w-3 h-3" /> Approuver</>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="p-1.5 text-neutral-600 hover:text-red-500 hover:bg-red-950/30 rounded transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-neutral-300 text-sm leading-relaxed border-l-2 border-white/10 pl-4 italic">
                                            "{t.content}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

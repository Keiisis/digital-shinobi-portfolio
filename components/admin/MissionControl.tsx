"use client"

import { Search, Edit, Eye, Trash2, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Project {
    id: string
    title: string
    category: string
    created_at: string
    status: string
    views: number
    image_url: string
}

export default function MissionControl() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            if (data) setProjects(data)
            setLoading(false)
        }
        fetchProjects()
    }, [])

    if (loading) return <div className="p-6 text-center text-neutral-500 font-mono text-xs">INITIALISATION DU SYSTÈME...</div>

    return (
        <div className="bg-black/40 border border-white/10 rounded-xl backdrop-blur-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-white/10">
                <h2 className="font-orbitron font-bold text-lg text-red-500 tracking-wider mb-6 uppercase">
                    DERNIÈRES MISSIONS <span className="text-white text-xs ml-2 opacity-50">// DATA STREAM</span>
                </h2>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-6 text-[10px] font-bold font-orbitron tracking-widest text-neutral-500">
                        <span className="text-red-500 underline underline-offset-8 decoration-2">RÉCENT</span>
                    </div>

                    <div className="relative w-full md:w-64 opacity-50 hover:opacity-100 transition-opacity">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Recherche une mission..."
                            disabled
                            className="w-full bg-black/50 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-red-500/50 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {projects.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                        <div className="w-12 h-12 border border-dashed border-white/10 rounded-full flex items-center justify-center">
                            <Eye className="w-5 h-5 opacity-20" />
                        </div>
                        <p className="font-mono text-xs uppercase tracking-widest">AUCUNE DONNÉE DÉTECTÉE</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[9px] font-orbitron tracking-widest text-neutral-600 uppercase">
                                <th className="px-4 py-2">Projet</th>
                                <th className="px-4 py-2">Statut</th>
                                <th className="px-4 py-2 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id} className="group bg-white/[0.02] hover:bg-white/[0.05] transition-colors rounded-lg overflow-hidden">
                                    <td className="px-4 py-3 rounded-l-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-8 bg-neutral-800 rounded border border-white/10 overflow-hidden relative shrink-0">
                                                {project.image_url ? (
                                                    <img src={project.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-rajdhani font-bold text-white text-sm leading-none mb-1 truncate max-w-[150px]">{project.title}</div>
                                                <div className="inline-block px-1.5 py-0.5 rounded-sm bg-red-900/30 border border-red-900/50 text-[8px] text-red-400 font-bold uppercase tracking-wider">
                                                    {project.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'published' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-500'}`} />
                                            <span className="text-neutral-400 text-[10px] font-mono uppercase">{project.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 rounded-r-lg text-right">
                                        <div className="text-neutral-500 text-[10px] font-mono">
                                            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true, locale: fr })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit, Code, CheckCircle, Zap, Monitor, FileText, Video, Users, Share2, PenTool, Globe, Smartphone, Database, Lock, Server } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Skill {
    id: string
    name: string
    category: string
    level: string
    icon_name: string
    color: string
}

// Map icon names to components for rendering and selection
const iconOptions = [
    { name: "Code", component: Code },
    { name: "Zap", component: Zap },
    { name: "CheckCircle", component: CheckCircle },
    { name: "Monitor", component: Monitor },
    { name: "FileText", component: FileText },
    { name: "Video", component: Video },
    { name: "Users", component: Users },
    { name: "Share2", component: Share2 },
    { name: "PenTool", component: PenTool },
    { name: "Globe", component: Globe },
    { name: "Smartphone", component: Smartphone },
    { name: "Database", component: Database },
    { name: "Lock", component: Lock },
    { name: "Server", component: Server },
]

// Map for quick lookup
const iconMap: Record<string, any> = iconOptions.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.component }), {})

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        category: "DEV",
        level: "80",
        icon_name: "Code",
        color: "text-[#E50914]"
    })

    useEffect(() => {
        fetchSkills()
    }, [])

    const fetchSkills = async () => {
        try {
            const { data } = await supabase.from('skills').select('*').order('created_at', { ascending: true })
            if (data) setSkills(data as any)
        } catch (error) {
            console.error('Error fetching skills:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const { error } = await supabase.from('skills').insert([formData])
            if (error) throw error
            setIsFormOpen(false)
            setFormData({ name: "", category: "DEV", level: "80", icon_name: "Code", color: "text-[#E50914]" })
            fetchSkills()
        } catch (error) {
            alert('Erreur lors de l\'ajout')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette compétence ?")) return
        const { error } = await supabase.from('skills').delete().eq('id', id)
        if (!error) fetchSkills()
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-orbitron font-bold tracking-wider text-white uppercase">
                        Mon Arsenal <span className="text-cyan-400 text-sm align-middle ml-2">// GESTION DES COMPÉTENCES</span>
                    </h1>
                    <p className="text-neutral-400 text-xs font-mono mt-1">Gérez vos compétences et icônes dynamiques.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="px-4 py-2 bg-cyan-900/30 border border-cyan-500/50 rounded text-cyan-400 font-bold uppercase tracking-wider hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Compétence
                </button>
            </div>

            {/* Add Skill Form */}
            {isFormOpen && (
                <form onSubmit={handleSubmit} className="bg-neutral-900/50 border border-cyan-500/30 p-6 rounded-xl animate-in fade-in slide-in-from-top-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Nom</label>
                            <input
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                placeholder="ex: REACT.JS" required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Catégorie</label>
                            <input
                                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded p-2 text-white focus:border-cyan-500 outline-none"
                                placeholder="ex: DEV, DESIGN..."
                            />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Couleur Tailwind</label>
                            <select
                                value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded p-2 text-white focus:border-cyan-500 outline-none"
                            >
                                <option value="text-[#E50914]">Rouge (Défaut)</option>
                                <option value="text-[#00FFFF]">Cyan (Tech)</option>
                                <option value="text-emerald-400">Vert (Validé)</option>
                                <option value="text-amber-400">Jaune (Warning)</option>
                                <option value="text-purple-400">Violet (Mystic)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Icône</label>
                            <select
                                value={formData.icon_name} onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded p-2 text-white focus:border-cyan-500 outline-none"
                            >
                                {iconOptions.map(opt => (
                                    <option key={opt.name} value={opt.name}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded font-bold uppercase text-sm tracking-wider transition-colors">
                            Ajouter au système
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-white p-8 animate-pulse font-mono">Chargement de l'arsenal...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {skills.map((skill) => {
                        const Icon = iconMap[skill.icon_name] || Code
                        const skillColor = skill.color || "text-[#E50914]"
                        // Use color for border/bg logic too
                        const borderColor = skillColor.replace("text-", "border-")

                        return (
                            <div key={skill.id} className={`group relative bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-white/30 transition-all cursor-pointer overflow-hidden`}>

                                {/* Tech Circuit SVG Overlay */}
                                <svg className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-30 transition-opacity pointer-events-none" viewBox="0 0 100 100">
                                    <path d="M10,10 L90,10 L90,90" fill="none" stroke="currentColor" strokeWidth="2" className={skillColor} />
                                    <circle cx="90" cy="90" r="4" fill="currentColor" className={skillColor} />
                                </svg>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`p-3 bg-neutral-800 rounded-lg border border-white/10 transition-colors ${skillColor}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(skill.id)}
                                            className="p-1.5 hover:bg-red-900/20 rounded text-neutral-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className={`font-rajdhani font-bold text-xl text-white mb-1 transition-colors group-hover:${skillColor}`}>{skill.name}</h3>
                                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 mb-4">
                                    <span className="bg-neutral-800 px-2 py-0.5 rounded border border-white/5">{skill.category}</span>
                                    <span className={skillColor}>{skill.level}%</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

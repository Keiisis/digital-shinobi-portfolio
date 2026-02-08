"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Filter, Eye, Edit, Trash2, Globe, Image as ImageIcon, X, Save, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

interface Project {
    id: string
    title: string
    category: string
    status: string
    image_url: string
    description?: string
    link?: string
    views?: number
}

const CATEGORIES = ["WEB DESIGN", "DESIGN GRAPHIQUE", "AUTOMATISATION", "COMMUNITY MANAGEMENT", "ILLUSTRATION", "UI/UX", "MOTION"]

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        category: "WEB DESIGN",
        status: "draft",
        description: "",
        link: "",
        image_url: ""
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (data) setProjects(data as Project[])
        setLoading(false)
    }

    const handleEdit = (project: Project) => {
        setEditingProject(project)
        setFormData({
            title: project.title,
            category: project.category,
            status: project.status,
            description: project.description || "",
            link: project.link || "",
            image_url: project.image_url || ""
        })
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.")) return
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (!error) fetchProjects()
    }

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('logos') // Using 'logos' bucket for now as it exists, ideally 'projects'
                .upload(`projects/${fileName}`, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(`projects/${fileName}`)

            setFormData(prev => ({ ...prev, image_url: publicUrl }))
        } catch (error) {
            console.error('Upload failed:', error)
            alert("Erreur lors de l'upload de l'image")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingProject) {
                const { error } = await supabase
                    .from('projects')
                    .update(formData)
                    .eq('id', editingProject.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('projects')
                    .insert([formData])
                if (error) throw error
            }

            setIsFormOpen(false)
            setEditingProject(null)
            setFormData({ title: "", category: "WEB DESIGN", status: "draft", description: "", link: "", image_url: "" })
            setImageFile(null)
            fetchProjects()
        } catch (error) {
            console.error('Error saving project:', error)
            alert("Erreur lors de la sauvegarde")
        }
    }

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-orbitron font-bold tracking-wider text-white uppercase">
                        Mes Missions <span className="text-red-500 text-sm align-middle ml-2">// PROJETS ACTIFS</span>
                    </h1>
                    <p className="text-neutral-400 text-xs font-mono mt-1">Gérez vos déploiements et archives de mission.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingProject(null)
                        setFormData({ title: "", category: "WEB DESIGN", status: "draft", description: "", link: "", image_url: "" })
                        setIsFormOpen(true)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm tracking-wider uppercase rounded shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center gap-2 transition-all"
                >
                    <Plus className="w-4 h-4" /> Nouvelle Mission
                </button>
            </div>

            {/* Modal Form */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-neutral-900 border border-red-500/30 w-full max-w-2xl rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-6 border-b border-white/10">
                                <h2 className="text-xl font-orbitron font-bold text-white uppercase">
                                    {editingProject ? 'Modifier Mission' : 'Nouvelle Mission'}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="text-neutral-500 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Titre du Projet</label>
                                            <input
                                                value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                                                placeholder="ex: FRINDKIN ETOILE" required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Catégorie</label>
                                            <select
                                                value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                                            >
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>

                                        {/* Dynamic Fields based on Category */}
                                        {(formData.category === "WEB DESIGN" || formData.category === "COMMUNITY MANAGEMENT" || formData.category === "COPYWRITING" || formData.category === "MOTION") && (
                                            <div>
                                                <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">
                                                    {formData.category === "MOTION" ? "Lien Vidéo (YouTube/Vimeo)" : "Lien Public (URL)"}
                                                </label>
                                                <input
                                                    value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        )}

                                        {/* Automation Specific: File Upload */}
                                        {formData.category === "AUTOMATISATION" && (
                                            <div className="p-4 border border-blue-900/30 bg-blue-900/10 rounded-lg">
                                                <label className="text-xs text-blue-400 uppercase tracking-widest block mb-2">Fichier Workflow (JSON)</label>
                                                <input type="file" className="text-xs text-white" />
                                                <p className="text-[10px] text-neutral-500 mt-1">Uploadez le fichier .json pour que les utilisateurs puissent copier le workflow.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Upload Area - Adapts for Graphic Design (Gallery) */}
                                    <div>
                                        <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">
                                            {formData.category === "DESIGN GRAPHIQUE" ? "Galerie d'Images" : "Visuel Principal"}
                                        </label>

                                        {formData.category === "DESIGN GRAPHIQUE" ? (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {/* Existing placeholder for gallery - fully implementing gallery logic would require array state management, keeping simple for this iteration */}
                                                    {formData.image_url && (
                                                        <div className="aspect-square rounded overflow-hidden border border-white/10 relative group">
                                                            <img src={formData.image_url} className="w-full h-full object-cover" />
                                                            <button type="button" onClick={() => setFormData({ ...formData, image_url: "" })} className="absolute top-1 right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                                                        </div>
                                                    )}
                                                    <div className="aspect-square border-2 border-dashed border-white/10 rounded flex items-center justify-center hover:border-red-500/50 cursor-pointer transition-colors relative">
                                                        <Plus className="w-6 h-6 text-neutral-600" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) handleImageUpload(file)
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-neutral-500">Ajoutez plusieurs images pour créer un carrousel.</p>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-red-500/50 transition-colors relative group h-[200px] flex flex-col items-center justify-center">
                                                {formData.image_url ? (
                                                    <>
                                                        <img src={formData.image_url} alt="Preview" className="h-full object-contain mb-2" />
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-xs">Changer l'image</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-neutral-500">
                                                        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <span className="text-xs block">Glisser ou cliquer pour upload</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleImageUpload(file)
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                {uploading && (
                                                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                                        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">Description</label>
                                    <textarea
                                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors h-24 resize-none"
                                        placeholder="Détails de la mission..."
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <div className="flex items-center gap-4">
                                        <label className="text-xs text-neutral-400 uppercase tracking-widest">Statut :</label>
                                        <div className="flex bg-black rounded p-1 border border-white/10">
                                            {['draft', 'published', 'archived'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status })}
                                                    className={`px-3 py-1 text-xs uppercase font-bold rounded transition-colors ${formData.status === status
                                                        ? (status === 'published' ? 'bg-emerald-500 text-black' : status === 'draft' ? 'bg-amber-500 text-black' : 'bg-red-500 text-black')
                                                        : 'text-neutral-500 hover:text-white'
                                                        }`}
                                                >
                                                    {status === 'published' ? 'En Ligne' : status === 'draft' ? 'Brouillon' : 'Archivé'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" /> Enregistrer
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Projects Table */}
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10">
                        <tr className="text-xs font-orbitron tracking-widest text-neutral-500 uppercase">
                            <th className="px-6 py-4">Projet</th>
                            <th className="px-6 py-4">Client / Catégorie</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {projects.map((project) => (
                            <tr key={project.id} className="group hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                            {project.image_url ? (
                                                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <Globe className="w-6 h-6 text-neutral-500 group-hover:text-red-500 transition-colors" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="font-bold font-rajdhani text-white text-lg block">{project.title}</span>
                                            {project.link && <a href={project.link} target="_blank" className="text-xs text-red-500 hover:underline">{project.link}</a>}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-400 font-mono">{project.category}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${project.status === 'published' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : project.status === 'draft' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-bold uppercase tracking-wider ${project.status === 'published' ? 'text-emerald-500' : project.status === 'draft' ? 'text-amber-500' : 'text-red-500'}`}>
                                            {project.status === 'published' ? 'En Ligne' : project.status === 'draft' ? 'Brouillon' : 'Archivé'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(project)} className="p-2 hover:bg-white/10 rounded text-neutral-400 hover:text-cyan-400 transition-colors">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2 hover:bg-red-900/20 rounded text-neutral-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

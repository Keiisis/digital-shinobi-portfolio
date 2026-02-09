"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Filter, Eye, Edit, Trash2, Globe, Image as ImageIcon, X, Save, Upload, PlayCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { AIEnhanceButton } from "@/components/admin/AIEnhanceButton"

interface Project {
    id: string
    title: string
    category: string
    status: string
    image_url: string
    images?: string[]
    videos?: string[]
    description?: string
    link?: string
    direct_link?: boolean
    views?: number
}

interface Category {
    name: string
    supports_multiple_images: boolean
    supports_videos: boolean
}

// Categories are now fetched dynamically from Supabase

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [categories, setCategories] = useState<Category[]>([])
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
        direct_link: false,
        image_url: "",
        images: [] as string[],
        videos: [] as string[]
    })
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchProjects()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('project_categories')
            .select('name, supports_multiple_images, supports_videos')
            .eq('is_active', true)
            .order('display_order')

        if (data) setCategories(data as Category[])
    }

    const fetchProjects = async () => {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        if (data) setProjects(data as Project[])
        setLoading(false)
    }

    const handleEdit = (project: Project) => {
        setEditingProject(project)

        // Ensure existing single image is added to gallery for legacy projects
        let initialImages = project.images || []
        if (initialImages.length === 0 && project.image_url) {
            initialImages = [project.image_url]
        }

        setFormData({
            title: project.title,
            category: project.category,
            status: project.status,
            description: project.description || "",
            link: project.link || "",
            direct_link: project.direct_link || false,
            image_url: project.image_url || "",
            images: initialImages,
            videos: project.videos || []
        })
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ Êtes-vous sûr de vouloir supprimer cette mission ? Cette action est irréversible.")) return
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (!error) fetchProjects()
    }

    const handleImageUpload = async (file: File, isGallery = false) => {
        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `projects/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(fileName)

            if (isGallery) {
                // Add to gallery images array
                setFormData(prev => {
                    const newImages = [...prev.images, publicUrl]
                    // If image_url is empty, set this first image as the main image_url too
                    const image_url = prev.image_url || publicUrl
                    return { ...prev, images: newImages, image_url }
                })
            } else {
                // Single main image
                setFormData(prev => ({ ...prev, image_url: publicUrl }))
            }
        } catch (error: any) {
            console.error('Upload failed:', error)
            alert(`Erreur d'upload : ${error.message || "Erreur inconnue"}`)
        } finally {
            setUploading(false)
        }
    }

    const removeGalleryImage = (indexToRemove: number) => {
        setFormData(prev => {
            const newImages = prev.images.filter((_, index) => index !== indexToRemove)
            // If we removed the image which was the image_url, update it too
            const currentMain = prev.image_url
            let newMain = currentMain

            // If main image was the one removed or is not in the new list, pick first available
            if (!newImages.includes(currentMain)) {
                newMain = newImages.length > 0 ? newImages[0] : ""
            }

            return {
                ...prev,
                images: newImages,
                image_url: newMain
            }
        })
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
            setFormData({ title: "", category: categories[0]?.name || "WEB DESIGN", status: "draft", description: "", link: "", direct_link: false, image_url: "", images: [], videos: [] })
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
                        setFormData({ title: "", category: categories[0]?.name || "WEB DESIGN", status: "draft", description: "", link: "", direct_link: false, image_url: "", images: [], videos: [] })
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
                                                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                                            </select>
                                        </div>

                                        {/* Dynamic Fields based on Category */}
                                        {(formData.category === "WEB DESIGN" || formData.category === "COMMUNITY MANAGEMENT" || formData.category === "COPYWRITING" || formData.category === "MOTION") && (
                                            <div>
                                                <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">
                                                    {formData.category === "MOTION" ? "Lien Vidéo (YouTube/Vimeo)" : "Lien Public (URL)"}
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                        className="flex-1 bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                                                        placeholder="https://..."
                                                    />

                                                    {/* Direct Link Switch */}
                                                    <div
                                                        className={`flex flex-col items-center justify-center px-3 rounded border cursor-pointer transition-all ${formData.direct_link
                                                            ? 'bg-emerald-900/20 border-emerald-500/50'
                                                            : 'bg-black border-white/10 hover:border-white/30'}`}
                                                        onClick={() => setFormData({ ...formData, direct_link: !formData.direct_link })}
                                                        title="Si activé, le clic sur la carte redirige directement vers le lien sans ouvrir la modale."
                                                    >
                                                        <span className={`text-[9px] uppercase font-bold tracking-wider mb-1 ${formData.direct_link ? 'text-emerald-400' : 'text-neutral-500'}`}>
                                                            {formData.direct_link ? 'Direct' : 'Galerie'}
                                                        </span>
                                                        <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.direct_link ? 'bg-emerald-500' : 'bg-neutral-800'}`}>
                                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${formData.direct_link ? 'left-4.5' : 'left-0.5'}`} style={{ left: formData.direct_link ? 'calc(100% - 0.125rem - 0.75rem)' : '0.125rem' }} />
                                                        </div>
                                                    </div>
                                                </div>
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

                                    {/* Image/Video Upload Area - Smart Adaptation based on Category */}
                                    <div className="space-y-4">
                                        {/* Images Section - ALWAYS Gallery Mode (all categories support multi-images) */}
                                        <div>
                                            <label className="text-xs text-neutral-400 uppercase tracking-widest block mb-2">
                                                Galerie d'Images
                                            </label>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    {/* Gallery images */}
                                                    {formData.images.map((imgUrl, index) => (
                                                        <div key={index} className="aspect-square rounded overflow-hidden border border-white/10 relative group">
                                                            <img src={imgUrl} className="w-full h-full object-cover" alt={`Gallery ${index + 1}`} />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryImage(index)}
                                                                className="absolute top-1 right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-3 h-3 text-white" />
                                                            </button>
                                                            {index === 0 && (
                                                                <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">Cover</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {/* Add new image button */}
                                                    <div className="aspect-square border-2 border-dashed border-white/10 rounded flex flex-col items-center justify-center hover:border-red-500/50 cursor-pointer transition-colors relative">
                                                        {uploading ? (
                                                            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Plus className="w-6 h-6 text-neutral-600" />
                                                                <span className="text-[8px] text-neutral-500 mt-1">Ajouter</span>
                                                            </>
                                                        )}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            multiple
                                                            disabled={uploading}
                                                            onChange={async (e) => {
                                                                const files = e.target.files
                                                                if (files) {
                                                                    for (let i = 0; i < files.length; i++) {
                                                                        await handleImageUpload(files[i], true)
                                                                    }
                                                                }
                                                            }}
                                                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-neutral-500">Sélectionnez plusieurs images. La première sera la couverture du carrousel.</p>
                                            </div>
                                        </div>

                                        {/* Videos Section - Only for video categories */}
                                        {/* Videos Section - Available for ALL categories as requested */}
                                        <div className="mt-6 border-t border-white/10 pt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-xs text-neutral-400 uppercase tracking-widest block font-bold">
                                                    Galerie Vidéos <span className="text-red-500 text-[10px] uppercase ml-2 opacity-60">Youtube / Vimeo</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, videos: [...(formData.videos || []), ""] })}
                                                    className="w-8 h-8 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-500 flex items-center justify-center transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Video list with previews */}
                                                {(formData.videos || []).map((videoUrl, index) => {
                                                    // Helper to get embed URL for preview
                                                    let embedUrl = "";
                                                    if (videoUrl) {
                                                        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                                                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                            const match = videoUrl.match(regExp);
                                                            if (match && match[2].length === 11) embedUrl = `https://www.youtube.com/embed/${match[2]}`;
                                                        } else if (videoUrl.includes('vimeo.com')) {
                                                            const match = videoUrl.match(/vimeo.com\/(\d+)/);
                                                            if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
                                                        }
                                                    }

                                                    return (
                                                        <div key={index} className="bg-black/40 border border-white/10 rounded-lg p-3 space-y-3 relative group hover:border-white/30 transition-colors">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 font-mono border border-white/5">
                                                                    {index + 1}
                                                                </div>
                                                                <input
                                                                    type="url"
                                                                    value={videoUrl}
                                                                    onChange={(e) => {
                                                                        const newVideos = [...(formData.videos || [])]
                                                                        newVideos[index] = e.target.value
                                                                        setFormData({ ...formData, videos: newVideos })
                                                                    }}
                                                                    className="flex-1 bg-transparent border-b border-white/10 py-1 text-white text-xs outline-none focus:border-red-500 transition-colors placeholder:text-neutral-700 font-mono"
                                                                    placeholder="https://..."
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newVideos = [...(formData.videos || [])].filter((_, i) => i !== index)
                                                                        setFormData({ ...formData, videos: newVideos })
                                                                    }}
                                                                    className="p-1.5 hover:bg-red-500/20 rounded text-neutral-600 hover:text-red-500 transition-colors"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>

                                                            {/* Preview */}
                                                            {embedUrl ? (
                                                                <div className="aspect-video w-full rounded overflow-hidden bg-black border border-white/5 relative group/preview">
                                                                    <iframe
                                                                        src={embedUrl}
                                                                        className="w-full h-full pointer-events-none opacity-60 group-hover/preview:opacity-100 transition-opacity"
                                                                        title="Video Preview"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="aspect-video w-full rounded bg-white/5 flex items-center justify-center border border-white/5 border-dashed">
                                                                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider">Aperçu indisponible</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}

                                                {(!formData.videos || formData.videos.length === 0) && (
                                                    <div
                                                        onClick={() => setFormData({ ...formData, videos: [""] })}
                                                        className="col-span-1 md:col-span-2 border border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-500 transition-colors text-neutral-500">
                                                            <PlayCircle size={20} />
                                                        </div>
                                                        <span className="text-xs text-neutral-500 group-hover:text-neutral-300 uppercase tracking-widest font-bold">Ajouter une première vidéo</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs text-neutral-400 uppercase tracking-widest">Description</label>
                                        <AIEnhanceButton
                                            text={formData.description}
                                            onEnhanced={(enhanced) => setFormData({ ...formData, description: enhanced })}
                                        />
                                    </div>
                                    <textarea
                                        value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors h-24 resize-none"
                                        placeholder="Détails de la mission... L'IA peut améliorer votre texte !"
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

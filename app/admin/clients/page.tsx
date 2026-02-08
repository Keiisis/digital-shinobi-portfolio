"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash2, Globe, Upload, Loader2, Image as ImageIcon, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Client {
    id: string
    name: string
    logo_url: string
    website: string
    created_at: string
}

export default function AdminClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [newClient, setNewClient] = useState({ name: '', logo_url: '', website: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        try {
            // Check if logo is square-ish or handle resizing? For now just upload.
            const fileExt = file.name.split('.').pop()
            const fileName = `partner_${Date.now()}.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('logos') // Reusing 'logos' bucket
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(fileName)

            setNewClient(prev => ({ ...prev, logo_url: publicUrl }))
        } catch (error) {
            console.error('Upload failed:', error)
            alert("Erreur lors de l'upload du logo")
        } finally {
            setUploading(false)
        }
    }

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const { error } = await supabase.from('clients').insert([newClient])
            if (error) throw error

            setNewClient({ name: '', logo_url: '', website: '' })
            fetchClients() // Refresh list
        } catch (error) {
            console.error('Error adding client:', error)
            alert("Erreur lors de l'ajout du partenaire.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer ce partenaire ?")) return
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id)
            if (error) throw error
            fetchClients()
        } catch (error) {
            console.error('Error deleting client:', error)
        }
    }

    return (
        <div className="space-y-8">
            <h1 className="font-orbitron text-3xl text-white font-bold tracking-wider mb-8">
                GESTION DES PARTENAIRES <span className="text-red-600 text-sm align-middle ml-2">// ALLIANCES</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 bg-neutral-900/50 border border-white/5 p-6 rounded-xl h-fit sticky top-24">
                    <h2 className="text-xl font-orbitron text-red-500 mb-6 flex items-center gap-2 uppercase">
                        <Plus className="w-5 h-5" /> Ajouter une Alliance
                    </h2>

                    <form onSubmit={handleAddClient} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase text-neutral-500 mb-1">Nom de la Marque</label>
                            <input
                                type="text"
                                placeholder="Ex: Google, Nike..."
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors"
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-xs uppercase text-neutral-500 mb-1">Logo (PNG Transparent recommandé)</label>
                            <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors relative group ${newClient.logo_url ? 'border-red-500/50 bg-red-900/10' : 'border-white/10 hover:border-red-500/30'}`}>
                                {newClient.logo_url ? (
                                    <div className="relative h-20 flex items-center justify-center">
                                        <img src={newClient.logo_url} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={() => setNewClient(prev => ({ ...prev, logo_url: '' }))}
                                            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 text-white hover:scale-110 transition-transform"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-4">
                                        <Upload className={`w-8 h-8 mx-auto mb-2 ${uploading ? 'animate-bounce text-red-500' : 'text-neutral-600'}`} />
                                        <span className="text-xs text-neutral-500 block">{uploading ? 'Upload en cours...' : 'Glisser ou cliquer'}</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    disabled={uploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleImageUpload(file)
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-neutral-500 mb-1">Site Web (Optionnel)</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={newClient.website}
                                    onChange={(e) => setNewClient({ ...newClient, website: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded pl-10 p-3 text-white focus:border-red-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || uploading}
                            className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-bold py-3 rounded uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Enregistrer Partenaire
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-sm font-mono text-neutral-500 mb-4 uppercase tracking-widest border-b border-white/10 pb-2">
                        Liste des Partenaires ({clients.length})
                    </h2>

                    {loading ? (
                        <div className="text-center py-12 text-neutral-500 font-mono animate-pulse">Chargement de la base de données...</div>
                    ) : clients.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500 border border-dashed border-white/10 rounded bg-white/5">
                            Aucune alliance enregistrée pour le moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {clients.map((client) => (
                                    <motion.div
                                        key={client.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group relative bg-black/40 border border-white/10 hover:border-red-500/50 rounded-lg p-4 flex flex-col items-center gap-4 transition-colors"
                                    >
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-1.5 bg-red-900/80 text-red-200 rounded hover:bg-red-600 hover:text-white transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="h-16 w-full flex items-center justify-center p-2 bg-neutral-900/50 rounded border border-white/5">
                                            {client.logo_url ? (
                                                <img src={client.logo_url} alt={client.name} className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                                            ) : (
                                                <div className="text-2xl font-black text-white/20 uppercase">{client.name.substring(0, 2)}</div>
                                            )}
                                        </div>

                                        <div className="text-center w-full">
                                            <h3 className="font-bold text-white text-xs uppercase tracking-wider truncate mb-1">{client.name}</h3>
                                            {client.website && (
                                                <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-neutral-500 hover:text-red-400 truncate block font-mono">
                                                    {client.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

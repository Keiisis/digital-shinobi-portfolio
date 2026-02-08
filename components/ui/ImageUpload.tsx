"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    label?: string
    className?: string
}

export function ImageUpload({ value, onChange, label, className }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('uploads')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('uploads').getPublicUrl(filePath)

            onChange(data.publicUrl)
        } catch (error) {
            console.error("Error uploading image:", error)
            alert("Erreur lors de l'upload de l'image.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className={cn("space-y-2", className)}>
            {label && <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">{label}</label>}

            <div className="relative group/uploader border-2 border-dashed border-white/10 hover:border-red-500/50 rounded-lg p-4 transition-all duration-300 bg-black/40">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    ref={fileInputRef}
                    className="hidden"
                    disabled={uploading}
                />

                {value ? (
                    <div className="relative aspect-video w-full h-40 group/preview rounded overflow-hidden bg-center bg-cover bg-no-repeat border border-white/5" style={{ backgroundImage: `url(${value})` }}>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-transform hover:scale-110"
                                title="Changer l'image"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="p-2 bg-red-500/20 hover:bg-red-500 rounded-full text-red-500 hover:text-white backdrop-blur-sm transition-transform hover:scale-110"
                                title="Supprimer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-white/[0.02] transition-colors rounded"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover/uploader:scale-110 transition-transform duration-300 group-hover/uploader:bg-red-500/20 group-hover/uploader:text-red-500 text-neutral-500">
                            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-orbitron tracking-wide text-neutral-300 group-hover/uploader:text-white transition-colors">
                            {uploading ? "UPLOAD EN COURS..." : "CLIQUER POUR UPLOADER"}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-1 font-mono uppercase">JPG, PNG, WEBP (MAX 5MB)</p>
                    </div>
                )}

                {/* Cyberpunk corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover/uploader:border-red-500 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover/uploader:border-red-500 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover/uploader:border-red-500 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover/uploader:border-red-500 transition-colors" />
            </div>
        </div>
    )
}

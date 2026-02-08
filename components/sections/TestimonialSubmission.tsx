"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Star, Upload, Send, User, Briefcase, MessageSquare, Loader2, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/app/context/LanguageContext"

export function TestimonialSubmission() {
    const [form, setForm] = useState({
        name: "",
        project_name: "",
        message: "",
        rating: 5,
        role: "",
        company: ""
    })
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { t } = useLanguage()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setStatus('idle')

        try {
            let image_url = null

            // 1. Upload Image if exists
            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('testimonials')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('testimonials')
                    .getPublicUrl(fileName)

                image_url = publicUrl
            }

            // 2. Insert Testimonial
            const { error: insertError } = await supabase
                .from('testimonials')
                .insert([{
                    name: form.name,
                    project_name: form.project_name,
                    content: form.message, // Map message to content column
                    rating: form.rating,
                    role: form.role,
                    company: form.company,
                    avatar_url: image_url, // Using avatar_url for the user photo
                    approved: false // Default to pending
                }])

            if (insertError) throw insertError

            setStatus('success')
            setForm({ name: "", project_name: "", message: "", rating: 5, role: "", company: "" })
            setFile(null)

        } catch (error) {
            console.error('Error submitting testimonial:', error)
            setStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="py-24 relative overflow-hidden bg-neutral-950" id="submission">
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-3xl font-bold text-white tracking-[0.2em] mb-4 uppercase">
                            {t("testimonials.form.title")}
                        </h2>
                        <p className="text-neutral-400 font-mono text-sm max-w-xl mx-auto">
                            {t("testimonials.form.subtitle")}
                        </p>
                    </div>

                    {status === 'success' ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-green-900/20 border border-green-500/30 p-8 rounded-lg text-center"
                        >
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-orbitron text-white mb-2">{t("testimonials.form.success.title")}</h3>
                            <p className="text-green-300 font-mono">{t("testimonials.form.success.message")}</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-6 text-sm text-green-400 hover:text-white underline underline-offset-4"
                            >
                                {t("testimonials.form.success.button")}
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-lg p-8 space-y-6 backdrop-blur-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase flex items-center gap-2">
                                        <User className="w-3 h-3" /> {t("testimonials.form.name")}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                                        placeholder="Ex: John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase flex items-center gap-2">
                                        <Briefcase className="w-3 h-3" /> {t("testimonials.form.project")}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.project_name}
                                        onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                                        placeholder="Ex: Refonte E-commerce"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase">{t("testimonials.form.role")}</label>
                                    <input
                                        type="text"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                                        placeholder="Ex: CEO"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase">{t("testimonials.form.company")}</label>
                                    <input
                                        type="text"
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none"
                                        placeholder="Ex: Shinobi Corp"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3" /> {t("testimonials.form.message")}
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none resize-none"
                                    placeholder="Racontez votre expérience..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                <div>
                                    <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase flex items-center gap-2">
                                        <Upload className="w-3 h-3" /> {t("testimonials.form.photo")}
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-900/20 file:text-red-400 hover:file:bg-red-900/30 transition-all cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-orbitron tracking-widest text-neutral-500 mb-2 uppercase">{t("testimonials.form.rating")}</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setForm({ ...form, rating: star })}
                                                className={cn(
                                                    "transition-colors",
                                                    form.rating >= star ? "text-yellow-500" : "text-neutral-700 hover:text-neutral-500"
                                                )}
                                            >
                                                <Star className="w-6 h-6 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-white/10 hover:bg-red-600 text-white font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> {t("testimonials.form.submitting")}
                                    </>
                                ) : (
                                    <>
                                        {t("testimonials.form.submit")} <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </section>
    )
}

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Star, Send, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/app/context/LanguageContext"

interface TestimonialModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TestimonialModal({ isOpen, onClose }: TestimonialModalProps) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        company: "",
        role: "",
        content: "",
        rating: 5,
        project_name: ""
    })
    const { t } = useLanguage()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('testimonials')
                .insert([{
                    ...formData,
                    approved: false // Pending approval
                }])

            if (error) throw error
            setSuccess(true)
            setTimeout(() => {
                onClose()
                setSuccess(false)
                setFormData({ name: "", company: "", role: "", content: "", rating: 5, project_name: "" })
            }, 3000)
        } catch (error) {
            console.error(error)
            alert(t("contact.error"))
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-xl p-8 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {success ? (
                            <div className="text-center py-12">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Send className="text-white w-8 h-8" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-2">{t("testimonials.form.success.title")}</h3>
                                <p className="text-neutral-400 text-sm">{t("testimonials.form.success.message")}</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-heading font-bold text-white mb-6 uppercase tracking-wider text-center">
                                    {t("testimonials.form.title")}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1 block">{t("testimonials.form.name")}</label>
                                            <input
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors text-sm"
                                                placeholder={t("contact.name_placeholder")}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1 block">{t("testimonials.form.company")}</label>
                                            <input
                                                value={formData.company}
                                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                                className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors text-sm"
                                                placeholder="Corp Inc."
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1 block">{t("testimonials.form.role")}</label>
                                        <input
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors text-sm"
                                            placeholder="CEO, Marketing Director..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1 block">{t("testimonials.form.rating")}</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, rating: star })}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        size={24}
                                                        className={`${formData.rating >= star ? "fill-yellow-500 text-yellow-500" : "text-neutral-700 hover:text-yellow-500/50"}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase text-neutral-500 tracking-widest mb-1 block">{t("testimonials.form.message")}</label>
                                        <textarea
                                            required
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full h-32 bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors text-sm resize-none"
                                            placeholder={t("contact.message_placeholder")}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white text-black hover:bg-red-600 hover:text-white font-bold uppercase tracking-widest py-4 rounded transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>{t("testimonials.form.submit")} <Send size={16} /></>}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

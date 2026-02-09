"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Zap, Mail, Phone, Lock, Terminal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/app/context/LanguageContext"
import { useExperience } from "@/app/context/ExperienceContext"

export function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        domain: "",
        message: ""
    })
    const { t } = useLanguage()

    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
    const [settings, setSettings] = useState<any>({
        contact_email: "chefkeiis377@gmail.com",
        contact_phone: "+229 01 97 20 90 37",
        whatsapp_number: "2290197209037"
    })
    const { playHover, playClick } = useExperience()

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('*')
            if (data) {
                const s: any = {}
                data.forEach(item => s[item.key] = item.value)
                setSettings({
                    contact_email: s.contact_email || "chefkeiis377@gmail.com",
                    contact_phone: s.contact_phone || "+229 01 97 20 90 37",
                    whatsapp_number: s.whatsapp_number || "2290197209037"
                })
            }
        }
        fetchSettings()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        playClick()
        e.preventDefault()
        setStatus('sending')

        try {
            const { error } = await supabase
                .from('messages')
                .insert([
                    {
                        name: formState.name,
                        email: formState.email,
                        domain: formState.domain,
                        content: formState.message
                    }
                ])

            if (error) throw error

            setStatus('success')
            setFormState({ name: "", email: "", domain: "", message: "" })

            // Reset status after 5 seconds
            setTimeout(() => setStatus('idle'), 5000)
        } catch (error) {
            console.error('Error sending message:', error)
            setStatus('error')
        }
    }

    return (
        <section className="py-24 relative overflow-hidden bg-black/50" id="contact">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-heading text-3xl font-bold text-white tracking-[0.2em] mb-4 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        {t("contact.title")}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-red-500 font-mono text-xs animate-pulse">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        {t("contact.subtitle")}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-5xl mx-auto">

                    {/* Left: Transmission Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        {/* HUD Frame */}
                        <div className="absolute -inset-1 border border-red-900/30 rounded-lg pointer-events-none">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500" />
                        </div>

                        <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-md p-8 rounded-lg border border-white/5 space-y-6 relative overflow-hidden">
                            {/* Success Overlay */}
                            <AnimatePresence>
                                {status === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                        className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-center p-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-500 mb-4"
                                        >
                                            <Send className="w-8 h-8" />
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-white font-heading tracking-widest uppercase mb-2">{t("contact.success_title")}</h3>
                                        <p className="text-neutral-400 font-mono text-sm">{t("contact.success_text")}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label className="block text-[10px] font-orbitron tracking-widest text-red-500 mb-2 uppercase flex items-center gap-2">
                                    <Terminal className="w-3 h-3" /> {t("contact.name_label")}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t("contact.name_placeholder")}
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full bg-neutral-900/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none focus:bg-red-900/10 transition-all font-mono text-sm placeholder:text-neutral-700"
                                    required
                                    disabled={status === 'sending'}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-orbitron tracking-widest text-red-500 mb-2 uppercase flex items-center gap-2">
                                    <Mail className="w-3 h-3" /> {t("contact.email_label")}
                                </label>
                                <input
                                    type="email"
                                    placeholder="contact@exemple.com"
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full bg-neutral-900/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none focus:bg-red-900/10 transition-all font-mono text-sm placeholder:text-neutral-700"
                                    required
                                    disabled={status === 'sending'}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-orbitron tracking-widest text-red-500 mb-2 uppercase flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> {t("contact.domain_label")}
                                </label>
                                <select
                                    value={formState.domain}
                                    onChange={(e) => setFormState({ ...formState, domain: e.target.value })}
                                    className="w-full bg-neutral-900/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none focus:bg-red-900/10 transition-all font-mono text-sm"
                                    disabled={status === 'sending'}
                                >
                                    <option value="" className="bg-black">{t("contact.domain_placeholder")}</option>
                                    <option value="design" className="bg-black">{t("contact.domain_design")}</option>
                                    <option value="web" className="bg-black">{t("contact.domain_web")}</option>
                                    <option value="automation" className="bg-black">{t("contact.domain_automation")}</option>
                                    <option value="other" className="bg-black">{t("contact.domain_other")}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-orbitron tracking-widest text-red-500 mb-2 uppercase flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> {t("contact.message_label")}
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder={t("contact.message_placeholder")}
                                    value={formState.message}
                                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                    className="w-full bg-neutral-900/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none focus:bg-red-900/10 transition-all font-mono text-sm placeholder:text-neutral-700 resize-none"
                                    required
                                    disabled={status === 'sending'}
                                />
                            </div>

                            <button
                                type="submit"
                                onMouseEnter={playHover}
                                disabled={status === 'sending' || status === 'success'}
                                className="w-full group relative py-4 bg-red-600 hover:bg-red-700 text-white font-heading font-bold tracking-widest uppercase rounded overflow-hidden transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                                <span className="relative flex items-center justify-center gap-3">
                                    {status === 'sending' ? t("contact.submit_sending") : t("contact.submit_idle")}
                                    {status !== 'sending' && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </span>
                            </button>

                            {status === 'error' && (
                                <p className="text-red-500 text-xs text-center font-mono mt-2">
                                    {t("contact.error")}
                                </p>
                            )}
                        </form>
                    </motion.div>

                    {/* Right: Direct Link & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col gap-8 justify-center h-full"
                    >
                        <div className="space-y-6">
                            <h3 className="font-heading text-xl text-white uppercase tracking-wider mb-6 border-l-4 border-red-500 pl-4">
                                {t("contact.options_title")}
                            </h3>

                            {/* WhatsApp Button */}
                            <a
                                href={`https://wa.me/${settings.whatsapp_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={playClick}
                                onMouseEnter={playHover}
                                className="block w-full group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded opacity-75 blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse-slow" />
                                <div className="relative flex items-center justify-between p-6 bg-black border border-emerald-500/30 rounded hover:border-emerald-500/80 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-500">
                                            <Zap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-emerald-500 font-bold font-heading tracking-wider uppercase text-sm mb-1">
                                                {t("contact.whatsapp_title")}
                                            </div>
                                            <div className="text-white font-mono text-xs">
                                                {t("contact.whatsapp_text")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-emerald-500 group-hover:translate-x-2 transition-transform">
                                        →
                                    </div>
                                </div>
                            </a>

                            {/* HUD Info Cards */}
                            <div className="grid gap-4">
                                <div className="flex items-center gap-4 p-4 border border-white/10 rounded bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                                    <div className="p-2 border border-white/10 rounded text-neutral-500 group-hover:text-red-500 group-hover:border-red-500 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-[10px] font-orbitron text-neutral-500 uppercase tracking-widest mb-1">{t("contact.mail_channel")}</div>
                                        <div className="font-mono text-white text-sm group-hover:text-red-400 transition-colors truncate">{settings.contact_email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border border-white/10 rounded bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                                    <div className="p-2 border border-white/10 rounded text-neutral-500 group-hover:text-red-500 group-hover:border-red-500 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-orbitron text-neutral-500 uppercase tracking-widest mb-1">{t("contact.voice_freq")}</div>
                                        <div className="font-mono text-white text-sm group-hover:text-red-400 transition-colors">{settings.contact_phone}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

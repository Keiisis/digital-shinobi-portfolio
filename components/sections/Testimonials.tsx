"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Star, MessageSquarePlus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { TestimonialModal } from "@/components/ui/TestimonialModal"
import { useLanguage } from "@/app/context/LanguageContext"
import { useExperience } from "@/app/context/ExperienceContext"

interface Testimonial {
    id: string
    name: string
    company: string
    role: string
    content: string
    avatar_url: string
    rating: number
}

export function Testimonials() {
    const [alliances, setAlliances] = useState<Testimonial[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { t } = useLanguage()
    const { playHover, playClick } = useExperience()

    useEffect(() => {
        const fetchTestimonials = async () => {
            const { data } = await supabase
                .from('testimonials')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: false })
                .limit(3)

            if (data) setAlliances(data)
        }
        fetchTestimonials()
    }, [])

    return (
        <section id="testimonials" className="py-24 relative overflow-hidden">
            {/* Ambient red glow bottom */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-24"
                >
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-[0.2em] mb-2 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {t("testimonials.title")}
                    </h2>
                    <p className="text-neutral-500 text-[10px] tracking-[0.5em] uppercase">{t("testimonials.subtitle")}</p>
                </motion.div>

                {alliances.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16">
                        {alliances.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.2 }}
                                className="relative pt-8 group"
                            >
                                {/* Bio Card SVG Frame */}
                                <div className="absolute inset-0 top-8 z-0">
                                    <svg className="w-full h-full" viewBox="0 0 300 400" preserveAspectRatio="none">
                                        <path
                                            d="M0,20 L20,0 L110,0 L120,10 L180,10 L190,0 L280,0 L300,20 L300,380 L280,400 L20,400 L0,380 Z"
                                            fill="rgba(10,10,10,0.6)"
                                            stroke="#E50914"
                                            strokeWidth="1"
                                            strokeOpacity="0.3"
                                            className="group-hover:stroke-opacity-100 group-hover:drop-shadow-[0_0_5px_rgba(229,9,20,0.5)] transition-all duration-500"
                                        />
                                        {/* Corner Details */}
                                        <path d="M0,50 L0,20 L20,0 L50,0" stroke="#E50914" strokeWidth="2" fill="none" />
                                        <path d="M300,50 L300,20 L280,0 L250,0" stroke="#E50914" strokeWidth="2" fill="none" />
                                        <path d="M0,350 L0,380 L20,400 L50,400" stroke="#E50914" strokeWidth="2" fill="none" />
                                        <path d="M300,350 L300,380 L280,400 L250,400" stroke="#E50914" strokeWidth="2" fill="none" />
                                    </svg>
                                </div>

                                {/* Content Content - Pushed down to sit inside frame */}
                                <div className="relative z-10 px-8 pb-12 pt-16 flex flex-col items-center text-center h-full">

                                    {/* Avatar - Breaking Top */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                        <div className="w-20 h-20 rounded-full p-1 bg-black border border-red-900/50 group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all duration-300">
                                            <img src={t.avatar_url || `https://ui-avatars.com/api/?name=${t.name}&background=random`} alt={t.name} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        </div>
                                    </div>

                                    <h4 className="font-heading font-bold text-white text-sm tracking-[0.2em] uppercase mb-1 mt-4">{t.name}</h4>
                                    <p className="text-[#E50914] text-[10px] font-bold uppercase mb-6 tracking-wider">{t.company}</p>

                                    <div className="flex gap-1 mb-6 text-[#E50914]">
                                        {[...Array(t.rating || 5)].map((_, i) => (
                                            <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                                        ))}
                                    </div>

                                    <p className="text-neutral-400 text-xs leading-relaxed font-subheading tracking-wide mb-8 line-clamp-6">
                                        "{t.content}"
                                    </p>

                                    {/* Bottom Tech Detail */}
                                    <div className="w-full flex justify-between items-center border-t border-red-900/30 pt-4 mt-auto">
                                        <span className="text-[9px] text-red-500 font-mono tracking-widest uppercase">{t.role || "Client"}</span>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                                            <div className="w-1 h-1 bg-red-900 rounded-full" />
                                            <div className="w-1 h-1 bg-red-900 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-neutral-500 mb-16 py-12 border border-dashed border-white/10 rounded">
                        {t("testimonials.empty")}
                    </div>
                )}

                <div className="flex justify-center">
                    <button
                        onClick={() => { playClick(); setIsModalOpen(true) }}
                        onMouseEnter={playHover}
                        className="group relative px-8 py-3 bg-transparent border border-white/20 hover:border-red-500 text-neutral-400 hover:text-white transition-all uppercase text-xs tracking-[0.2em] overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <MessageSquarePlus size={16} /> {t("testimonials.leave_review")}
                        </span>
                        <div className="absolute inset-0 bg-red-600/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    </button>
                </div>
            </div>

            <TestimonialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </section>
    )
}

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Monitor, PenTool, Cpu, Users, FileText, Video, Share2, Code, Zap, CheckCircle, Globe, Smartphone, Database, Lock, Server } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Map icon names to components (expanded list)
const iconMap: Record<string, any> = {
    Monitor, PenTool, Cpu, Users, FileText, Video, Share2,
    Code, Zap, CheckCircle, Globe, Smartphone, Database, Lock, Server
}

export function Skills() {
    const [skills, setSkills] = useState<any[]>([])

    useEffect(() => {
        const fetchSkills = async () => {
            const { data } = await supabase
                .from('skills')
                .select('*')
                .order('created_at', { ascending: true })

            if (data) setSkills(data)
        }
        fetchSkills()
    }, [])

    return (
        <section id="skills" className="py-16 relative flex flex-col items-center justify-center">
            <div className="container mx-auto px-4 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-[0.2em] mb-2 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        Mon Arsenal
                    </h2>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    {skills.map((skill, index) => {
                        const Icon = iconMap[skill.icon_name] || Code
                        const skillColor = skill.color || "text-[#E50914]"

                        return (
                            <motion.div
                                key={skill.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                className="group relative flex flex-col items-center cursor-pointer w-[100px] md:w-[120px]"
                            >
                                {/* Complex Tech Frame SVG */}
                                <div className="relative w-full aspect-square mb-4 flex items-center justify-center">
                                    <svg
                                        className={`absolute inset-0 w-full h-full ${skillColor} opacity-70 group-hover:opacity-100 transition-all duration-300 drop-shadow-[0_0_5px_currentColor]`}
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        {/* Main Hex-like shape with cutouts */}
                                        <path d="M15 5 H85 L95 25 V75 L85 95 H15 L5 75 V25 L15 5 Z" stroke="currentColor" strokeWidth="1.5" fill="rgba(0,0,0,0.5)" />

                                        {/* Inner Accent Lines */}
                                        <path d="M5 25 L15 5" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
                                        <path d="M95 25 L85 5" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
                                        <path d="M5 75 L15 95" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />
                                        <path d="M95 75 L85 95" stroke="currentColor" strokeWidth="3" strokeOpacity="0.5" />

                                        {/* Bottom Indicator */}
                                        <rect x="40" y="92" width="20" height="2" fill="currentColor" />
                                    </svg>

                                    {/* Icon with specific Glow */}
                                    <div className={`relative z-10 ${skillColor} filter drop-shadow-[0_0_8px_currentColor] group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon size={32} strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Text */}
                                <h3 className="font-heading text-[9px] md:text-[10px] font-bold tracking-wider text-center text-white uppercase leading-tight group-hover:text-primary transition-colors max-w-[80px]">
                                    {skill.name}
                                </h3>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Horizon Line with Central Blue Accent */}
                <div className="relative w-full h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent mt-12 flex justify-center items-center">
                    <div className="absolute w-1/2 h-full bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                    <div className="w-20 h-0.5 bg-blue-400 blur-[2px] rounded-full" />
                </div>
            </div>
        </section>
    )
}

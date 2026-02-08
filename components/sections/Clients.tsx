"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

interface Client {
    id: string
    name: string
    logo_url: string
    website: string
}

export function Clients() {
    const [clients, setClients] = useState<Client[]>([])

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false })

            if (data && data.length > 0) {
                setClients(data)
            }
        }
        fetchClients()
    }, [])

    if (clients.length === 0) return null

    // Duplicate list multiple times to ensure seamless infinite scroll regardless of screen width
    const marqueeClients = [...clients, ...clients, ...clients, ...clients]

    return (
        <section id="clients" className="py-24 bg-neutral-950 overflow-hidden relative border-t border-white/5">
            <div className="container mx-auto px-4 mb-16 text-center">
                <h3 className="text-red-600 font-heading tracking-[0.2em] text-sm uppercase mb-3 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                    CLANS & ORGANISATIONS
                </h3>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-white uppercase tracking-wider">
                    ILS ONT REJOINT LA MISSION
                </h2>
            </div>

            {/* Marquee Container */}
            <div className="relative flex w-full overflow-hidden mask-gradient-x py-10">
                {/* Gradient Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-neutral-950 to-transparent z-20 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-neutral-950 to-transparent z-20 pointer-events-none" />

                <motion.div
                    className="flex gap-16 md:gap-32 items-center flex-nowrap"
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: Math.max(20, clients.length * 5) // Intelligent speed based on count
                    }}
                    style={{ width: "fit-content" }}
                >
                    {marqueeClients.map((client, i) => (
                        <div
                            key={`${client.id}-${i}`}
                            className="flex-shrink-0 group relative cursor-pointer"
                        >
                            {client.logo_url ? (
                                <div className="h-16 w-32 md:h-20 md:w-48 flex items-center justify-center filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
                                    <img
                                        src={client.logo_url}
                                        alt={client.name}
                                        className="max-h-full max-w-full object-contain drop-shadow-[0_0_0_rgba(255,255,255,0)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                    />
                                </div>
                            ) : (
                                <span
                                    className="text-4xl md:text-5xl font-heading font-black text-transparent stroke-text group-hover:text-white transition-colors duration-500 opacity-40 group-hover:opacity-100"
                                    style={{ WebkitTextStroke: "1px #666" }}
                                >
                                    {client.name}
                                </span>
                            )}

                            {/* Hover Tooltip (Name) */}
                            {client.logo_url && (
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-red-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {client.name}
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Tech Decoration Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent mt-12" />
        </section>
    )
}

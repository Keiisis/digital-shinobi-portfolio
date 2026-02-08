"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ExternalLink, Github, Linkedin, Twitter, Instagram, Shield } from "lucide-react"

export function Footer() {
    const [socials, setSocials] = useState<any[]>([])

    // Placeholder for future dynamic socials if we add a table
    const socialLinks = [
        { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/in/keiis" },
        { name: "Instagram", icon: Instagram, href: "https://instagram.com/keiis.osiris" },
        { name: "GitHub", icon: Github, href: "https://github.com/keiis" },
        { name: "Twitter", icon: Twitter, href: "https://twitter.com/keiis_osiris" },
    ]

    return (
        <footer className="relative bg-neutral-950 border-t border-white/5 pt-16 pb-8 overflow-hidden">
            {/* Ambient effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-6">
                        <Link href="/" className="font-orbitron font-bold text-2xl tracking-widest text-white inline-block">
                            DIGITAL <span className="text-red-500 mx-1">{'>'}</span> SHINOBI
                        </Link>
                        <p className="text-neutral-400 text-sm max-w-sm font-light leading-relaxed">
                            Architecte digital spécialisé dans la création d'expériences web immersives et de systèmes automatisés. Votre vision, ma mission.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-red-500 hover:bg-red-900/10 transition-all duration-300 group"
                                >
                                    <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-heading text-white uppercase tracking-widest text-sm mb-6 border-l-2 border-red-500 pl-3">Navigation</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 font-mono">
                            <li><a href="#hero" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">AccueilBase</a></li>
                            <li><a href="#skills" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">Arsenal</a></li>
                            <li><a href="#portfolio" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">Missions</a></li>
                            <li><a href="#contact" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">Transmission</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-heading text-white uppercase tracking-widest text-sm mb-6 border-l-2 border-red-500 pl-3">Légal</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 font-mono">
                            <li>
                                <Link href="/mentions-legales" className="hover:text-red-500 transition-colors flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Mentions Légales
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="hover:text-red-500 transition-colors flex items-center gap-2">
                                    <ExternalLink className="w-3 h-3" /> Espace Kage
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-600 font-mono uppercase tracking-wider">
                    <p>© {new Date().getFullYear()} DIGITAL SHINOBI. Tous droits réservés.</p>
                    <p>Conçu & Développé par Kevin Chacha</p>
                </div>
            </div>
        </footer>
    )
}

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ExternalLink, Github, Linkedin, Twitter, Instagram, Shield } from "lucide-react"
import { useLanguage } from "@/app/context/LanguageContext"

interface SocialLink {
    name: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    key: string
}

export function Footer() {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
    const { t } = useLanguage()

    // Fetch social links from settings
    useEffect(() => {
        const fetchSocialLinks = async () => {
            const { data } = await supabase.from('site_settings').select('*')
            if (data) {
                const settings: Record<string, string> = {}
                data.forEach((item: any) => { settings[item.key] = item.value })

                // Build social links array from settings
                const links: SocialLink[] = []

                if (settings['social_linkedin']) {
                    links.push({
                        name: 'LinkedIn',
                        icon: Linkedin,
                        href: settings['social_linkedin'],
                        key: 'linkedin'
                    })
                }

                if (settings['social_instagram']) {
                    links.push({
                        name: 'Instagram',
                        icon: Instagram,
                        href: settings['social_instagram'],
                        key: 'instagram'
                    })
                }

                if (settings['social_github']) {
                    links.push({
                        name: 'GitHub',
                        icon: Github,
                        href: settings['social_github'],
                        key: 'github'
                    })
                }

                if (settings['social_twitter']) {
                    links.push({
                        name: 'Twitter',
                        icon: Twitter,
                        href: settings['social_twitter'],
                        key: 'twitter'
                    })
                }

                // If no links configured, use defaults
                if (links.length === 0) {
                    links.push(
                        { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/in/keiis", key: 'linkedin' },
                        { name: "Instagram", icon: Instagram, href: "https://instagram.com/keiis.osiris", key: 'instagram' },
                        { name: "GitHub", icon: Github, href: "https://github.com/keiis", key: 'github' },
                        { name: "Twitter", icon: Twitter, href: "https://twitter.com/keiis_osiris", key: 'twitter' }
                    )
                }

                setSocialLinks(links)
            }
        }

        fetchSocialLinks()

        // Listen for settings updates from admin panel
        const handleUpdates = () => fetchSocialLinks()
        window.addEventListener('settingsUpdated', handleUpdates)

        return () => {
            window.removeEventListener('settingsUpdated', handleUpdates)
        }
    }, [])

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
                            {t("footer.description")}
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.key}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-red-500 hover:bg-red-900/10 transition-all duration-300 group"
                                >
                                    <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-heading text-white uppercase tracking-widest text-sm mb-6 border-l-2 border-red-500 pl-3">{t("footer.nav.title")}</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 font-mono">
                            <li><a href="#hero" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">{t("nav.home")}</a></li>
                            <li><a href="#skills" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">{t("nav.skills")}</a></li>
                            <li><a href="#portfolio" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">{t("nav.portfolio")}</a></li>
                            <li><a href="#contact" className="hover:text-red-500 transition-colors hover:pl-2 duration-300 block">{t("nav.contact")}</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-heading text-white uppercase tracking-widest text-sm mb-6 border-l-2 border-red-500 pl-3">{t("footer.legal.title")}</h4>
                        <ul className="space-y-3 text-sm text-neutral-500 font-mono">
                            <li>
                                <Link href="/mentions-legales" className="hover:text-red-500 transition-colors flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> {t("footer.legal.mentions")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="hover:text-red-500 transition-colors flex items-center gap-2">
                                    <ExternalLink className="w-3 h-3" /> {t("footer.legal.admin")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-600 font-mono uppercase tracking-wider">
                    <p>© {new Date().getFullYear()} DIGITAL SHINOBI. {t("footer.rights")}</p>
                    <p>{t("footer.credit")}</p>
                </div>
            </div>
        </footer>
    )
}

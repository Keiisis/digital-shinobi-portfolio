"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Menu, X, Terminal, Cpu, Briefcase, Users, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"

const navItems = [
    { name: "Arsenal", to: "skills", icon: Cpu },
    { name: "Missions", to: "portfolio", icon: Briefcase },
    { name: "Alliés", to: "clients", icon: Users },
    { name: "Témoignages", to: "testimonials", icon: MessageSquare },
    { name: "Transmission", to: "contact", icon: Terminal },
]

export function CyberpunkNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Dynamic State
    const [siteLogo, setSiteLogo] = useState("")
    const [logoText, setLogoText] = useState("DS")
    const [titlePrimary, setTitlePrimary] = useState("DIGITAL")
    const [titleSecondary, setTitleSecondary] = useState("SHINOBI")
    const [ctaText, setCtaText] = useState("INITIATE")

    const [navigationItems, setNavigationItems] = useState(navItems)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener("scroll", handleScroll)

        // Fetch settings
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('*')
            if (data) {
                const settings: any = {}
                data.forEach((item: any) => settings[item.key] = item.value)

                if (settings['site_logo']) setSiteLogo(settings['site_logo'])
                if (settings['navbar_logo_short']) setLogoText(settings['navbar_logo_short'])
                if (settings['navbar_title_primary']) setTitlePrimary(settings['navbar_title_primary'])
                if (settings['navbar_title_secondary']) setTitleSecondary(settings['navbar_title_secondary'])
                if (settings['nav_cta_label']) setCtaText(settings['nav_cta_label'])

                // Update Nav Links
                setNavigationItems(prevItems => prevItems.map((item, index) => {
                    const key = `nav_link_${index + 1}_label`
                    return settings[key] ? { ...item, name: settings[key] } : item
                }))
            }
        }
        fetchSettings()

        // Listen for updates
        const handleUpdates = () => fetchSettings()
        window.addEventListener('settingsUpdated', handleUpdates)

        return () => {
            window.removeEventListener("scroll", handleScroll)
            window.removeEventListener('settingsUpdated', handleUpdates)
        }
    }, [])

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsOpen(false)
        }
    }

    return (
        <>
            {/* Desktop & Mobile Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                    scrolled
                        ? "bg-black/80 backdrop-blur-md border-red-900/20 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                        : "bg-transparent py-8"
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Logo Area */}
                    <div
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="relative w-10 h-10 overflow-hidden rounded transform group-hover:rotate-12 transition-transform duration-300">
                            {siteLogo ? (
                                <img src={siteLogo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-red-600 to-black flex items-center justify-center border border-red-500">
                                    <span className="font-orbitron font-bold text-white text-xs">{logoText}</span>
                                </div>
                            )}
                            {/* Glitch Overlay */}
                            <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-orbitron font-bold text-white tracking-widest text-lg leading-none group-hover:text-red-500 transition-colors">
                                {titlePrimary}
                            </span>
                            <span className="font-rajdhani font-semibold text-neutral-500 text-xs tracking-[0.3em] uppercase group-hover:text-white transition-colors">
                                {titleSecondary}
                            </span>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-1">
                        {navigationItems.map((item, index) => (
                            <button
                                key={item.name}
                                onClick={() => scrollToSection(item.to)}
                                className="relative px-6 py-2 group overflow-hidden"
                            >
                                <span className="relative z-10 font-rajdhani font-bold text-sm tracking-widest text-neutral-400 group-hover:text-white uppercase transition-colors">
                                    {item.name}
                                </span>
                                {/* Hover Effect - Cyberpunk Underline */}
                                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right group-hover:origin-left" />
                                {/* Hover Effect - Background Glow */}
                                <span className="absolute inset-0 bg-red-600/5 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />
                            </button>
                        ))}

                        <button
                            className="ml-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-orbitron font-bold text-xs tracking-widest skew-x-[-10deg] border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transition-all"
                            onClick={() => scrollToSection('contact')}
                        >
                            <span className="skew-x-[10deg] block">{ctaText}</span>
                        </button>

                        {/* Language Switcher */}
                        <div className="ml-4">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-8 h-8 text-red-500" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center border-l border-red-900/30"
                    >
                        {/* Background Deco */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px]" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 blur-[100px]" />
                        </div>

                        <div className="flex flex-col gap-8 w-full px-12">
                            {navigationItems.map((item, index) => (
                                <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => scrollToSection(item.to)}
                                    className="flex items-center gap-6 group w-full text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-neutral-900/50 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:bg-red-900/20 transition-all">
                                        <item.icon className="w-6 h-6 text-neutral-500 group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-orbitron font-bold text-2xl text-white tracking-wider group-hover:text-red-500 transition-colors">
                                            {item.name}
                                        </span>
                                        <span className="text-[10px] font-mono text-neutral-600 group-hover:text-neutral-400">
                                            // 0{index + 1} LINK
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { Menu, X, Terminal, Cpu, Briefcase, Users, MessageSquare, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useLanguage } from "@/app/context/LanguageContext"
import { useModal } from "@/app/context/ModalContext"
import { useExperience } from "@/app/context/ExperienceContext"

export function CyberpunkNavbar() {
    const [scrolled, setScrolled] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const { t } = useLanguage()
    const { isProjectModalOpen } = useModal()
    const { playHover, playClick, toggleAudio, isAudioPlaying } = useExperience()

    // Dynamic State
    const [siteLogo, setSiteLogo] = useState("")
    const [logoText, setLogoText] = useState("DS")
    const [titlePrimary, setTitlePrimary] = useState("DIGITAL")
    const [titleSecondary, setTitleSecondary] = useState("SHINOBI")
    // For CTA text, if user customized it in DB, we use that. Else use translation.
    const [customCtaText, setCustomCtaText] = useState("")

    // We keep track of custom labels from DB
    const [customNavLabels, setCustomNavLabels] = useState<{ [key: string]: string }>({})

    const navItems = [
        { key: "nav.skills", to: "skills", icon: Cpu },
        { key: "nav.portfolio", to: "portfolio", icon: Briefcase },
        { key: "nav.clients", to: "clients", icon: Users },
        { key: "nav.testimonials", to: "testimonials", icon: MessageSquare },
        { key: "nav.contact", to: "contact", icon: Terminal },
    ]

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
                if (settings['nav_cta_label']) setCustomCtaText(settings['nav_cta_label'])

                // Update Nav Links Custom Labels
                const newCustomLabels: { [key: string]: string } = {}
                navItems.forEach((item, index) => {
                    const key = `nav_link_${index + 1}_label`
                    if (settings[key]) {
                        newCustomLabels[item.key] = settings[key]
                    }
                })
                setCustomNavLabels(newCustomLabels)
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
        playClick()
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsOpen(false)
        }
    }

    // Hide navbar on mobile when project modal is open
    if (isProjectModalOpen) {
        return null
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
                        onClick={() => { playClick(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        onMouseEnter={playHover}
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
                        {/* Audio Toggle */}
                        <button
                            onClick={() => { playClick(); toggleAudio(); }}
                            onMouseEnter={playHover}
                            className="p-2 text-neutral-400 hover:text-red-500 transition-colors mr-2 relative group"
                            title={isAudioPlaying ? "Mute Atmosphere" : "Play Atmosphere"}
                        >
                            {isAudioPlaying ? (
                                <div className="relative">
                                    <Volume2 className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
                                </div>
                            ) : (
                                <VolumeX className="w-5 h-5" />
                            )}
                        </button>

                        {navItems.map((item, index) => (
                            <button
                                key={item.key}
                                onClick={() => scrollToSection(item.to)}
                                onMouseEnter={playHover}
                                className="relative px-6 py-2 group overflow-hidden"
                            >
                                <span className="relative z-10 font-rajdhani font-bold text-sm tracking-widest text-neutral-400 group-hover:text-white uppercase transition-colors">
                                    {customNavLabels[item.key] || t(item.key)}
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
                            onMouseEnter={playHover}
                        >
                            <span className="skew-x-[10deg] block">{customCtaText || t("nav.cta")}</span>
                        </button>

                        {/* Language Switcher */}
                        <div className="ml-4">
                            <LanguageSwitcher />
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        {/* Mobile Audio Toggle */}
                        <button
                            onClick={() => { playClick(); toggleAudio(); }}
                            className="text-neutral-400 hover:text-red-500 transition-colors"
                        >
                            {isAudioPlaying ? <Volume2 className="w-6 h-6 text-red-500" /> : <VolumeX className="w-6 h-6" />}
                        </button>

                        <button
                            className="text-white p-2"
                            onClick={() => { playClick(); setIsOpen(!isOpen) }}
                        >
                            {isOpen ? <X className="w-8 h-8 text-red-500" /> : <Menu className="w-8 h-8" />}
                        </button>
                    </div>
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
                            {navItems.map((item, index) => (
                                <motion.button
                                    key={item.key}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => scrollToSection(item.to)}
                                    // Removed playHover here as it might be annoying on scroll/touch
                                    className="flex items-center gap-6 group w-full text-left"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-neutral-900/50 border border-white/10 flex items-center justify-center group-hover:border-red-500/50 group-hover:bg-red-900/20 transition-all">
                                        <item.icon className="w-6 h-6 text-neutral-500 group-hover:text-red-500 transition-colors" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-orbitron font-bold text-2xl text-white tracking-wider group-hover:text-red-500 transition-colors">
                                            {customNavLabels[item.key] || t(item.key)}
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

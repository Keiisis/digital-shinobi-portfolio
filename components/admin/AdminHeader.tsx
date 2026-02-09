"use client"

import { Bell, ChevronDown, LogOut, User, Menu } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const router = useRouter()

    // Dynamic State
    const [siteName, setSiteName] = useState("DIGITAL SHINOBI")
    const [siteLogo, setSiteLogo] = useState("")
    const [adminProfile, setAdminProfile] = useState({
        username: "KEVIN CHACHA",
        email: "",
        avatar_url: ""
    })

    useEffect(() => {
        const fetchHeaderData = async () => {
            // Fetch Site Settings
            const { data: settings } = await supabase.from('site_settings').select('*')
            if (settings) {
                const s: any = {}
                settings.forEach(item => s[item.key] = item.value)
                if (s.site_name) setSiteName(s.site_name)
                if (s.site_logo) setSiteLogo(s.site_logo)
            }

            // Fetch User Profile
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setAdminProfile({
                    username: user.user_metadata?.username || "ADMIN KAGE",
                    email: user.email || "",
                    avatar_url: user.user_metadata?.avatar_url || ""
                })
            }
        }

        fetchHeaderData()

        // Listen for updates from Settings Page
        const handleSettingsUpdate = () => fetchHeaderData()
        const handleProfileUpdate = () => fetchHeaderData()

        window.addEventListener('settingsUpdated', handleSettingsUpdate)
        window.addEventListener('profileUpdated', handleProfileUpdate)

        return () => {
            window.removeEventListener('settingsUpdated', handleSettingsUpdate)
            window.removeEventListener('profileUpdated', handleProfileUpdate)
        }
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/10 bg-black/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
            {/* Logo Area */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors mr-2"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/" className="flex items-center gap-3 group">
                    {siteLogo ? (
                        <img src={siteLogo} alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain group-hover:scale-110 transition-transform" />
                    ) : null}
                    <div className="font-orbitron font-bold text-sm md:text-2xl tracking-widest text-white whitespace-nowrap">
                        {siteName.split(' ')[0]} <span className="text-red-500 mx-1">{'>'}</span> {siteName.split(' ').slice(1).join(' ')}
                    </div>
                </Link>
            </div>

            {/* Profile Area */}
            <div className="flex items-center gap-4 md:gap-8">
                <div className="hidden md:block">
                    <LanguageSwitcher />
                </div>

                <div className="relative z-50">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-4 text-right hover:bg-white/5 p-2 rounded-lg transition-colors group"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-800 border-2 border-red-900/50 overflow-hidden relative group-hover:border-red-500 transition-colors">
                                <img
                                    src={adminProfile.avatar_url || `https://ui-avatars.com/api/?name=${adminProfile.username}&background=random`}
                                    alt="Admin"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                        </div>
                        <div className="hidden md:block">
                            <div className="font-orbitron font-bold text-white tracking-widest leading-none mb-1 group-hover:text-red-500 transition-colors uppercase cursor-pointer">
                                {adminProfile.username}
                            </div>
                            <div className="font-rajdhani font-medium text-red-500 text-xs tracking-wider uppercase">SHINOBI LEVEL 99</div>
                        </div>
                        <div className={`w-8 h-8 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 bg-red-500 text-white' : 'group-hover:bg-red-500/10'}`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 top-full mt-2 w-64 bg-neutral-900/95 backdrop-blur-xl border border-red-500/20 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden py-1"
                            >
                                <div className="px-4 py-4 border-b border-white/5 md:hidden">
                                    <div className="font-orbitron font-bold text-white tracking-widest leading-none mb-1 uppercase">
                                        {adminProfile.username}
                                    </div>
                                    <div className="font-rajdhani font-medium text-red-500 text-xs tracking-wider uppercase mb-2">SHINOBI LEVEL 99</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Langue</span>
                                        <LanguageSwitcher />
                                    </div>
                                </div>

                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Connecté en tant que</p>
                                    <p className="text-xs text-white truncate font-mono mt-1">{adminProfile.email}</p>
                                </div>
                                <Link
                                    href="/admin/settings?tab=PROFILE"
                                    onClick={() => setIsProfileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white transition-colors group/profile"
                                >
                                    <div className="relative">
                                        <User className="w-4 h-4 group-hover/profile:text-red-500 transition-colors" />
                                        <div className="absolute inset-0 bg-red-500/50 blur opacity-0 group-hover/profile:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="font-bold tracking-wide group-hover/profile:translate-x-1 transition-transform">MON PROFIL</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-950/30 transition-colors border-t border-white/5"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-bold tracking-wide">DÉCONNEXION</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}

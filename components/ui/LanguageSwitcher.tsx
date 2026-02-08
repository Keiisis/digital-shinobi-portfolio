"use client"

import { useLanguage } from "@/app/context/LanguageContext"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Check } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-full hover:bg-white/10 transition-colors backdrop-blur-sm group"
            >
                <Globe className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                <span className="text-xs font-mono text-neutral-300 uppercase">{language}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden"
                    >
                        <div className="p-1">
                            <div className="text-[10px] uppercase text-neutral-500 font-bold px-3 py-2 border-b border-white/5 tracking-wider">
                                Select Frequency
                            </div>
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as any)
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-white/10 rounded-lg transition-colors",
                                        language === lang.code ? "text-white bg-white/5" : "text-neutral-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-base">{lang.flag}</span>
                                        <span className="font-rajdhani font-medium">{lang.label}</span>
                                    </div>
                                    {language === lang.code && <Check className="w-3 h-3 text-red-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

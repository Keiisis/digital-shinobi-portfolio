"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, ChevronDown, Check } from "lucide-react"
import { useLanguage } from "@/app/context/LanguageContext"

export function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false)
    const { language, setLanguage, languages, isLoading } = useLanguage()

    const currentLanguage = languages.find(l => l.code === language) || languages[0]

    if (isLoading || !currentLanguage) {
        return (
            <div className="w-10 h-10 bg-white/5 rounded-full animate-pulse" />
        )
    }

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full hover:border-red-500/50 transition-colors group"
            >
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="text-xs font-mono text-neutral-400 hidden md:block uppercase">
                    {currentLanguage.code}
                </span>
                <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                        >
                            <div className="p-2">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-wider px-3 py-2 flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    Langue / Language
                                </div>

                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as any)
                                            setIsOpen(false)
                                        }}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                            transition-colors text-left
                                            ${language === lang.code
                                                ? 'bg-red-600/20 text-white'
                                                : 'hover:bg-white/5 text-neutral-400 hover:text-white'
                                            }
                                        `}
                                    >
                                        <span className="text-lg">{lang.flag}</span>
                                        <span className="flex-1 text-sm">{lang.name}</span>
                                        {language === lang.code && (
                                            <Check className="w-4 h-4 text-red-500" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Language {
    code: string
    name: string
    flag: string
    is_default: boolean
}

interface TranslationContextType {
    locale: string
    setLocale: (locale: string) => void
    t: (key: string, fallback?: string) => string
    languages: Language[]
    isLoading: boolean
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

// Cache for translations
const translationCache: Record<string, Record<string, string>> = {}

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState('fr')
    const [translations, setTranslations] = useState<Record<string, string>>({})
    const [languages, setLanguages] = useState<Language[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Load languages
    useEffect(() => {
        const loadLanguages = async () => {
            const { data } = await supabase
                .from('languages')
                .select('*')
                .eq('is_active', true)
                .order('is_default', { ascending: false })

            if (data) {
                setLanguages(data)
                // Set default language
                const defaultLang = data.find(l => l.is_default)
                if (defaultLang) {
                    // Check localStorage for saved preference
                    const saved = localStorage.getItem('shinobi_locale')
                    setLocaleState(saved || defaultLang.code)
                }
            }
        }
        loadLanguages()
    }, [])

    // Load translations for current locale
    useEffect(() => {
        const loadTranslations = async () => {
            // Check cache first
            if (translationCache[locale]) {
                setTranslations(translationCache[locale])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            const { data } = await supabase
                .from('translations')
                .select('key, value')
                .eq('locale', locale)

            if (data) {
                const translationMap: Record<string, string> = {}
                data.forEach(item => {
                    translationMap[item.key] = item.value
                })
                translationCache[locale] = translationMap
                setTranslations(translationMap)
            }
            setIsLoading(false)
        }

        loadTranslations()
    }, [locale])

    // Set locale and save to localStorage
    const setLocale = useCallback((newLocale: string) => {
        localStorage.setItem('shinobi_locale', newLocale)
        setLocaleState(newLocale)
    }, [])

    // Translation function
    const t = useCallback((key: string, fallback?: string): string => {
        return translations[key] || fallback || key
    }, [translations])

    return (
        <TranslationContext.Provider value={{ locale, setLocale, t, languages, isLoading }}>
            {children}
        </TranslationContext.Provider>
    )
}

// Hook to use translations
export function useTranslation() {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error('useTranslation must be used within TranslationProvider')
    }
    return context
}

// Hook for translating dynamic content (project descriptions, etc.)
export function useAutoTranslate() {
    const { locale } = useTranslation()

    const translateText = useCallback(async (text: string, targetLocale?: string): Promise<string> => {
        const target = targetLocale || locale
        if (target === 'fr') return text // French is original, no translation needed

        try {
            // Use LibreTranslate API (free, no API key needed for small usage)
            const response = await fetch('https://libretranslate.com/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q: text,
                    source: 'fr',
                    target: target,
                    format: 'text'
                })
            })

            if (response.ok) {
                const data = await response.json()
                return data.translatedText
            }
        } catch (error) {
            console.error('Translation error:', error)
        }

        return text // Return original if translation fails
    }, [locale])

    return { translateText }
}

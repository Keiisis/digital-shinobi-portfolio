"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

type Language = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt'

interface LanguageInfo {
    code: string
    name: string
    flag: string
    is_active: boolean
}

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string, fallback?: string) => string
    languages: LanguageInfo[]
    isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Fallback translations (static, for when DB is unavailable)
const fallbackTranslations: Record<Language, Record<string, string>> = {
    fr: {
        "nav.home": "Accueil",
        "nav.skills": "Arsenal",
        "nav.portfolio": "Missions",
        "nav.clients": "Clients",
        "nav.testimonials": "Témoignages",
        "nav.contact": "Contact",
        "hero.greeting": "Hello, Je suis",
        "hero.role": "Architecte du Digital",
        "hero.tagline": "System Online",
        "hero.cta_explore": "Explorer",
        "hero.cta_contact": "Me Contacter",
        "hero.scroll": "Scroll to Initialize",
        "skills.title": "Mon Arsenal",
        "portfolio.title": "Mes Missions",
        "portfolio.all": "Tout",
        "portfolio.empty": "Aucune mission trouvée dans cette catégorie.",
        "leaderboard.title": "Top Missions",
        "leaderboard.subtitle": "Les projets les plus populaires",
        "clients.title": "Ils m'ont fait confiance",
        "testimonials.title": "Témoignages",
        "contact.title": "Me Contacter",
        "contact.name": "Nom",
        "contact.email": "Email",
        "contact.message": "Message",
        "contact.send": "Envoyer",
        "common.loading": "Chargement...",
        "common.views": "vues",
        "common.reactions": "réactions",
        "login.title": "Accès Sécurisé",
        "login.identity": "Identité (Email ou Username)",
        "login.key": "Clé de Sécurité",
        "login.submit": "Initialiser Connexion",
        "login.error": "Accès Refusé. Identifiants Invalides.",
    },
    en: {
        "nav.home": "Home",
        "nav.skills": "Arsenal",
        "nav.portfolio": "Missions",
        "nav.clients": "Clients",
        "nav.testimonials": "Testimonials",
        "nav.contact": "Contact",
        "hero.greeting": "Hello, I am",
        "hero.role": "Digital Architect",
        "hero.tagline": "System Online",
        "hero.cta_explore": "Explore",
        "hero.cta_contact": "Contact Me",
        "hero.scroll": "Scroll to Initialize",
        "skills.title": "My Arsenal",
        "portfolio.title": "My Missions",
        "portfolio.all": "All",
        "portfolio.empty": "No missions found in this category.",
        "leaderboard.title": "Top Missions",
        "leaderboard.subtitle": "Most popular projects",
        "clients.title": "They Trusted Me",
        "testimonials.title": "Testimonials",
        "contact.title": "Contact Me",
        "contact.name": "Name",
        "contact.email": "Email",
        "contact.message": "Message",
        "contact.send": "Send",
        "common.loading": "Loading...",
        "common.views": "views",
        "common.reactions": "reactions",
        "login.title": "Secure Access",
        "login.identity": "Identity (Email or Username)",
        "login.key": "Security Key",
        "login.submit": "Initiate Connection",
        "login.error": "Access Denied. Invalid Credentials.",
    },
    es: {
        "nav.home": "Inicio",
        "nav.skills": "Arsenal",
        "nav.portfolio": "Misiones",
        "nav.clients": "Clientes",
        "nav.testimonials": "Testimonios",
        "nav.contact": "Contacto",
        "hero.greeting": "Hola, Soy",
        "hero.role": "Arquitecto Digital",
        "hero.tagline": "Sistema Activo",
        "hero.cta_explore": "Explorar",
        "hero.cta_contact": "Contáctame",
        "hero.scroll": "Desplázate para Iniciar",
        "skills.title": "Mi Arsenal",
        "portfolio.title": "Mis Misiones",
        "portfolio.all": "Todo",
        "portfolio.empty": "No se encontraron misiones en esta categoría.",
        "leaderboard.title": "Top Misiones",
        "leaderboard.subtitle": "Proyectos más populares",
        "clients.title": "Confiaron en Mí",
        "testimonials.title": "Testimonios",
        "contact.title": "Contáctame",
        "contact.name": "Nombre",
        "contact.email": "Correo",
        "contact.message": "Mensaje",
        "contact.send": "Enviar",
        "common.loading": "Cargando...",
        "common.views": "vistas",
        "common.reactions": "reacciones",
        "login.title": "Acceso Seguro",
        "login.identity": "Identidad (Email o Usuario)",
        "login.key": "Clave de Seguridad",
        "login.submit": "Iniciar Conexión",
        "login.error": "Acceso Denegado. Credenciales Inválidas.",
    },
    de: {
        "nav.home": "Startseite",
        "nav.skills": "Arsenal",
        "nav.portfolio": "Missionen",
        "nav.clients": "Kunden",
        "nav.testimonials": "Referenzen",
        "nav.contact": "Kontakt",
        "hero.greeting": "Hallo, Ich bin",
        "hero.role": "Digitaler Architekt",
        "hero.tagline": "System Online",
        "hero.cta_explore": "Entdecken",
        "hero.cta_contact": "Kontaktieren",
        "hero.scroll": "Scrollen zum Starten",
        "skills.title": "Mein Arsenal",
        "portfolio.title": "Meine Missionen",
        "portfolio.all": "Alle",
        "portfolio.empty": "Keine Missionen in dieser Kategorie gefunden.",
        "leaderboard.title": "Top Missionen",
        "leaderboard.subtitle": "Beliebteste Projekte",
        "clients.title": "Sie haben mir vertraut",
        "testimonials.title": "Referenzen",
        "contact.title": "Kontaktieren Sie mich",
        "contact.name": "Name",
        "contact.email": "E-Mail",
        "contact.message": "Nachricht",
        "contact.send": "Senden",
        "common.loading": "Wird geladen...",
        "common.views": "Ansichten",
        "common.reactions": "Reaktionen",
        "login.title": "Sicherer Zugang",
        "login.identity": "Identität (Email oder Benutzername)",
        "login.key": "Sicherheitsschlüssel",
        "login.submit": "Verbindung starten",
        "login.error": "Zugriff Verweigert. Ungültige Anmeldedaten.",
    },
    it: {
        "nav.home": "Home",
        "nav.skills": "Arsenale",
        "nav.portfolio": "Missioni",
        "nav.clients": "Clienti",
        "nav.testimonials": "Testimonianze",
        "nav.contact": "Contatto",
        "hero.greeting": "Ciao, Sono",
        "hero.role": "Architetto Digitale",
        "hero.tagline": "Sistema Online",
        "hero.cta_explore": "Esplora",
        "hero.cta_contact": "Contattami",
        "hero.scroll": "Scorri per Iniziare",
        "skills.title": "Il Mio Arsenale",
        "portfolio.title": "Le Mie Missioni",
        "portfolio.all": "Tutto",
        "portfolio.empty": "Nessuna missione trovata in questa categoria.",
        "leaderboard.title": "Top Missioni",
        "leaderboard.subtitle": "Progetti più popolari",
        "clients.title": "Si sono fidati di me",
        "testimonials.title": "Testimonianze",
        "contact.title": "Contattami",
        "contact.name": "Nome",
        "contact.email": "Email",
        "contact.message": "Messaggio",
        "contact.send": "Invia",
        "common.loading": "Caricamento...",
        "common.views": "visualizzazioni",
        "common.reactions": "reazioni",
        "login.title": "Accesso Sicuro",
        "login.identity": "Identità (Email o Nome Utente)",
        "login.key": "Chiave di Sicurezza",
        "login.submit": "Inizializzare Connessione",
        "login.error": "Accesso Negato. Credenziali non valide.",
    },
    pt: {
        "nav.home": "Início",
        "nav.skills": "Arsenal",
        "nav.portfolio": "Missões",
        "nav.clients": "Clientes",
        "nav.testimonials": "Depoimentos",
        "nav.contact": "Contato",
        "hero.greeting": "Olá, Eu sou",
        "hero.role": "Arquiteto Digital",
        "hero.tagline": "Sistema Online",
        "hero.cta_explore": "Explorar",
        "hero.cta_contact": "Contate-me",
        "hero.scroll": "Role para Iniciar",
        "skills.title": "Meu Arsenal",
        "portfolio.title": "Minhas Missões",
        "portfolio.all": "Tudo",
        "portfolio.empty": "Nenhuma missão encontrada nesta categoria.",
        "leaderboard.title": "Top Missões",
        "leaderboard.subtitle": "Projetos mais populares",
        "clients.title": "Eles confiaram em mim",
        "testimonials.title": "Depoimentos",
        "contact.title": "Contate-me",
        "contact.name": "Nome",
        "contact.email": "Email",
        "contact.message": "Mensagem",
        "contact.send": "Enviar",
        "common.loading": "Carregando...",
        "common.views": "visualizações",
        "common.reactions": "reações",
        "login.title": "Acesso Seguro",
        "login.identity": "Identidade (Email ou Nome de Usuário)",
        "login.key": "Chave de Segurança",
        "login.submit": "Iniciar Conexão",
        "login.error": "Acesso Negado. Credenciais Inválidas.",
    }
}

// Default languages info
const defaultLanguages: LanguageInfo[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', is_active: true },
    { code: 'en', name: 'English', flag: '🇬🇧', is_active: true },
    { code: 'es', name: 'Español', flag: '🇪🇸', is_active: true },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', is_active: false },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', is_active: false },
    { code: 'pt', name: 'Português', flag: '🇵🇹', is_active: false },
]

// Translation cache
const dbTranslationCache: Record<string, Record<string, string>> = {}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('fr')
    const [dbTranslations, setDbTranslations] = useState<Record<string, string>>({})
    const [languages, setLanguages] = useState<LanguageInfo[]>(defaultLanguages)
    const [isLoading, setIsLoading] = useState(true)

    // Load available languages from DB
    useEffect(() => {
        const loadLanguages = async () => {
            try {
                const { data } = await supabase
                    .from('languages')
                    .select('code, name, flag, is_active')
                    .eq('is_active', true)

                if (data && data.length > 0) {
                    setLanguages(data)
                }
            } catch (error) {
                console.log('Using default languages')
            }
        }
        loadLanguages()
    }, [])

    // Load saved language preference
    useEffect(() => {
        const savedLang = localStorage.getItem('shinobi_locale') as Language
        if (savedLang && Object.keys(fallbackTranslations).includes(savedLang)) {
            setLanguageState(savedLang)
        }
    }, [])

    // Load translations from DB for current language
    useEffect(() => {
        const loadTranslations = async () => {
            // Check cache first
            if (dbTranslationCache[language]) {
                setDbTranslations(dbTranslationCache[language])
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                const { data } = await supabase
                    .from('translations')
                    .select('key, value')
                    .eq('locale', language)

                if (data && data.length > 0) {
                    const translationMap: Record<string, string> = {}
                    data.forEach(item => {
                        translationMap[item.key] = item.value
                    })
                    dbTranslationCache[language] = translationMap
                    setDbTranslations(translationMap)
                }
            } catch (error) {
                console.log('Using fallback translations')
            }
            setIsLoading(false)
        }
        loadTranslations()
    }, [language])

    // Set language and save to localStorage
    const setLanguage = useCallback((lang: Language) => {
        localStorage.setItem('shinobi_locale', lang)
        setLanguageState(lang)
    }, [])

    // Translation function - DB translations take priority, then fallback
    const t = useCallback((key: string, fallback?: string): string => {
        // First check DB translations
        if (dbTranslations[key]) {
            return dbTranslations[key]
        }
        // Then check fallback translations
        if (fallbackTranslations[language]?.[key]) {
            return fallbackTranslations[language][key]
        }
        // Return fallback or key
        return fallback || key
    }, [dbTranslations, language])

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
        languages,
        isLoading
    }), [language, setLanguage, t, languages, isLoading])

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider")
    return context
}

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
        "nav.clients": "Alliés",
        "nav.testimonials": "Témoignages",
        "nav.contact": "Transmission",
        "nav.cta": "INITIER",
        "hero.greeting": "Hello, Je suis",
        "hero.role": "Architecte du Digital",
        "hero.tagline": "System Online",
        "hero.system_online": "Système En Ligne",
        "hero.explore": "EXPLORER",
        "hero.contact": "ME CONTACTER",
        "hero.cta_explore": "Explorer",
        "hero.cta_contact": "Me Contacter",
        "hero.scroll": "Scroll pour Initialiser",
        "skills.title": "Mon Arsenal",
        "portfolio.title": "Mes Missions",
        "portfolio.all": "Tout",
        "portfolio.empty": "Aucune mission trouvée dans cette catégorie.",
        "portfolio.view_project": "Voir le projet",
        "portfolio.no_description": "Aucune description disponible pour ce projet.",
        "leaderboard.title": "Top Missions",
        "leaderboard.subtitle": "Les projets les plus populaires",
        "clients.subtitle": "CLANS & ORGANISATIONS",
        "clients.title": "ILS ONT REJOINT LA MISSION",
        "testimonials.title": "ÉCHOS DU TERRAIN",
        "testimonials.subtitle": "RETOURS DE MISSION & TÉMOIGNAGES",
        "testimonials.empty": "Aucun témoignage visible pour le moment.",
        "testimonials.leave_review": "Laisser un avis",
        "testimonials.form.title": "Votre Alliance Compte",
        "testimonials.form.subtitle": "Rejoignez le clan des partenaires satisfaits. Votre témoignage sera affiché après validation par le Kage.",
        "testimonials.form.success.title": "Transmission Reçue",
        "testimonials.form.success.message": "Merci pour votre alliance. Votre témoignage est en cours de décryptage (validation).",
        "testimonials.form.success.button": "Envoyer une autre transmission",
        "testimonials.form.name": "Identité (Nom Complet)",
        "testimonials.form.project": "Projet Réalisé",
        "testimonials.form.role": "Role (Optionnel)",
        "testimonials.form.company": "Entreprise (Optionnel)",
        "testimonials.form.message": "Votre Témoignage",
        "testimonials.form.photo": "Photo (Optionnel)",
        "testimonials.form.rating": "Note",
        "testimonials.form.submit": "SOUMETTRE L'ALLIANCE",
        "testimonials.form.submitting": "ENVOI...",
        "contact.title": "Canal Sécurisé",
        "contact.subtitle": "UPLINK DE TRANSMISSION PRÊT",
        "contact.success_title": "Transmission Reçue",
        "contact.success_text": "Le Kage a reçu votre message crypté.",
        "contact.name_label": "Identité du Séndeur",
        "contact.name_placeholder": "Nom & Prénom",
        "contact.email_label": "Email de Contact",
        "contact.domain_label": "Domaine de Mission",
        "contact.domain_placeholder": "Séléctionner une fréquence...",
        "contact.domain_design": "Design Graphique",
        "contact.domain_web": "Développement Web",
        "contact.domain_automation": "Automatisation",
        "contact.domain_other": "Autre (Classifié)",
        "contact.message_label": "Données Cryptées",
        "contact.message_placeholder": "Votre message...",
        "contact.submit_sending": "CRYPTAGE EN COURS...",
        "contact.submit_idle": "INITIALISER UPLINK",
        "contact.error": "ERREUR CRITIQUE. Le canal est brouillé. Réessayez.",
        "contact.options_title": "Options de Connexion",
        "contact.whatsapp_title": "Liaison Directe",
        "contact.whatsapp_text": "Rejoindre le signal WhatsApp",
        "contact.mail_channel": "Canal Mail",
        "contact.voice_freq": "Fréquence Vocale",
        "footer.description": "Architecte digital spécialisé dans la création d'expériences web immersives et de systèmes automatisés. Votre vision, ma mission.",
        "footer.nav.title": "Navigation",
        "footer.legal.title": "Légal",
        "footer.legal.mentions": "Mentions Légales",
        "footer.legal.admin": "Espace Kage",
        "footer.rights": "Tous droits réservés.",
        "footer.credit": "Conçu & Développé par Kevin Chacha",
        "common.loading": "Chargement...",
        "common.views": "vues",
        "common.reactions": "réactions",
        "login.title": "Accès Sécurisé",
        "login.identity": "Identité (Email ou Username)",
        "login.key": "Clé de Sécurité",
        "login.submit": "Initialiser Connexion",
        "login.error": "Accès Refusé. Identifiants Invalides.",
        "assistant.call.active": "Appel en cours...",
        "assistant.chat.active": "Système de chat actif",
        "assistant.welcome.title": "AKWABA !",
        "assistant.welcome.text": "Je suis l'assistant personnel de Kevin. Je connais parfaitement ses projets et sa technologie. Comment puis-je vous aider ?",
        "assistant.call.start": "Passer un Appel Vocal",
        "assistant.visitor": "Visiteur",
        "assistant.typing": "L'assistant traite votre demande...",
        "assistant.input.placeholder": "Tapez votre message ici...",
        "assistant.secure": "COMMUNICATION SÉCURISÉE",
        "assistant.listening": "Dites quelque chose...",
        "assistant.mic.hint": "Appuyez sur le micro pour parler",
        "assistant.chat.back": "Retour au chat textuel",
        "assistant.call.tooltip": "Appel avec Assistant",
        "assistant.speech.welcome": "Bonjour au nom de Kevin CHACHA ! Je suis {name}. Content d'entendre votre voix. Comment puis-je vous aider aujourd'hui ?",
    },
    en: {
        "nav.home": "Home",
        "nav.skills": "Arsenal",
        "nav.portfolio": "Missions",
        "nav.clients": "Allies",
        "nav.testimonials": "Testimonials",
        "nav.contact": "Transmission",
        "nav.cta": "INITIATE",
        "hero.greeting": "Hello, I am",
        "hero.role": "Digital Architect",
        "hero.tagline": "System Online",
        "hero.system_online": "System Online",
        "hero.explore": "EXPLORE",
        "hero.contact": "CONTACT ME",
        "hero.cta_explore": "Explore",
        "hero.cta_contact": "Contact Me",
        "hero.scroll": "Scroll to Initialize",
        "skills.title": "My Arsenal",
        "portfolio.title": "My Missions",
        "portfolio.all": "All",
        "portfolio.empty": "No missions found in this category.",
        "portfolio.view_project": "View Project",
        "portfolio.no_description": "No description available for this project.",
        "leaderboard.title": "Top Missions",
        "leaderboard.subtitle": "Most popular projects",
        "clients.subtitle": "CLANS & ORGANIZATIONS",
        "clients.title": "THEY JOINED THE MISSION",
        "testimonials.title": "FIELD ECHOES",
        "testimonials.subtitle": "MISSION REPORTS & TESTIMONIALS",
        "testimonials.empty": "No testimonials visible at the moment.",
        "testimonials.leave_review": "Leave a Review",
        "testimonials.form.title": "Your Alliance Matters",
        "testimonials.form.subtitle": "Join the clan of satisfied partners. Your testimonial will be displayed after validation by the Kage.",
        "testimonials.form.success.title": "Transmission Received",
        "testimonials.form.success.message": "Thank you for your alliance. Your testimonial is being decrypted (validated).",
        "testimonials.form.success.button": "Send another transmission",
        "testimonials.form.name": "Identity (Full Name)",
        "testimonials.form.project": "Project Realized",
        "testimonials.form.role": "Role (Optional)",
        "testimonials.form.company": "Company (Optional)",
        "testimonials.form.message": "Your Testimonial",
        "testimonials.form.photo": "Photo (Optional)",
        "testimonials.form.rating": "Rating",
        "testimonials.form.submit": "SUBMIT ALLIANCE",
        "testimonials.form.submitting": "SENDING...",
        "contact.title": "Secure Channel",
        "contact.subtitle": "TRANSMISSION UPLINK READY",
        "contact.success_title": "Transmission Received",
        "contact.success_text": "The Kage has received your encrypted message.",
        "contact.name_label": "Sender Identity",
        "contact.name_placeholder": "Name & Surname",
        "contact.email_label": "Contact Email",
        "contact.domain_label": "Mission Domain",
        "contact.domain_placeholder": "Select a frequency...",
        "contact.domain_design": "Graphic Design",
        "contact.domain_web": "Web Development",
        "contact.domain_automation": "Automation",
        "contact.domain_other": "Other (Classified)",
        "contact.message_label": "Encrypted Data",
        "contact.message_placeholder": "Your message...",
        "contact.submit_sending": "ENCRYPTING...",
        "contact.submit_idle": "INITIATE UPLINK",
        "contact.error": "CRITICAL ERROR. Channel jammed. Retry.",
        "contact.options_title": "Connection Options",
        "contact.whatsapp_title": "Direct Link",
        "contact.whatsapp_text": "Join WhatsApp Signal",
        "contact.mail_channel": "Mail Channel",
        "contact.voice_freq": "Voice Frequency",
        "footer.description": "Digital architect specialized in creating immersive web experiences and automated systems. Your vision, my mission.",
        "footer.nav.title": "Navigation",
        "footer.legal.title": "Legal",
        "footer.legal.mentions": "Legal Mentions",
        "footer.legal.admin": "Kage Space",
        "footer.rights": "All rights reserved.",
        "footer.credit": "Designed & Developed by Kevin Chacha",
        "common.loading": "Loading...",
        "common.views": "views",
        "common.reactions": "reactions",
        "login.title": "Secure Access",
        "login.identity": "Identity (Email or Username)",
        "login.key": "Security Key",
        "login.submit": "Initiate Connection",
        "login.error": "Access Denied. Invalid Credentials.",
        "assistant.call.active": "Call in progress...",
        "assistant.chat.active": "Chat System Active",
        "assistant.welcome.title": "WELCOME !",
        "assistant.welcome.text": "I am Kevin's personal assistant. I know his projects and technology perfectly. How can I help you?",
        "assistant.call.start": "Start Voice Call",
        "assistant.visitor": "Visitor",
        "assistant.typing": "Assistant is processing...",
        "assistant.input.placeholder": "Type your message here...",
        "assistant.secure": "SECURE COMMUNICATION",
        "assistant.listening": "Say something...",
        "assistant.mic.hint": "Tap mic to speak",
        "assistant.chat.back": "Back to Text Chat",
        "assistant.call.tooltip": "Call Assistant",
        "assistant.speech.welcome": "Hello on behalf of Kevin CHACHA! I am {name}. Glad to hear your voice. How can I help you today?",
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
        // Then check local fallback translations for current language
        if (fallbackTranslations[language]?.[key]) {
            return fallbackTranslations[language][key]
        }
        // Fallback to French (default) if not found in current language
        if (fallbackTranslations['fr']?.[key]) {
            return fallbackTranslations['fr'][key]
        }
        // Return provided fallback or key
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

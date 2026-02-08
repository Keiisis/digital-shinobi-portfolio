"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'fr' | 'en' | 'es' | 'de' | 'it'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
    fr: {
        "nav.home": "Accueil",
        "nav.skills": "Compétences",
        "nav.portfolio": "Missions",
        "nav.contact": "Contact",
        "hero.greeting": "Hello, Je suis",
        "hero.role": "Architecte du Digital",
        "login.title": "Accès Sécurisé",
        "login.identity": "Identité (Email ou Username)",
        "login.key": "Clé de Sécurité",
        "login.submit": "Initialiser Connexion",
        "login.error": "Accès Refusé. Identifiants Invalides.",
    },
    en: {
        "nav.home": "Home",
        "nav.skills": "Skills",
        "nav.portfolio": "Missions",
        "nav.contact": "Contact",
        "hero.greeting": "Hello, I am",
        "hero.role": "Digital Architect",
        "login.title": "Secure Access",
        "login.identity": "Identity (Email or Username)",
        "login.key": "Security Key",
        "login.submit": "Initiate Connection",
        "login.error": "Access Denied. Invalid Credentials.",
    },
    es: {
        "nav.home": "Inicio",
        "nav.skills": "Habilidades",
        "nav.portfolio": "Misiones",
        "nav.contact": "Contacto",
        "hero.greeting": "Hola, Soy",
        "hero.role": "Arquitecto Digital",
        "login.title": "Acceso Seguro",
        "login.identity": "Identidad (Email o Usuario)",
        "login.key": "Clave de Seguridad",
        "login.submit": "Iniciar Conexión",
        "login.error": "Acceso Denegado. Credenciales Inválidas.",
    },
    de: {
        "nav.home": "Startseite",
        "nav.skills": "Fähigkeiten",
        "nav.portfolio": "Missionen",
        "nav.contact": "Kontakt",
        "hero.greeting": "Hallo, Ich bin",
        "hero.role": "Digitaler Architekt",
        "login.title": "Sicherer Zugang",
        "login.identity": "Identität (Email oder Benutzername)",
        "login.key": "Sicherheitsschlüssel",
        "login.submit": "Verbindung Initialisieren",
        "login.error": "Zugriff Verweigert. Ungültige Anmeldeinformationen.",
    },
    it: {
        "nav.home": "Home",
        "nav.skills": "Abilità",
        "nav.portfolio": "Missioni",
        "nav.contact": "Contatto",
        "hero.greeting": "Ciao, Sono",
        "hero.role": "Architetto Digitale",
        "login.title": "Accesso Sicuro",
        "login.identity": "Identità (Email o Nome Utente)",
        "login.key": "Chiave di Sicurezza",
        "login.submit": "Inizializzare Connessione",
        "login.error": "Accesso Negato. Credenziali Non Valide.",
    }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('fr')

    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language
        if (savedLang) setLanguage(savedLang)
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('language', lang)
    }

    const t = (key: string) => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider")
    return context
}

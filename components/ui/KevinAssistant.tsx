"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Phone, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot, Sparkles, PhoneOff, ShieldCheck, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/app/context/LanguageContext"
import { useExperience } from "@/app/context/ExperienceContext"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

// Fallback translations (in case Supabase translations aren't loaded)
const fallbackTranslations: Record<string, Record<string, string>> = {
    fr: {
        "assistant.welcome.title": "Bienvenue, Visiteur",
        "assistant.welcome.text": "Je suis l'assistant de Kevin. Posez-moi vos questions !",
        "assistant.call.start": "Démarrer l'appel",
        "assistant.call.active": "Appel en cours",
        "assistant.chat.active": "En ligne",
        "assistant.chat.back": "Retour au chat",
        "assistant.typing": "En train d'écrire...",
        "assistant.listening": "Je vous écoute...",
        "assistant.secure": "Connexion sécurisée",
        "assistant.visitor": "Vous",
        "assistant.input.placeholder": "Écrivez votre message...",
        "assistant.call.tooltip": "Appeler l'assistant",
        "assistant.speech.welcome": "Bonjour ! Je suis {name}, l'assistant virtuel de Kevin. Comment puis-je vous aider ?",
        "assistant.mic.hint": "Parlez maintenant...",
        "assistant.muted": "Micro désactivé",
        "assistant.permission.title": "Autorisation requise",
        "assistant.permission.text": "Pour utiliser l'assistant vocal, veuillez autoriser l'accès au microphone.",
        "assistant.permission.button": "Autoriser le microphone",
        "assistant.permission.denied": "Accès au microphone refusé",
        "assistant.permission.denied.text": "Veuillez autoriser le microphone dans les paramètres de votre navigateur.",
        "assistant.not.supported": "Non supporté",
        "assistant.not.supported.text": "La reconnaissance vocale n'est pas disponible sur ce navigateur. Essayez Chrome ou Edge.",
    },
    en: {
        "assistant.welcome.title": "Welcome, Visitor",
        "assistant.welcome.text": "I'm Kevin's assistant. Ask me anything!",
        "assistant.call.start": "Start call",
        "assistant.call.active": "Call active",
        "assistant.chat.active": "Online",
        "assistant.chat.back": "Back to chat",
        "assistant.typing": "Typing...",
        "assistant.listening": "I'm listening...",
        "assistant.secure": "Secure connection",
        "assistant.visitor": "You",
        "assistant.input.placeholder": "Type your message...",
        "assistant.call.tooltip": "Call assistant",
        "assistant.speech.welcome": "Hello! I'm {name}, Kevin's virtual assistant. How can I help you?",
        "assistant.mic.hint": "Speak now...",
        "assistant.muted": "Mic muted",
        "assistant.permission.title": "Permission required",
        "assistant.permission.text": "To use the voice assistant, please allow microphone access.",
        "assistant.permission.button": "Allow microphone",
        "assistant.permission.denied": "Microphone access denied",
        "assistant.permission.denied.text": "Please allow the microphone in your browser settings.",
        "assistant.not.supported": "Not supported",
        "assistant.not.supported.text": "Voice recognition is not available on this browser. Try Chrome or Edge.",
    }
}

// Get speech locale
const getSpeechLocale = (lang: string): string => {
    const locales: Record<string, string> = {
        'en': 'en-US', 'es': 'es-ES', 'de': 'de-DE',
        'it': 'it-IT', 'pt': 'pt-BR', 'fr': 'fr-FR'
    }
    return locales[lang] || 'fr-FR'
}

type PermissionStatus = 'unknown' | 'granted' | 'denied' | 'prompt' | 'unsupported'

export function KevinAssistant() {
    // UI State
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<'chat' | 'voice'>('chat')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [isCalling, setIsCalling] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isSpeakerOn, setIsSpeakerOn] = useState(true)
    const [visitorId, setVisitorId] = useState("")
    const [settings, setSettings] = useState<any>(null)
    const [micPermission, setMicPermission] = useState<PermissionStatus>('unknown')
    const [isRequestingPermission, setIsRequestingPermission] = useState(false)

    // Refs
    const scrollRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const isProcessingRef = useRef(false)
    const modeRef = useRef<'chat' | 'voice'>('chat')
    const isMutedRef = useRef(false)

    const { language } = useLanguage()
    const { playHover, playClick } = useExperience()

    // Helper function with fallback
    const getText = useCallback((key: string): string => {
        // Use fallback translations
        const langFallback = fallbackTranslations[language] || fallbackTranslations['fr']
        return langFallback[key] || fallbackTranslations['fr'][key] || key
    }, [language])

    // Keep refs in sync
    useEffect(() => { modeRef.current = mode }, [mode])
    useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

    // Initialize visitor ID and settings
    useEffect(() => {
        const init = async () => {
            let vid = localStorage.getItem('shinobi_visitor_id')
            if (!vid) {
                vid = 'vis_' + Math.random().toString(36).substring(7)
                localStorage.setItem('shinobi_visitor_id', vid)
            }
            setVisitorId(vid)

            const { data } = await supabase.from('assistant_settings').select('*').single()
            if (data) setSettings(data)
        }
        init()
    }, [])

    // Check browser support and permission status
    useEffect(() => {
        if (typeof window === 'undefined') return

        synthRef.current = window.speechSynthesis

        // Check if Speech Recognition is supported
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognitionAPI) {
            setMicPermission('unsupported')
            return
        }

        // Check current permission status
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' as PermissionName })
                .then((result) => {
                    if (result.state === 'granted') setMicPermission('granted')
                    else if (result.state === 'denied') setMicPermission('denied')
                    else setMicPermission('prompt')

                    // Listen for changes
                    result.onchange = () => {
                        if (result.state === 'granted') setMicPermission('granted')
                        else if (result.state === 'denied') setMicPermission('denied')
                    }
                })
                .catch(() => setMicPermission('prompt'))
        } else {
            setMicPermission('prompt')
        }
    }, [])

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    // Initialize Speech Recognition
    const initRecognition = useCallback(() => {
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognitionAPI) return null

        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.maxAlternatives = 1
        recognition.lang = getSpeechLocale(language)

        recognition.onstart = () => {
            console.log('[Voice] 🎤 Started listening')
            setIsListening(true)
        }

        recognition.onend = () => {
            console.log('[Voice] 🔇 Stopped listening')
            setIsListening(false)
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            console.log('[Voice] 📝 Heard:', transcript)
            if (transcript.trim()) {
                processVoiceInput(transcript)
            }
        }

        recognition.onerror = (event: any) => {
            console.error('[Voice] ❌ Error:', event.error)
            setIsListening(false)

            if (event.error === 'not-allowed') {
                setMicPermission('denied')
            } else if (event.error === 'no-speech') {
                // Restart if still in voice mode
                setTimeout(() => {
                    if (modeRef.current === 'voice' && !isMutedRef.current && !isProcessingRef.current) {
                        startListening()
                    }
                }, 500)
            }
        }

        return recognition
    }, [language])

    // Request microphone permission
    const requestMicPermission = async () => {
        setIsRequestingPermission(true)

        try {
            // This triggers the browser's permission dialog
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(track => track.stop()) // Stop immediately, we just needed permission

            setMicPermission('granted')

            // Initialize recognition after permission granted
            recognitionRef.current = initRecognition()

            return true
        } catch (error: any) {
            console.error('[Voice] Permission error:', error)
            if (error.name === 'NotAllowedError') {
                setMicPermission('denied')
            }
            return false
        } finally {
            setIsRequestingPermission(false)
        }
    }

    // Start listening
    const startListening = useCallback(() => {
        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition()
        }
        if (!recognitionRef.current || isMutedRef.current || isProcessingRef.current) return

        try {
            recognitionRef.current.lang = getSpeechLocale(language)
            recognitionRef.current.start()
        } catch (e: any) {
            if (e.name !== 'InvalidStateError') {
                console.error('[Voice] Start error:', e)
            }
        }
    }, [language, initRecognition])

    // Stop listening
    const stopListening = useCallback(() => {
        if (!recognitionRef.current) return
        try {
            recognitionRef.current.stop()
        } catch (e) { }
        setIsListening(false)
    }, [])

    // Speak text
    const speak = useCallback((text: string, onComplete?: () => void) => {
        if (!synthRef.current || !isSpeakerOn) {
            onComplete?.()
            return
        }

        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const locale = getSpeechLocale(language)
        utterance.lang = locale

        const voices = synthRef.current.getVoices()
        const preferredVoice = voices.find(v =>
            v.lang === locale && (v.name.includes('Google') || v.name.includes('Microsoft'))
        ) || voices.find(v => v.lang.startsWith(language))

        if (preferredVoice) utterance.voice = preferredVoice
        utterance.pitch = 0.95
        utterance.rate = 1.0

        utterance.onend = () => {
            console.log('[Voice] 🔊 Speech done')
            onComplete?.()
        }

        utterance.onerror = () => onComplete?.()

        synthRef.current.speak(utterance)
    }, [isSpeakerOn, language])

    // Process voice input
    const processVoiceInput = async (text: string) => {
        if (!text.trim() || isProcessingRef.current) return

        isProcessingRef.current = true
        stopListening()

        const userMsg: Message = { role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        try {
            const response = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    visitorId,
                    type: 'voice',
                    language
                })
            })

            const data = await response.json()
            const assistantMsg: Message = { role: 'assistant', content: data.message }
            setMessages(prev => [...prev, assistantMsg])

            // Speak response then restart listening
            speak(data.message, () => {
                isProcessingRef.current = false
                if (modeRef.current === 'voice' && !isMutedRef.current) {
                    setTimeout(() => startListening(), 300)
                }
            })
        } catch (error) {
            console.error('[Voice] API error:', error)
            isProcessingRef.current = false
            if (modeRef.current === 'voice' && !isMutedRef.current) {
                setTimeout(() => startListening(), 300)
            }
        } finally {
            setIsTyping(false)
        }
    }

    // Handle chat message
    const handleSendMessage = async (text: string) => {
        playClick()
        if (!text.trim()) return

        const userMsg: Message = { role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        try {
            const response = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    visitorId,
                    type: 'chat',
                    language
                })
            })

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur s'est produite." }])
        } finally {
            setIsTyping(false)
        }
    }

    // Start voice call
    const startCall = async () => {
        playClick()
        // Handle unsupported browser
        if (micPermission === 'unsupported') {
            setIsOpen(true)
            setMode('voice')
            return
        }

        // If permission not granted, request it first
        if (micPermission !== 'granted') {
            const granted = await requestMicPermission()
            if (!granted) {
                setIsOpen(true)
                setMode('voice')
                return
            }
        }

        // Permission granted - start the call
        setIsOpen(true)
        setMode('voice')
        setIsCalling(true)
        setIsMuted(false)

        // Initialize recognition if needed
        if (!recognitionRef.current) {
            recognitionRef.current = initRecognition()
        }

        // Welcome message then start listening
        const welcome = getText("assistant.speech.welcome").replace("{name}", settings?.name || 'Kevin')

        speak(welcome, () => {
            console.log('[Voice] Welcome done, starting listening')
            startListening()
        })
    }

    // End call
    const endCall = () => {
        playClick()
        setIsCalling(false)
        setMode('chat')
        stopListening()
        if (synthRef.current) synthRef.current.cancel()
        isProcessingRef.current = false
    }

    // Toggle mute
    const toggleMute = () => {
        playClick()
        if (isMuted) {
            setIsMuted(false)
            startListening()
        } else {
            setIsMuted(true)
            stopListening()
        }
    }

    // Render permission screen for voice mode
    const renderPermissionScreen = () => {
        if (micPermission === 'unsupported') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/30">
                        <AlertTriangle className="w-10 h-10 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                        {getText("assistant.not.supported")}
                    </h3>
                    <p className="text-sm text-neutral-400 mb-6 max-w-xs">
                        {getText("assistant.not.supported.text")}
                    </p>
                    <button
                        onClick={() => setMode('chat')}
                        className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all"
                    >
                        {getText("assistant.chat.back")}
                    </button>
                </div>
            )
        }

        if (micPermission === 'denied') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/30">
                        <MicOff className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                        {getText("assistant.permission.denied")}
                    </h3>
                    <p className="text-sm text-neutral-400 mb-6 max-w-xs">
                        {getText("assistant.permission.denied.text")}
                    </p>
                    <button
                        onClick={() => setMode('chat')}
                        className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all"
                    >
                        {getText("assistant.chat.back")}
                    </button>
                </div>
            )
        }

        // Prompt for permission
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-red-900/20 flex items-center justify-center mb-6 border border-red-500/30"
                >
                    <Mic className="w-12 h-12 text-red-500" />
                </motion.div>
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">
                    {getText("assistant.permission.title")}
                </h3>
                <p className="text-sm text-neutral-400 mb-8 max-w-xs">
                    {getText("assistant.permission.text")}
                </p>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { playClick(); requestMicPermission() }}
                    disabled={isRequestingPermission}
                    onMouseEnter={playHover}
                    className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 flex items-center gap-3"
                >
                    {isRequestingPermission ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <ShieldCheck className="w-5 h-5" />
                    )}
                    {getText("assistant.permission.button")}
                </motion.button>
                <button
                    onClick={() => setMode('chat')}
                    className="mt-4 text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    {getText("assistant.chat.back")}
                </button>
            </div>
        )
    }

    // Render active call UI
    const renderActiveCall = () => (
        <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-10 bg-gradient-to-b from-black to-[#0a0a0a]">
            <div className="text-center space-y-2">
                <h3 className="text-xl md:text-2xl font-orbitron font-bold text-white tracking-wider italic">
                    {settings?.name || 'Kevin'}
                </h3>
                <p className="text-[10px] md:text-xs text-red-500 font-mono flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                    {getText("assistant.secure")}
                </p>
            </div>

            {/* Voice Visualizer */}
            <div className="relative flex items-center justify-center my-6">
                <motion.div
                    animate={{
                        scale: isListening ? [1, 1.15, 1] : 1,
                        opacity: isListening ? [0.3, 0.6, 0.3] : 0.2
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-36 h-36 md:w-44 md:h-44 rounded-full bg-red-600"
                />
                <motion.div
                    animate={{
                        scale: isListening ? [1, 1.3, 1] : 1,
                        opacity: isListening ? [0.1, 0.3, 0.1] : 0.1
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute w-48 h-48 md:w-60 md:h-60 rounded-full bg-red-600"
                />

                <div className={cn(
                    "w-24 h-24 md:w-28 md:h-28 rounded-full bg-neutral-900 border-4 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)] z-10 transition-all duration-500",
                    isListening ? "border-green-500" : "border-red-600"
                )}>
                    <div className="flex items-center gap-1 h-8">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: isListening || isTyping ? [8, 28, 8] : 3 }}
                                transition={{ repeat: Infinity, duration: 0.4, delay: i * 0.08 }}
                                className={cn("w-1.5 rounded-full", isListening ? "bg-green-500" : "bg-red-600")}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center space-y-4 w-full">
                <p className="text-xs md:text-sm text-neutral-400 font-rajdhani italic min-h-[20px]">
                    {isTyping ? getText("assistant.typing") :
                        isListening ? getText("assistant.listening") :
                            isMuted ? getText("assistant.muted") :
                                getText("assistant.mic.hint")}
                </p>

                {/* Call Controls */}
                <div className="flex items-center justify-center gap-4 md:gap-6 pt-2">
                    <button
                        onClick={toggleMute}
                        onMouseEnter={playHover}
                        className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
                            isMuted ? "bg-white text-red-600" : "bg-neutral-800 text-white hover:bg-neutral-700"
                        )}
                    >
                        {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>


                    <button
                        onClick={endCall}
                        onMouseEnter={playHover}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E60000] text-white flex items-center justify-center hover:bg-red-700 shadow-2xl shadow-red-600/30 active:scale-95 transition-all"
                    >
                        <PhoneOff className="w-8 h-8 md:w-10 md:h-10" />
                    </button>

                    <button
                        onClick={() => { playClick(); setIsSpeakerOn(!isSpeakerOn) }}
                        onMouseEnter={playHover}
                        className={cn(
                            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
                            !isSpeakerOn ? "bg-white text-red-600" : "bg-neutral-800 text-white hover:bg-neutral-700"
                        )}
                    >
                        {isSpeakerOn ? <Volume2 className="w-5 h-5 md:w-6 md:h-6" /> : <VolumeX className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                </div>

                <button
                    onClick={() => { endCall(); setMode('chat') }}
                    className="text-[9px] md:text-[10px] text-neutral-600 uppercase tracking-widest font-bold hover:text-white transition-colors flex items-center gap-2 mx-auto mt-2"
                >
                    <MessageSquare className="w-3 h-3" /> {getText("assistant.chat.back")}
                </button>
            </div>
        </div>
    )

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-20 md:bottom-24 right-0 w-[92vw] md:w-[400px] h-[70vh] md:h-[550px] max-h-[600px] bg-neutral-900 border border-red-500/30 rounded-2xl md:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-5 bg-gradient-to-r from-[#8B0000] to-[#E60000] flex items-center justify-between shadow-lg shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 border border-white/20 flex items-center justify-center relative">
                                    <Bot className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-[#8B0000]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-orbitron font-bold text-white text-xs md:text-sm tracking-wider">
                                        {settings?.name || 'Kevin Assistant'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[9px] md:text-[10px] text-red-100 uppercase tracking-wider font-bold">
                                            {mode === 'voice' ? getText("assistant.call.active") : getText("assistant.chat.active")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { playClick(); setIsOpen(false) }} className="p-2 hover:bg-black/20 text-white rounded-full transition-colors">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-[#080808]">
                            {mode === 'chat' ? (
                                <>
                                    <div ref={scrollRef} className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 custom-scrollbar pb-20">
                                        {messages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-5">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600/5 flex items-center justify-center border border-red-600/20">
                                                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-orbitron text-red-500 font-bold text-base md:text-lg italic">
                                                        "{getText("assistant.welcome.title")}"
                                                    </h4>
                                                    <p className="text-xs md:text-sm text-neutral-400 font-rajdhani">
                                                        {getText("assistant.welcome.text")}
                                                    </p>
                                                </div>
                                                {micPermission !== 'unsupported' && (
                                                    <button
                                                        onClick={startCall}
                                                        onMouseEnter={playHover}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 border border-red-600/30 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest"
                                                    >
                                                        <Phone className="w-4 h-4" /> {getText("assistant.call.start")}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {messages.map((m, i) => (
                                            <div key={i} className={cn("flex flex-col mb-3", m.role === 'user' ? "items-end" : "items-start")}>
                                                <div className={cn(
                                                    "max-w-[85%] p-3 md:p-4 rounded-2xl text-xs md:text-[13px] leading-relaxed shadow-md",
                                                    m.role === 'user'
                                                        ? "bg-red-600 text-white rounded-tr-none"
                                                        : "bg-neutral-800/80 text-neutral-200 rounded-tl-none border border-white/5"
                                                )}>
                                                    {m.content}
                                                </div>
                                                <span className="text-[8px] text-neutral-600 mt-1 uppercase font-mono">
                                                    {m.role === 'user' ? getText("assistant.visitor") : (settings?.name || 'Assistant')}
                                                </span>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex items-center gap-2 text-neutral-500 text-xs bg-neutral-900/40 p-3 rounded-2xl w-fit border border-white/5">
                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                {getText("assistant.typing")}
                                            </div>
                                        )}
                                    </div>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input) }}
                                        className="p-3 md:p-4 border-t border-white/5 bg-black/80 backdrop-blur-lg flex items-center gap-2 absolute bottom-0 left-0 right-0"
                                    >
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={getText("assistant.input.placeholder")}
                                            className="flex-1 bg-neutral-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-neutral-600"
                                        />
                                        <button type="submit" onMouseEnter={playHover} className="w-10 h-10 flex items-center justify-center bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                /* Voice Mode */
                                (micPermission === 'granted' && isCalling)
                                    ? renderActiveCall()
                                    : renderPermissionScreen()
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Buttons */}
            <div className="flex flex-col gap-2 md:gap-3">
                {!isOpen && micPermission !== 'unsupported' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={startCall}
                        onMouseEnter={playHover}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-red-600 shadow-2xl flex items-center justify-center border-2 border-red-600 relative"
                        title={getText("assistant.call.tooltip")}
                    >
                        <Phone className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full">
                            <span className="absolute inset-0 animate-ping bg-red-600 rounded-full opacity-75" />
                        </span>
                    </motion.button>
                )}

                <motion.button
                    onClick={() => { playClick(); setIsOpen(!isOpen) }}
                    onMouseEnter={playHover}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center transition-all duration-500 border-2 border-white/10",
                        isOpen ? "bg-white text-red-600 rotate-90" : "bg-[#E60000] text-white"
                    )}
                >
                    {isOpen ? <X className="w-6 h-6 md:w-8 md:h-8" /> : (
                        <div className="relative">
                            <Bot className="w-7 h-7 md:w-9 md:h-9" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white text-red-600 rounded-full flex items-center justify-center border-2 border-[#E60000]">
                                <MessageSquare className="w-2 h-2" />
                            </div>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    )
}

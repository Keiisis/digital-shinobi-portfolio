"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Phone, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot, Sparkles, PhoneOff, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/app/context/LanguageContext"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

// Helper to get locale for speech API
const getSpeechLocale = (lang: string): string => {
    const locales: Record<string, string> = {
        'en': 'en-US',
        'es': 'es-ES',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-BR',
        'fr': 'fr-FR'
    }
    return locales[lang] || 'fr-FR'
}

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
    const [error, setError] = useState<string | null>(null)
    const [voiceSupported, setVoiceSupported] = useState(true)

    // Refs for speech APIs
    const scrollRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const isProcessingRef = useRef(false)
    const modeRef = useRef<'chat' | 'voice'>('chat')
    const isMutedRef = useRef(false)

    const { t, language } = useLanguage()

    // Keep refs in sync with state
    useEffect(() => {
        modeRef.current = mode
    }, [mode])

    useEffect(() => {
        isMutedRef.current = isMuted
    }, [isMuted])

    // Initialize visitor ID and settings
    useEffect(() => {
        const init = async () => {
            // Get or create visitor ID
            let vid = localStorage.getItem('shinobi_visitor_id')
            if (!vid) {
                vid = 'vis_' + Math.random().toString(36).substring(7)
                localStorage.setItem('shinobi_visitor_id', vid)
            }
            setVisitorId(vid)

            // Load assistant settings
            const { data } = await supabase.from('assistant_settings').select('*').single()
            if (data) setSettings(data)
        }
        init()
    }, [])

    // Initialize Speech APIs
    useEffect(() => {
        if (typeof window === 'undefined') return

        // Initialize Speech Synthesis
        synthRef.current = window.speechSynthesis

        // Initialize Speech Recognition
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            console.warn('[Voice] Speech Recognition not supported')
            setVoiceSupported(false)
            return
        }

        try {
            const recognition = new SpeechRecognitionAPI()
            recognition.continuous = false
            recognition.interimResults = false
            recognition.maxAlternatives = 1
            recognition.lang = getSpeechLocale(language)

            recognition.onstart = () => {
                console.log('[Voice] 🎤 Listening started')
                setIsListening(true)
                setError(null)
            }

            recognition.onend = () => {
                console.log('[Voice] 🔇 Listening ended')
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
                    setError(t("assistant.error.mic_permission"))
                    setVoiceSupported(false)
                } else if (event.error === 'no-speech') {
                    // Restart listening if still in voice mode
                    restartListening()
                } else if (event.error !== 'aborted') {
                    setError(`Erreur: ${event.error}`)
                }
            }

            recognitionRef.current = recognition
            console.log('[Voice] ✅ Speech Recognition initialized')
        } catch (e) {
            console.error('[Voice] Failed to initialize:', e)
            setVoiceSupported(false)
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort() } catch (e) { }
            }
            if (synthRef.current) {
                synthRef.current.cancel()
            }
        }
    }, [language])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    // Restart listening helper
    const restartListening = () => {
        if (!recognitionRef.current || isMutedRef.current || isProcessingRef.current) return
        if (modeRef.current !== 'voice') return

        setTimeout(() => {
            try {
                recognitionRef.current?.start()
            } catch (e) {
                // Already running
            }
        }, 500)
    }

    // Start listening
    const startListening = () => {
        if (!recognitionRef.current) {
            setError("Reconnaissance vocale non disponible")
            return
        }
        if (isMuted || isProcessingRef.current) return

        try {
            recognitionRef.current.lang = getSpeechLocale(language)
            recognitionRef.current.start()
            console.log('[Voice] 🎙️ Starting recognition...')
        } catch (e: any) {
            if (e.name !== 'InvalidStateError') {
                console.error('[Voice] Start failed:', e)
            }
        }
    }

    // Stop listening
    const stopListening = () => {
        if (!recognitionRef.current) return
        try {
            recognitionRef.current.stop()
        } catch (e) { }
        setIsListening(false)
    }

    // Speak text with callback
    const speak = (text: string, onComplete?: () => void) => {
        if (!synthRef.current) {
            onComplete?.()
            return
        }

        if (!isSpeakerOn) {
            onComplete?.()
            return
        }

        // Cancel any current speech
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        const locale = getSpeechLocale(language)
        utterance.lang = locale

        // Find the best voice
        const voices = synthRef.current.getVoices()
        const preferredVoice = voices.find(v =>
            v.lang === locale && (v.name.includes('Google') || v.name.includes('Microsoft'))
        ) || voices.find(v => v.lang.startsWith(language))

        if (preferredVoice) utterance.voice = preferredVoice
        utterance.pitch = 0.95
        utterance.rate = 1.0

        utterance.onend = () => {
            console.log('[Voice] 🔊 Speech completed')
            onComplete?.()
        }

        utterance.onerror = () => {
            console.error('[Voice] Speech error')
            onComplete?.()
        }

        synthRef.current.speak(utterance)
    }

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
                    restartListening()
                }
            })
        } catch (error) {
            console.error('[Voice] API error:', error)
            isProcessingRef.current = false
            restartListening()
        } finally {
            setIsTyping(false)
        }
    }

    // Handle chat message submit
    const handleSendMessage = async (text: string) => {
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
            setMessages(prev => [...prev, { role: 'assistant', content: t("assistant.error.generic") }])
        } finally {
            setIsTyping(false)
        }
    }

    // Start voice call
    const startCall = () => {
        if (!voiceSupported) {
            setError(t("assistant.error.no_voice"))
            return
        }

        setIsOpen(true)
        setMode('voice')
        setIsCalling(true)
        setIsMuted(false)
        setError(null)

        // Welcome message then start listening
        const welcome = t("assistant.speech.welcome").replace("{name}", settings?.name || 'Kevin')

        speak(welcome, () => {
            console.log('[Voice] Welcome done, starting to listen')
            startListening()
        })
    }

    // End voice call
    const endCall = () => {
        setIsCalling(false)
        setMode('chat')
        stopListening()
        if (synthRef.current) synthRef.current.cancel()
        isProcessingRef.current = false
    }

    // Toggle mute
    const toggleMute = () => {
        if (isMuted) {
            setIsMuted(false)
            startListening()
        } else {
            setIsMuted(true)
            stopListening()
        }
    }

    // Send conversation report
    const sendReport = async () => {
        if (messages.length === 0) return
        try {
            await fetch('/api/assistant/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId, messages, type: isCalling ? 'voice' : 'chat' })
            })
        } catch (e) { }
    }

    useEffect(() => {
        if (!isOpen && messages.length > 0) {
            sendReport()
        }
    }, [isOpen])

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
                                    <span className="font-orbitron font-bold text-white text-xs md:text-sm tracking-wider md:tracking-widest">
                                        {settings?.name || 'Kevin Assistant'}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[9px] md:text-[10px] text-red-100 uppercase tracking-wider md:tracking-widest font-bold">
                                            {mode === 'voice' ? t("assistant.call.active") : t("assistant.chat.active")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/20 text-white rounded-full transition-colors">
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        </div>

                        {/* Error Banner */}
                        {error && (
                            <div className="px-4 py-2 bg-red-900/50 border-b border-red-500/30 flex items-center gap-2 text-red-200 text-xs">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="ml-auto">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-[#080808] relative">
                            {mode === 'chat' ? (
                                <>
                                    <div ref={scrollRef} className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 custom-scrollbar pb-20">
                                        {messages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-5">
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-600/5 flex items-center justify-center border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-orbitron text-red-500 font-bold text-base md:text-lg italic">"{t("assistant.welcome.title")}"</h4>
                                                    <p className="text-xs md:text-sm text-neutral-400 font-rajdhani leading-relaxed">
                                                        {t("assistant.welcome.text")}
                                                    </p>
                                                </div>
                                                {voiceSupported && (
                                                    <button
                                                        onClick={startCall}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 border border-red-600/30 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-lg"
                                                    >
                                                        <Phone className="w-4 h-4" /> {t("assistant.call.start")}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {messages.map((m, i) => (
                                            <div key={i} className={cn("flex flex-col mb-3", m.role === 'user' ? "items-end" : "items-start")}>
                                                <div className={cn(
                                                    "max-w-[85%] p-3 md:p-4 rounded-2xl md:rounded-3xl text-xs md:text-[13px] leading-relaxed shadow-md",
                                                    m.role === 'user'
                                                        ? "bg-red-600 text-white rounded-tr-none font-medium"
                                                        : "bg-neutral-800/80 text-neutral-200 rounded-tl-none border border-white/5"
                                                )}>
                                                    {m.content}
                                                </div>
                                                <span className="text-[8px] md:text-[9px] text-neutral-600 mt-1 uppercase font-mono">
                                                    {m.role === 'user' ? t("assistant.visitor") : (settings?.name || 'Assistant')}
                                                </span>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex items-center gap-2 text-neutral-500 text-xs italic bg-neutral-900/40 p-3 rounded-2xl w-fit border border-white/5">
                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                {t("assistant.typing")}
                                            </div>
                                        )}
                                    </div>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input) }}
                                        className="p-3 md:p-4 border-t border-white/5 bg-black/80 backdrop-blur-lg flex items-center gap-2 md:gap-3 absolute bottom-0 left-0 right-0"
                                    >
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder={t("assistant.input.placeholder")}
                                            className="flex-1 bg-neutral-900/80 border border-white/10 rounded-xl md:rounded-2xl px-4 py-2.5 md:py-3 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-neutral-600"
                                        />
                                        <button type="submit" className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-red-600 text-white rounded-xl md:rounded-2xl hover:bg-red-700 transition-all shadow-lg">
                                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                /* Voice Mode UI */
                                <div className="flex-1 flex flex-col items-center justify-between p-6 md:p-10 bg-gradient-to-b from-black to-[#0a0a0a]">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl md:text-2xl font-orbitron font-bold text-white tracking-wider md:tracking-widest italic">
                                            {settings?.name || 'Kevin'}
                                        </h3>
                                        <p className="text-[10px] md:text-xs text-red-500 font-mono flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                                            {t("assistant.secure")}
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
                                            {isTyping ? t("assistant.typing") : isListening ? t("assistant.listening") : (isMuted ? t("assistant.muted") : t("assistant.mic.hint"))}
                                        </p>

                                        {/* Call Controls */}
                                        <div className="flex items-center justify-center gap-4 md:gap-6 pt-2">
                                            <button
                                                onClick={toggleMute}
                                                className={cn(
                                                    "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
                                                    isMuted ? "bg-white text-red-600" : "bg-neutral-800 text-white"
                                                )}
                                            >
                                                {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
                                            </button>

                                            <button
                                                onClick={endCall}
                                                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#E60000] text-white flex items-center justify-center hover:bg-red-700 shadow-2xl shadow-red-600/30 active:scale-95 transition-all"
                                            >
                                                <PhoneOff className="w-8 h-8 md:w-10 md:h-10" />
                                            </button>

                                            <button
                                                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                                className={cn(
                                                    "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all",
                                                    !isSpeakerOn ? "bg-white text-red-600" : "bg-neutral-800 text-white"
                                                )}
                                            >
                                                {isSpeakerOn ? <Volume2 className="w-5 h-5 md:w-6 md:h-6" /> : <VolumeX className="w-5 h-5 md:w-6 md:h-6" />}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => { endCall(); setMode('chat') }}
                                            className="text-[9px] md:text-[10px] text-neutral-600 uppercase tracking-widest font-bold hover:text-white transition-colors flex items-center gap-2 mx-auto mt-2"
                                        >
                                            <MessageSquare className="w-3 h-3" /> {t("assistant.chat.back")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Buttons */}
            <div className="flex flex-col gap-2 md:gap-3">
                {!isOpen && voiceSupported && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={startCall}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white text-red-600 shadow-2xl flex items-center justify-center border-2 border-red-600 relative"
                        title={t("assistant.call.tooltip")}
                    >
                        <Phone className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full">
                            <span className="absolute inset-0 animate-ping bg-red-600 rounded-full opacity-75" />
                        </span>
                    </motion.button>
                )}

                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center transform transition-all duration-500 border-2 border-white/10",
                        isOpen ? "bg-white text-red-600 rotate-90" : "bg-[#E60000] text-white"
                    )}
                >
                    {isOpen ? <X className="w-6 h-6 md:w-8 md:h-8" /> : (
                        <div className="relative">
                            <Bot className="w-7 h-7 md:w-9 md:h-9" />
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 bg-white text-red-600 rounded-full flex items-center justify-center border-2 border-[#E60000]">
                                <MessageSquare className="w-2 h-2" />
                            </div>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    )
}

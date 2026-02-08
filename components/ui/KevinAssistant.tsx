"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Phone, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, Bot, Sparkles, PhoneOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function KevinAssistant() {
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

    const scrollRef = useRef<HTMLDivElement>(null)
    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)

    // Load settings and visitor ID
    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('assistant_settings').select('*').single()
            setSettings(data)

            let vid = localStorage.getItem('shinobi_visitor_id')
            if (!vid) {
                vid = 'vis_' + Math.random().toString(36).substring(7)
                localStorage.setItem('shinobi_visitor_id', vid)
            }
            setVisitorId(vid)
        }
        load()

        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis

            // Setup Speech Recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition()
                recognitionRef.current.continuous = false
                recognitionRef.current.lang = 'fr-FR'

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    handleSendMessage(transcript)
                }

                recognitionRef.current.onend = () => {
                    // Automatically restart listening if in voice mode and not muted and not currently typing
                    if (mode === 'voice' && !isMuted && !isTyping) {
                        // Small delay to prevent overlap
                        setTimeout(() => {
                            if (mode === 'voice' && !isMuted && !isTyping) {
                                try { recognitionRef.current.start() } catch (e) { }
                            }
                        }, 500)
                    }
                    setIsListening(false)
                }

                recognitionRef.current.onstart = () => setIsListening(true)
            }
        }
    }, [mode, isMuted, isTyping])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const speak = useCallback((text: string) => {
        if (!synthRef.current || !isSpeakerOn) return

        // Cancel any current speech
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'fr-FR'

        // Try to find a warm masculine voice
        const voices = synthRef.current.getVoices()
        const masculineVoice = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('fr-fr')) && !v.name.toLowerCase().includes('google'))
            || voices.find(v => v.lang.includes('fr'))

        if (masculineVoice) utterance.voice = masculineVoice

        utterance.pitch = 0.9
        utterance.rate = 0.95

        utterance.onend = () => {
            // Restart listening after assistant finishes speaking
            if (mode === 'voice' && !isMuted) {
                try { recognitionRef.current.start() } catch (e) { }
            }
        }

        synthRef.current.speak(utterance)
    }, [isSpeakerOn, mode, isMuted])

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return

        const userMsg: Message = { role: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        try {
            // Ensure recognition is stopped while processing
            if (recognitionRef.current) try { recognitionRef.current.stop() } catch (e) { }

            const response = await fetch('/api/assistant/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    visitorId,
                    type: mode
                })
            })

            const data = await response.json()
            const assistantMsg: Message = { role: 'assistant', content: data.message }

            setMessages(prev => [...prev, assistantMsg])

            if (mode === 'voice') {
                speak(data.message)
            }
        } catch (error) {
            console.error('Chat error:', error)
        } finally {
            setIsTyping(false)
        }
    }

    const startCall = () => {
        setIsOpen(true)
        setMode('voice')
        setIsCalling(true)
        const welcome = `Bonjour au nom de Kevin CHACHA ! Je suis ${settings?.name || 'Kevin Assistant'}. Content d'entendre votre voix. Comment puis-je vous aider aujourd'hui ?`
        speak(welcome)
    }

    const endCall = () => {
        setIsCalling(false)
        setMode('chat')
        if (synthRef.current) synthRef.current.cancel()
        if (recognitionRef.current) try { recognitionRef.current.stop() } catch (e) { }
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
        if (!isMuted && recognitionRef.current) {
            try { recognitionRef.current.stop() } catch (e) { }
        } else if (recognitionRef.current) {
            try { recognitionRef.current.start() } catch (e) { }
        }
    }

    const sendReport = async () => {
        if (messages.length === 0) return
        await fetch('/api/assistant/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId, messages, type: isCalling ? 'voice' : 'chat' })
        })
    }

    useEffect(() => {
        if (!isOpen && messages.length > 0) {
            sendReport()
        }
    }, [isOpen])

    return (
        <div className="fixed bottom-6 right-6 z-[999]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-24 right-0 w-[90vw] md:w-[400px] h-[550px] bg-neutral-900 border border-red-500/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 bg-gradient-to-r from-[#8B0000] to-[#E60000] flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-black/20 border border-white/20 flex items-center justify-center relative">
                                    <Bot className="w-7 h-7 text-white" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#8B0000]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-orbitron font-bold text-white text-sm tracking-widest">{settings?.name || 'Kevin Assistant'}</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] text-red-100 uppercase tracking-widest font-bold">
                                            {mode === 'voice' ? 'Appel en cours...' : 'Système de chat actif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/20 text-white rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-[#080808] relative">
                            {mode === 'chat' ? (
                                <>
                                    <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-5 custom-scrollbar pb-20">
                                        {messages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                                                <div className="w-20 h-20 rounded-full bg-red-600/5 flex items-center justify-center border border-red-600/20 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                                    <Sparkles className="w-10 h-10 text-red-600" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-orbitron text-red-500 font-bold text-lg italic">"AKWABA !"</h4>
                                                    <p className="text-sm text-neutral-400 font-rajdhani leading-relaxed">
                                                        Je suis l'assistant personnel de Kevin. Je connais parfaitement ses projets et sa technologie. Comment puis-je vous aider ?
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={startCall}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600/10 border border-red-600/30 rounded-full text-red-500 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest shadow-lg"
                                                >
                                                    <Phone className="w-4 h-4" /> Passer un Appel Vocal
                                                </button>
                                            </div>
                                        )}
                                        {messages.map((m, i) => (
                                            <div
                                                key={i}
                                                className={cn("flex flex-col mb-4", m.role === 'user' ? "items-end" : "items-start")}
                                            >
                                                <div className={cn(
                                                    "max-w-[85%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-md",
                                                    m.role === 'user'
                                                        ? "bg-red-600 text-white rounded-tr-none font-medium"
                                                        : "bg-neutral-800/80 text-neutral-200 rounded-tl-none border border-white/5 backdrop-blur-md"
                                                )}>
                                                    {m.content}
                                                </div>
                                                <span className="text-[9px] text-neutral-600 mt-1 uppercase font-mono">
                                                    {m.role === 'user' ? 'Visiteur' : (settings?.name || 'Assistant')}
                                                </span>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex items-center gap-3 text-neutral-500 text-xs italic bg-neutral-900/40 p-3 rounded-2xl w-fit border border-white/5">
                                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                L'assistant traite votre demande...
                                            </div>
                                        )}
                                    </div>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input) }}
                                        className="p-4 border-t border-white/5 bg-black/80 backdrop-blur-lg flex items-center gap-3 absolute bottom-0 left-0 right-0"
                                    >
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Tapez votre message ici..."
                                            className="flex-1 bg-neutral-900/80 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:border-red-600 outline-none transition-all placeholder:text-neutral-600 shadow-inner"
                                        />
                                        <button type="submit" className="w-12 h-12 flex items-center justify-center bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/30 group">
                                            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-between p-10 bg-gradient-to-b from-black to-[#0a0a0a]">
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-orbitron font-bold text-white tracking-widest italic">{settings?.name || 'Kevin Assistant'}</h3>
                                        <p className="text-xs text-red-500 font-mono flex items-center justify-center gap-2">
                                            <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                                            COMMUNICATION SÉCURISÉE
                                        </p>
                                    </div>

                                    <div className="relative flex items-center justify-center">
                                        <motion.div
                                            animate={{
                                                scale: isListening ? [1, 1.15, 1] : 1,
                                                opacity: isListening ? [0.3, 0.6, 0.3] : 0.2
                                            }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute w-44 h-44 rounded-full bg-red-600"
                                        />
                                        <motion.div
                                            animate={{
                                                scale: isListening ? [1, 1.3, 1] : 1,
                                                opacity: isListening ? [0.1, 0.3, 0.1] : 0.1
                                            }}
                                            transition={{ repeat: Infinity, duration: 3 }}
                                            className="absolute w-60 h-60 rounded-full bg-red-600"
                                        />

                                        <div className={cn(
                                            "w-28 h-28 rounded-full bg-neutral-900 border-4 border-red-600 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)] z-10 transition-all duration-500",
                                            isListening ? "border-white" : ""
                                        )}>
                                            <div className="flex items-center gap-1 h-8">
                                                {[...Array(5)].map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        animate={{ height: isListening || isTyping ? [8, 24, 8] : 2 }}
                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                        className="w-1 bg-red-600 rounded-full"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <p className="text-sm text-neutral-400 font-rajdhani italic">
                                            {isTyping ? "Kevin Assistant vous répond..." : isListening ? "Dites quelque chose..." : "Appuyez sur le micro pour parler"}
                                        </p>

                                        {/* Call Controls */}
                                        <div className="flex items-center gap-6 pt-4">
                                            {/* Mute Button */}
                                            <button
                                                onClick={toggleMute}
                                                className={cn(
                                                    "w-14 h-14 rounded-full flex items-center justify-center transition-all bg-neutral-800",
                                                    isMuted ? "text-red-600 bg-white" : "text-white"
                                                )}
                                            >
                                                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                            </button>

                                            {/* Hang Up Button */}
                                            <button
                                                onClick={endCall}
                                                className="w-20 h-20 rounded-full bg-[#E60000] text-white flex items-center justify-center hover:bg-red-700 shadow-2xl shadow-red-600/20 active:scale-95 transition-all"
                                            >
                                                <PhoneOff className="w-10 h-10" />
                                            </button>

                                            {/* Speaker/Switch to Chat Button */}
                                            <button
                                                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                                                className={cn(
                                                    "w-14 h-14 rounded-full flex items-center justify-center transition-all bg-neutral-800",
                                                    !isSpeakerOn ? "text-red-600 bg-white" : "text-white"
                                                )}
                                            >
                                                {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => setMode('chat')}
                                            className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold hover:text-white transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <MessageSquare className="w-3 h-3" /> Retour au chat textuel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Floating Buttons */}
            <div className="flex flex-col gap-3">
                {/* Voice Call Direct Button (Visible when closed) */}
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={startCall}
                        className="w-14 h-14 rounded-full bg-white text-red-600 shadow-2xl flex items-center justify-center border-2 border-red-600"
                        title="Appel avec Assistant"
                    >
                        <Phone className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full">
                            <span className="absolute inset-0 animate-ping bg-red-600 rounded-full opacity-75" />
                        </span>
                    </motion.button>
                )}

                {/* Main Tab Button */}
                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                        "w-16 h-16 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center transform transition-all duration-500 border-2 border-white/10",
                        isOpen ? "bg-white text-red-600 rotate-90" : "bg-[#E60000] text-white"
                    )}
                >
                    {isOpen ? <X className="w-8 h-8" /> : (
                        <div className="relative">
                            <Bot className="w-9 h-9" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white text-red-600 rounded-full flex items-center justify-center border-2 border-[#E60000]">
                                <MessageSquare className="w-2 h-2" />
                            </div>
                        </div>
                    )}
                </motion.button>
            </div>
        </div>
    )
}

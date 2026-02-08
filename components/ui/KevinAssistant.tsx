"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Phone, X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, User, Bot, Sparkles } from "lucide-react"
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
                    setIsListening(false)
                }

                recognitionRef.current.onend = () => setIsListening(false)
            }
        }
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const speak = useCallback((text: string) => {
        if (!synthRef.current) return

        // Cancel any current speech
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'fr-FR'

        // Try to find a warm masculine voice
        const voices = synthRef.current.getVoices()
        const masculineVoice = voices.find(v => (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('fr-fr')) && !v.name.toLowerCase().includes('google'))
            || voices.find(v => v.lang.includes('fr'))

        if (masculineVoice) utterance.voice = masculineVoice

        utterance.pitch = 0.9 // Lower pitch for African warmth
        utterance.rate = 0.95 // Slightly slower for clear accent

        synthRef.current.speak(utterance)
    }, [])

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
                    visitorId
                })
            })

            const data = await response.json()
            const assistantMsg: Message = { role: 'assistant', content: data.message }

            setMessages(prev => [...prev, assistantMsg])

            if (isCalling) {
                speak(data.message)
            }
        } catch (error) {
            console.error('Chat error:', error)
        } finally {
            setIsTyping(false)
        }
    }

    const startListening = () => {
        if (!recognitionRef.current) {
            alert("La reconnaissance vocale n'est pas supportée par votre navigateur.")
            return
        }
        setIsListening(true)
        recognitionRef.current.start()
    }

    const toggleCall = () => {
        if (!isCalling) {
            setMode('voice')
            setIsCalling(true)
            speak(`Bonjour au nom de Kevin CHACHA ! Je suis ${settings?.name || 'Kevin Assistant'}. Comment puis-je vous aider aujourd'hui ?`)
        } else {
            setIsCalling(false)
            if (synthRef.current) synthRef.current.cancel()
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
                        className="absolute bottom-20 right-0 w-[90vw] md:w-[400px] h-[500px] bg-neutral-900 border border-red-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-red-600 to-red-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-black/30 border border-white/20 flex items-center justify-center relative">
                                    <Bot className="w-6 h-6 text-white" />
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-red-900" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-orbitron font-bold text-white text-sm">{settings?.name || 'Kevin Assistant'}</span>
                                    <span className="text-[10px] text-red-200 uppercase tracking-widest">{mode === 'voice' ? 'Appel en cours...' : 'Système Actif'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={toggleCall} className={cn("p-2 rounded-lg transition-colors", isCalling ? "bg-white text-red-600" : "hover:bg-black/20 text-white")}>
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/20 text-white rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-[#050505]">
                            {mode === 'chat' ? (
                                <>
                                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                                        {messages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center border border-red-600/20">
                                                    <Sparkles className="w-8 h-8 text-red-500" />
                                                </div>
                                                <p className="text-sm text-neutral-400 font-rajdhani">
                                                    "Akwaba !" Je suis l'assistant de Kevin. Je peux vous parler de son arsenal, de ses missions ou fixer un rendez-vous.
                                                </p>
                                            </div>
                                        )}
                                        {messages.map((m, i) => (
                                            <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                                                <div className={cn(
                                                    "max-w-[80%] p-3 rounded-2xl text-sm",
                                                    m.role === 'user'
                                                        ? "bg-red-600 text-white rounded-tr-none"
                                                        : "bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5"
                                                )}>
                                                    {m.content}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex items-center gap-2 text-neutral-500 text-xs italic">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Kevin Assistant réfléchit...
                                            </div>
                                        )}
                                    </div>
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(input) }}
                                        className="p-4 border-t border-white/10 bg-black/50 flex items-center gap-2"
                                    >
                                        <input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Posez votre question..."
                                            className="flex-1 bg-neutral-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-red-500 outline-none transition-colors"
                                        />
                                        <button type="submit" className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center">
                                    <div className="relative">
                                        <div className={cn(
                                            "w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center border-2 border-red-500 transition-all duration-500",
                                            isListening ? "scale-110 shadow-[0_0_50px_rgba(220,38,38,0.5)]" : ""
                                        )}>
                                            <Mic className={cn("w-10 h-10", isListening ? "text-red-500" : "text-white")} />
                                        </div>
                                        {isListening && (
                                            <div className="absolute inset-0 animate-ping rounded-full border-2 border-red-500 opacity-50" />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-orbitron font-bold text-white uppercase italic">
                                            {isListening ? 'Je vous écoute...' : 'Cliquez pour parler'}
                                        </h3>
                                        <p className="text-sm text-neutral-400 font-rajdhani">Appel avec ${settings?.name || 'Kevin Assistant'}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={isListening ? () => { } : startListening}
                                            className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                                                isListening ? "bg-neutral-800 text-neutral-500" : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20"
                                            )}
                                        >
                                            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                        </button>
                                        <button
                                            onClick={() => setMode('chat')}
                                            className="w-16 h-16 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-all"
                                        >
                                            <MessageSquare className="w-8 h-8" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                    "w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-500",
                    isOpen ? "bg-white text-red-600 rotate-90" : "bg-red-600 text-white"
                )}
            >
                {isOpen ? <X className="w-8 h-8" /> : (
                    <div className="relative">
                        <MessageSquare className="w-8 h-8" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-red-600 text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">1</span>
                    </div>
                )}
            </motion.button>
        </div>
    )
}

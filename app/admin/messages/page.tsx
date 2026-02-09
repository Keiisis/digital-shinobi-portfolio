"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trash2, Mail, MailOpen, User, Clock, CheckCircle2, Loader2, Search, Send, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
// import { formatDistanceToNow } from "date-fns" // Assuming date-fns is available or use native

interface Message {
    id: string
    created_at: string
    name: string
    email: string
    domain: string
    content: string
    read: boolean
    reply_sent?: boolean
    reply_content?: string
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

    // Reply State
    const [replyingTo, setReplyingTo] = useState<Message | null>(null)
    const [replyText, setReplyText] = useState("")
    const [isEnhancing, setIsEnhancing] = useState(false)
    const [isSendingReply, setIsSendingReply] = useState(false)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setMessages(data || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleReadStatus = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !currentStatus } : m))

        try {
            await supabase
                .from('messages')
                .update({ read: !currentStatus })
                .eq('id', id)
        } catch (error) {
            console.error('Error updating status:', error)
            fetchMessages() // Revert
        }
    }

    const deleteMessage = async (id: string) => {
        if (!confirm("Supprimer cette transmission ? Cette action est irréversible.")) return

        setMessages(prev => prev.filter(m => m.id !== id))

        try {
            await supabase
                .from('messages')
                .delete()
                .eq('id', id)
        } catch (error) {
            console.error('Error deleting message:', error)
            fetchMessages()
        }
    }

    const handleEnhance = async () => {
        if (!replyText || !replyingTo) return
        setIsEnhancing(true)
        try {
            const res = await fetch('/api/contact/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: replyText,
                    clientName: replyingTo.name,
                    domain: replyingTo.domain
                })
            })
            const data = await res.json()
            if (data.enhancedText) setReplyText(data.enhancedText)
        } catch (err) {
            console.error(err)
        } finally {
            setIsEnhancing(false)
        }
    }

    const sendManualReply = async () => {
        if (!replyText || !replyingTo) return
        setIsSendingReply(true)
        try {
            const res = await fetch('/api/contact/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId: replyingTo.id,
                    clientEmail: replyingTo.email,
                    clientName: replyingTo.name,
                    replyContent: replyText
                })
            })
            if (res.ok) {
                alert("Réponse envoyée avec succès !")
                setReplyingTo(null)
                setReplyText("")
                fetchMessages()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsSendingReply(false)
        }
    }

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.read
        if (filter === 'read') return m.read
        return true
    })

    const unreadCount = messages.filter(m => !m.read).length

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-orbitron text-3xl text-white font-bold tracking-wider uppercase">Voix des Clans</h1>
                    <p className="text-neutral-400 font-mono text-xs mt-1 uppercase tracking-widest">
                        {unreadCount} transmissions non lues • {messages.length} total
                    </p>
                </div>

                <div className="flex bg-neutral-900 p-1 rounded-lg border border-white/10">
                    {(['all', 'unread', 'read'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-2",
                                filter === f
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {f === 'all' && 'Toutes'}
                            {f === 'unread' && <><Mail className="w-3 h-3" /> Non Lues</>}
                            {f === 'read' && <><MailOpen className="w-3 h-3" /> Lues</>}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-neutral-800 rounded-lg text-neutral-600 font-mono text-sm uppercase tracking-widest">
                    Aucune transmission détectée sur cette fréquence.
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence>
                        {filteredMessages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={cn(
                                    "relative p-6 rounded-lg border transition-all duration-300 group",
                                    msg.read
                                        ? "bg-neutral-900/30 border-white/5 text-neutral-400"
                                        : "bg-red-950/10 border-red-500/30 text-white shadow-[0_0_15px_rgba(220,38,38,0.05)]"
                                )}
                            >
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Sidebar Info */}
                                    <div className="w-full md:w-48 flex-shrink-0 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6">
                                        <div className="flex items-center gap-2 font-bold font-orbitron text-sm tracking-wide">
                                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10 text-neutral-400">
                                                {msg.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="truncate">{msg.name}</span>
                                        </div>

                                        <div className="text-xs font-mono text-neutral-500 break-all flex items-center gap-2">
                                            <span className="w-1 h-1 bg-red-500 rounded-full" /> {msg.email}
                                        </div>

                                        <div className="mt-auto pt-4">
                                            <div className="text-[10px] uppercase text-neutral-600 tracking-widest font-bold mb-1">Domaine</div>
                                            <div className="inline-block px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-cyan-400">
                                                {msg.domain || "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500">
                                                <Clock className="w-3 h-3" />
                                                {new Date(msg.created_at).toLocaleString()}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {msg.reply_sent && (
                                                    <span className="text-[10px] font-bold text-green-500 uppercase flex items-center gap-1 mr-2 px-2 py-1 rounded border border-green-500/20 bg-green-500/5">
                                                        <CheckCircle2 className="w-3 h-3" /> Répondu
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => setReplyingTo(msg)}
                                                    className="p-2 rounded text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                                                    title="Répondre"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleReadStatus(msg.id, msg.read)}
                                                    className={cn(
                                                        "p-2 rounded transition-colors",
                                                        msg.read
                                                            ? "text-neutral-600 hover:text-white hover:bg-white/10"
                                                            : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    )}
                                                    title={msg.read ? "Marquer comme non lu" : "Marquer comme lu"}
                                                >
                                                    {msg.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteMessage(msg.id)}
                                                    className="p-2 rounded text-neutral-600 hover:text-red-500 hover:bg-red-950/30 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                            {msg.content}
                                        </p>

                                        {msg.reply_sent && msg.reply_content && (
                                            <div className="mt-4 p-4 rounded bg-white/5 border border-white/5 italic text-neutral-400 text-xs">
                                                <div className="font-bold text-[10px] uppercase mb-2 text-neutral-600">Ta réponse :</div>
                                                {msg.reply_content}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Reply Modal */}
            <AnimatePresence>
                {replyingTo && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setReplyingTo(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-neutral-900 border border-red-500/30 w-full max-w-2xl rounded-xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                                <div>
                                    <h3 className="font-orbitron font-bold text-lg text-white">RÉPONSE CLANDESTINE</h3>
                                    <p className="text-xs text-neutral-500 font-mono">Vers : {replyingTo.email}</p>
                                </div>
                                <button onClick={() => setReplyingTo(null)} className="text-neutral-500 hover:text-white transition-colors">
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4">
                                <div className="p-4 bg-white/5 rounded border border-white/5">
                                    <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1">Message d'origine :</div>
                                    <p className="text-sm text-neutral-400 italic">"{replyingTo.content}"</p>
                                </div>

                                <textarea
                                    className="w-full bg-black border border-white/10 rounded-lg p-4 text-white font-rajdhani text-lg min-h-[200px] focus:border-red-500 outline-none transition-all placeholder:text-neutral-800"
                                    placeholder="Écris ton message ici..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleEnhance}
                                        disabled={isEnhancing || !replyText}
                                        className="flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-orbitron text-xs tracking-widest transition-all disabled:opacity-50 group"
                                    >
                                        {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Zap className="w-4 h-4 group-hover:scale-125 transition-transform" />}
                                        AMÉLIORER PAR L'IA (PNL/BUSINESS)
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-black/40">
                                <button
                                    onClick={sendManualReply}
                                    disabled={isSendingReply || !replyText}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded bg-red-600 hover:bg-red-700 text-white font-bold font-orbitron tracking-[0.3em] transition-all disabled:opacity-50"
                                >
                                    {isSendingReply ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    ENVOYER LA RÉPONSE
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trash2, Mail, MailOpen, User, Clock, CheckCircle2, Loader2, Search } from "lucide-react"
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
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

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

    const filteredMessages = messages.filter(m => {
        if (filter === 'unread') return !m.read
        if (filter === 'read') return m.read
        return true
    })

    const unreadCount = messages.filter(m => !m.read).length

    return (
        <div className="space-y-8">
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
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}

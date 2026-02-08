"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Wand2, Loader2, Check, AlertCircle } from "lucide-react"

interface AIEnhanceButtonProps {
    text: string
    onEnhanced: (enhancedText: string) => void
    className?: string
}

export function AIEnhanceButton({ text, onEnhanced, className = "" }: AIEnhanceButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleEnhance = async () => {
        if (!text || text.trim().length < 10) {
            setStatus('error')
            setTimeout(() => setStatus('idle'), 2000)
            return
        }

        setIsLoading(true)
        setStatus('idle')

        try {
            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, type: 'enhance' })
            })

            const data = await response.json()

            if (data.enhanced) {
                onEnhanced(data.enhanced)
                setStatus('success')
                setTimeout(() => setStatus('idle'), 2000)
            } else {
                setStatus('error')
                setTimeout(() => setStatus('idle'), 2000)
            }
        } catch (error) {
            console.error('Enhancement error:', error)
            setStatus('error')
            setTimeout(() => setStatus('idle'), 2000)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.button
            type="button"
            onClick={handleEnhance}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative inline-flex items-center gap-2 px-4 py-2 rounded-lg
                font-medium text-sm transition-all duration-300
                ${status === 'success'
                    ? 'bg-green-600 text-white'
                    : status === 'error'
                        ? 'bg-red-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-purple-500/25
                ${className}
            `}
        >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 hover:opacity-20 blur-sm transition-opacity" />

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Amélioration...</span>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        <span>Texte amélioré !</span>
                    </motion.div>
                ) : status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        <span>Texte trop court</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Améliorer avec IA</span>
                        <Wand2 className="w-3 h-3 opacity-60" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    )
}

// Compact version for inline use
export function AIEnhanceIcon({ text, onEnhanced }: { text: string, onEnhanced: (t: string) => void }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleEnhance = async () => {
        if (!text || text.trim().length < 10 || isLoading) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, type: 'enhance' })
            })
            const data = await response.json()
            if (data.enhanced) onEnhanced(data.enhanced)
        } catch (error) {
            console.error('Enhancement error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleEnhance}
            disabled={isLoading}
            className="p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            title="Améliorer avec IA"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
        </button>
    )
}

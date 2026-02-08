"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Eye } from "lucide-react"

// Reaction types with emojis
const REACTIONS = [
    { type: 'like', emoji: '👍', label: 'Like' },
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'wow', emoji: '😍', label: 'Wow' },
    { type: 'rocket', emoji: '🚀', label: 'Rocket' },
] as const

type ReactionType = typeof REACTIONS[number]['type']

interface ReactionCounts {
    like: number
    love: number
    fire: number
    wow: number
    rocket: number
}

interface ProjectReactionsProps {
    projectId: string
    compact?: boolean // For card view (just icons) vs modal view (full)
}

// Get or create a unique visitor ID
const getVisitorId = (): string => {
    if (typeof window === 'undefined') return ''

    let visitorId = localStorage.getItem('shinobi_visitor_id')
    if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`
        localStorage.setItem('shinobi_visitor_id', visitorId)
    }
    return visitorId
}

export function ProjectReactions({ projectId, compact = false }: ProjectReactionsProps) {
    const [counts, setCounts] = useState<ReactionCounts>({ like: 0, love: 0, fire: 0, wow: 0, rocket: 0 })
    const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set())
    const [views, setViews] = useState(0)
    const [showPicker, setShowPicker] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch initial data
    const fetchData = useCallback(async () => {
        const visitorId = getVisitorId()
        if (!visitorId) return

        try {
            // Fetch reaction counts
            const { data: reactions } = await supabase
                .from('project_reactions')
                .select('reaction_type, visitor_id')
                .eq('project_id', projectId)

            if (reactions) {
                const newCounts: ReactionCounts = { like: 0, love: 0, fire: 0, wow: 0, rocket: 0 }
                const userReacts = new Set<ReactionType>()

                reactions.forEach(r => {
                    newCounts[r.reaction_type as ReactionType]++
                    if (r.visitor_id === visitorId) {
                        userReacts.add(r.reaction_type as ReactionType)
                    }
                })

                setCounts(newCounts)
                setUserReactions(userReacts)
            }

            // Fetch view count
            const { count } = await supabase
                .from('project_views')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', projectId)

            setViews(count || 0)
            setIsLoading(false)
        } catch (error) {
            console.error('Error fetching reactions:', error)
            setIsLoading(false)
        }
    }, [projectId])

    // Track view on mount
    useEffect(() => {
        const trackView = async () => {
            const visitorId = getVisitorId()
            if (!visitorId) return

            try {
                // Try to insert view (will fail silently if already exists due to UNIQUE constraint)
                await supabase
                    .from('project_views')
                    .upsert({ project_id: projectId, visitor_id: visitorId }, { onConflict: 'project_id,visitor_id' })
            } catch (error) {
                // Ignore - view already tracked
            }
        }

        trackView()
        fetchData()
    }, [projectId, fetchData])

    // Subscribe to realtime updates
    useEffect(() => {
        const channel = supabase
            .channel(`reactions-${projectId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'project_reactions',
                    filter: `project_id=eq.${projectId}`
                },
                () => {
                    // Refetch on any change
                    fetchData()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [projectId, fetchData])

    // Toggle reaction
    const toggleReaction = async (type: ReactionType) => {
        const visitorId = getVisitorId()
        if (!visitorId) return

        const hasReaction = userReactions.has(type)

        // Optimistic update
        setUserReactions(prev => {
            const next = new Set(prev)
            if (hasReaction) {
                next.delete(type)
            } else {
                next.add(type)
            }
            return next
        })

        setCounts(prev => ({
            ...prev,
            [type]: hasReaction ? Math.max(0, prev[type] - 1) : prev[type] + 1
        }))

        try {
            if (hasReaction) {
                // Remove reaction
                await supabase
                    .from('project_reactions')
                    .delete()
                    .eq('project_id', projectId)
                    .eq('visitor_id', visitorId)
                    .eq('reaction_type', type)
            } else {
                // Add reaction
                await supabase
                    .from('project_reactions')
                    .insert({ project_id: projectId, visitor_id: visitorId, reaction_type: type })
            }
        } catch (error) {
            // Rollback on error
            fetchData()
        }
    }

    // Calculate total reactions
    const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0)

    // Get top 3 reactions for compact display
    const topReactions = REACTIONS
        .filter(r => counts[r.type] > 0)
        .sort((a, b) => counts[b.type] - counts[a.type])
        .slice(0, 3)

    if (isLoading) {
        return <div className="h-8 w-24 bg-neutral-800 animate-pulse rounded-full" />
    }

    // Compact view for project cards
    if (compact) {
        return (
            <div className="flex items-center gap-3 text-xs">
                {/* Views */}
                <div className="flex items-center gap-1 text-neutral-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{views}</span>
                </div>

                {/* Reactions summary */}
                {totalReactions > 0 && (
                    <div className="flex items-center">
                        <div className="flex -space-x-1">
                            {topReactions.map((r, i) => (
                                <span
                                    key={r.type}
                                    className="text-sm"
                                    style={{ zIndex: 3 - i }}
                                >
                                    {r.emoji}
                                </span>
                            ))}
                        </div>
                        <span className="ml-1.5 text-neutral-400">{totalReactions}</span>
                    </div>
                )}
            </div>
        )
    }

    // Full view for modal / detail page
    return (
        <div className="relative">
            {/* Stats bar */}
            <div className="flex items-center justify-between py-3 border-y border-white/10">
                {/* Left: Views */}
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{views} vue{views !== 1 ? 's' : ''}</span>
                </div>

                {/* Right: Reactions summary */}
                {totalReactions > 0 && (
                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                        <div className="flex -space-x-1">
                            {topReactions.map((r, i) => (
                                <motion.span
                                    key={r.type}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-base"
                                    style={{ zIndex: 3 - i }}
                                >
                                    {r.emoji}
                                </motion.span>
                            ))}
                        </div>
                        <span>{totalReactions} réaction{totalReactions !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Reaction buttons */}
            <div className="flex items-center justify-center gap-2 py-3">
                {REACTIONS.map(reaction => {
                    const isActive = userReactions.has(reaction.type)
                    const count = counts[reaction.type]

                    return (
                        <motion.button
                            key={reaction.type}
                            onClick={() => toggleReaction(reaction.type)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`
                                relative flex items-center gap-1.5 px-3 py-2 rounded-full
                                transition-all duration-200
                                ${isActive
                                    ? 'bg-red-600/20 border border-red-500/50 text-white'
                                    : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            <span className="text-lg">{reaction.emoji}</span>
                            {count > 0 && (
                                <motion.span
                                    key={count}
                                    initial={{ scale: 1.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-xs font-mono"
                                >
                                    {count}
                                </motion.span>
                            )}

                            {/* Active indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId={`active-${reaction.type}`}
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// Hook for tracking views (use in Portfolio component)
export function useTrackView(projectId: string) {
    useEffect(() => {
        const trackView = async () => {
            const visitorId = getVisitorId()
            if (!visitorId || !projectId) return

            try {
                await supabase
                    .from('project_views')
                    .upsert(
                        { project_id: projectId, visitor_id: visitorId },
                        { onConflict: 'project_id,visitor_id' }
                    )
            } catch (error) {
                // Silently fail
            }
        }

        trackView()
    }, [projectId])
}

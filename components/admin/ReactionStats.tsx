"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Eye, Heart, Flame, Rocket, ThumbsUp, TrendingUp } from "lucide-react"

interface ProjectStats {
    id: string
    title: string
    category: string
    image_url?: string
    images?: string[]
    total_views: number
    total_reactions: number
    reactions: {
        like: number
        love: number
        fire: number
        wow: number
        rocket: number
    }
}

interface GlobalStats {
    totalViews: number
    totalReactions: number
    reactionBreakdown: {
        like: number
        love: number
        fire: number
        wow: number
        rocket: number
    }
}

// Emoji mapping
const REACTION_EMOJIS = {
    like: '👍',
    love: '❤️',
    fire: '🔥',
    wow: '😍',
    rocket: '🚀'
}

export function ReactionStats() {
    const [globalStats, setGlobalStats] = useState<GlobalStats>({
        totalViews: 0,
        totalReactions: 0,
        reactionBreakdown: { like: 0, love: 0, fire: 0, wow: 0, rocket: 0 }
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get total views
                const { count: viewCount } = await supabase
                    .from('project_views')
                    .select('*', { count: 'exact', head: true })

                // Get all reactions
                const { data: reactions } = await supabase
                    .from('project_reactions')
                    .select('reaction_type')

                const breakdown = { like: 0, love: 0, fire: 0, wow: 0, rocket: 0 }
                reactions?.forEach(r => {
                    if (breakdown.hasOwnProperty(r.reaction_type)) {
                        breakdown[r.reaction_type as keyof typeof breakdown]++
                    }
                })

                const totalReactions = Object.values(breakdown).reduce((a, b) => a + b, 0)

                setGlobalStats({
                    totalViews: viewCount || 0,
                    totalReactions,
                    reactionBreakdown: breakdown
                })
                setLoading(false)
            } catch (error) {
                console.error('Error fetching reaction stats:', error)
                setLoading(false)
            }
        }

        fetchStats()

        // Realtime subscription
        const channel = supabase
            .channel('admin-reactions-stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_reactions' }, fetchStats)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_views' }, fetchStats)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    if (loading) {
        return <div className="h-32 bg-white/5 rounded-lg animate-pulse" />
    }

    return (
        <div className="p-6 rounded-lg bg-gradient-to-br from-purple-950/40 to-black border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider">Engagement Global</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-black/40 rounded-lg">
                    <div className="text-3xl font-bold font-rajdhani text-white">{globalStats.totalViews.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3" /> Vues Totales
                    </div>
                </div>
                <div className="text-center p-3 bg-black/40 rounded-lg">
                    <div className="text-3xl font-bold font-rajdhani text-white">{globalStats.totalReactions.toLocaleString()}</div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3" /> Réactions
                    </div>
                </div>
            </div>

            {/* Reaction breakdown */}
            <div className="flex justify-between items-center bg-black/30 rounded-lg p-3">
                {Object.entries(globalStats.reactionBreakdown).map(([type, count]) => (
                    <div key={type} className="text-center">
                        <span className="text-lg">{REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]}</span>
                        <div className="text-xs font-bold text-white">{count}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ProjectLeaderboard({ limit = 5 }: { limit?: number }) {
    const [projects, setProjects] = useState<ProjectStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Get all projects
                const { data: projectsData } = await supabase
                    .from('projects')
                    .select('id, title, category, image_url, images')
                    .eq('status', 'published')

                if (!projectsData) {
                    setLoading(false)
                    return
                }

                // Get all views
                const { data: views } = await supabase
                    .from('project_views')
                    .select('project_id')

                // Get all reactions
                const { data: reactions } = await supabase
                    .from('project_reactions')
                    .select('project_id, reaction_type')

                // Aggregate stats per project
                const statsMap = new Map<string, ProjectStats>()

                projectsData.forEach(p => {
                    statsMap.set(p.id, {
                        id: p.id,
                        title: p.title,
                        category: p.category,
                        image_url: p.image_url,
                        images: p.images,
                        total_views: 0,
                        total_reactions: 0,
                        reactions: { like: 0, love: 0, fire: 0, wow: 0, rocket: 0 }
                    })
                })

                views?.forEach(v => {
                    const project = statsMap.get(v.project_id)
                    if (project) project.total_views++
                })

                reactions?.forEach(r => {
                    const project = statsMap.get(r.project_id)
                    if (project) {
                        project.total_reactions++
                        if (project.reactions.hasOwnProperty(r.reaction_type)) {
                            project.reactions[r.reaction_type as keyof typeof project.reactions]++
                        }
                    }
                })

                // Sort by total engagement (views + reactions)
                const sorted = Array.from(statsMap.values())
                    .sort((a, b) => (b.total_views + b.total_reactions) - (a.total_views + a.total_reactions))
                    .slice(0, limit)

                setProjects(sorted)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching leaderboard:', error)
                setLoading(false)
            }
        }

        fetchLeaderboard()

        // Realtime updates
        const channel = supabase
            .channel('leaderboard-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_reactions' }, fetchLeaderboard)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_views' }, fetchLeaderboard)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [limit])

    if (loading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: limit }).map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    const getImage = (project: ProjectStats) => {
        if (project.images && project.images.length > 0) return project.images[0]
        return project.image_url || '/assets/placeholder.png'
    }

    return (
        <div className="space-y-3">
            {projects.map((project, index) => {
                const topReaction = Object.entries(project.reactions)
                    .sort(([, a], [, b]) => b - a)
                    .find(([, count]) => count > 0)

                return (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-black/40 border border-white/10 hover:border-red-500/50 transition-colors"
                    >
                        {/* Rank */}
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-yellow-500 text-black' :
                                index === 1 ? 'bg-neutral-300 text-black' :
                                    index === 2 ? 'bg-amber-700 text-white' :
                                        'bg-neutral-800 text-neutral-400'}
                        `}>
                            {index + 1}
                        </div>

                        {/* Project Image */}
                        <div className="w-12 h-12 rounded overflow-hidden bg-neutral-900 flex-shrink-0">
                            <img
                                src={getImage(project)}
                                alt={project.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-white text-sm truncate">{project.title}</div>
                            <div className="text-[10px] text-red-500 uppercase tracking-wider">{project.category}</div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                            <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{project.total_views}</span>
                            </div>
                            {project.total_reactions > 0 && (
                                <div className="flex items-center gap-1">
                                    <span>{topReaction ? REACTION_EMOJIS[topReaction[0] as keyof typeof REACTION_EMOJIS] : ''}</span>
                                    <span>{project.total_reactions}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}

            {projects.length === 0 && (
                <div className="text-center text-neutral-500 py-8">
                    Aucune donnée d'engagement pour le moment
                </div>
            )}
        </div>
    )
}

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Eye, Trophy } from "lucide-react"
import { useLanguage } from "@/app/context/LanguageContext"

interface TopProject {
    id: string
    title: string
    category: string
    image_url?: string
    images?: string[]
    engagement: number
    views: number
    topReaction: { emoji: string; count: number } | null
}

const REACTION_EMOJIS: { [key: string]: string } = {
    like: '👍',
    love: '❤️',
    fire: '🔥',
    wow: '😍',
    rocket: '🚀'
}

export function Leaderboard() {
    const [topProjects, setTopProjects] = useState<TopProject[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useLanguage()

    useEffect(() => {
        const fetchTopProjects = async () => {
            try {
                // Get published projects
                const { data: projects } = await supabase
                    .from('projects')
                    .select('id, title, category, image_url, images')
                    .eq('status', 'published')

                if (!projects) {
                    setLoading(false)
                    return
                }

                // Get views
                const { data: views } = await supabase
                    .from('project_views')
                    .select('project_id')

                // Get reactions
                const { data: reactions } = await supabase
                    .from('project_reactions')
                    .select('project_id, reaction_type')

                // Calculate engagement per project
                const projectStats = projects.map(p => {
                    const projectViews = views?.filter(v => v.project_id === p.id).length || 0
                    const projectReactions = reactions?.filter(r => r.project_id === p.id) || []

                    // Find top reaction
                    const reactionCounts: { [key: string]: number } = {}
                    projectReactions.forEach(r => {
                        reactionCounts[r.reaction_type] = (reactionCounts[r.reaction_type] || 0) + 1
                    })

                    const topReactionEntry = Object.entries(reactionCounts)
                        .sort(([, a], [, b]) => b - a)
                        .find(([, count]) => count > 0)

                    return {
                        id: p.id,
                        title: p.title,
                        category: p.category,
                        image_url: p.image_url,
                        images: p.images,
                        engagement: projectViews + projectReactions.length,
                        views: projectViews,
                        topReaction: topReactionEntry
                            ? { emoji: REACTION_EMOJIS[topReactionEntry[0]], count: topReactionEntry[1] }
                            : null
                    }
                })

                // Sort by engagement and take top 3
                const sorted = projectStats
                    .sort((a, b) => b.engagement - a.engagement)
                    .slice(0, 3)

                setTopProjects(sorted)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching leaderboard:', error)
                setLoading(false)
            }
        }

        fetchTopProjects()

        // Realtime updates
        const channel = supabase
            .channel('public-leaderboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_reactions' }, fetchTopProjects)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_views' }, fetchTopProjects)
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const getImage = (project: TopProject) => {
        if (project.images && project.images.length > 0) return project.images[0]
        return project.image_url || '/assets/placeholder.png'
    }

    if (loading) {
        return (
            <div className="flex gap-6 justify-center">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-72 h-80 bg-neutral-900 animate-pulse rounded-xl" />
                ))}
            </div>
        )
    }

    if (topProjects.length === 0) return null

    // Reorder for podium display: 2nd, 1st, 3rd
    const podiumOrder = topProjects.length >= 3
        ? [topProjects[1], topProjects[0], topProjects[2]]
        : topProjects

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <h2 className="font-heading text-3xl font-bold text-white tracking-[0.2em] uppercase">
                            {t("leaderboard.title")}
                        </h2>
                        <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>
                    <p className="text-neutral-500 font-mono text-sm">{t("leaderboard.subtitle")}</p>
                </motion.div>

                {/* Podium */}
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-4">
                    {podiumOrder.map((project, index) => {
                        // Determine actual rank (0 = 2nd, 1 = 1st, 2 = 3rd in podium order)
                        const actualRank = index === 0 ? 2 : index === 1 ? 1 : 3
                        const isFirst = actualRank === 1
                        const isSecond = actualRank === 2

                        return (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className={`
                                    relative group cursor-pointer
                                    ${isFirst ? 'order-2 md:order-2 z-10' : isSecond ? 'order-1 md:order-1' : 'order-3 md:order-3'}
                                `}
                            >
                                {/* Card */}
                                <div className={`
                                    relative w-72 overflow-hidden rounded-xl border backdrop-blur-sm
                                    transition-all duration-300 group-hover:scale-105
                                    ${isFirst
                                        ? 'h-96 bg-gradient-to-b from-yellow-950/40 to-black border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                                        : isSecond
                                            ? 'h-80 bg-gradient-to-b from-neutral-800/40 to-black border-neutral-400/30'
                                            : 'h-72 bg-gradient-to-b from-amber-950/40 to-black border-amber-700/30'}
                                `}>
                                    {/* Rank badge */}
                                    <div className={`
                                        absolute top-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                        ${isFirst
                                            ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]'
                                            : isSecond
                                                ? 'bg-neutral-300 text-black'
                                                : 'bg-amber-700 text-white'}
                                    `}>
                                        {actualRank}
                                    </div>

                                    {/* Crown for 1st place */}
                                    {isFirst && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 text-4xl animate-bounce">
                                            👑
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className="relative h-1/2 overflow-hidden">
                                        <Image
                                            src={getImage(project)}
                                            alt={project.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            sizes="288px"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <span className="text-[10px] text-red-500 font-mono uppercase tracking-widest">
                                            {project.category}
                                        </span>
                                        <h3 className="font-heading font-bold text-white text-lg mt-1 truncate">
                                            {project.title}
                                        </h3>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 mt-4 text-neutral-400 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                <span>{project.views}</span>
                                            </div>
                                            {project.topReaction && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-base">{project.topReaction.emoji}</span>
                                                    <span>{project.topReaction.count}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Glow effect on hover */}
                                    <div className={`
                                        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                                        ${isFirst ? 'bg-yellow-500/5' : 'bg-white/5'}
                                    `} />
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

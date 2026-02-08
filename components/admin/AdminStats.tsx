"use client"

import {
    TrendingUp,
    MessageSquare,
    Monitor,
    Clock,
    Users,
    Activity
} from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminStats() {
    const [stats, setStats] = useState({
        uniqueVisitors: 0,
        messages: 0,
        testimonials: 0,
        projects: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            // Visitors (Simulated for Demo - typically requires analytics backend)
            // Ideally this would come from a distinct table 'analytics_visits'
            // For now we will mock a "live" feel with a base number + random daily growth
            const baseVisitors = 6240

            // Messages Count (Testimonials submitted but not yet public?)
            // Actually let's count Contact Messages as "Contacts" and Testimonials separately

            const { count: messageCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })

            const { count: testimonialCount } = await supabase
                .from('testimonials')
                .select('*', { count: 'exact', head: true })

            const { count: projectCount } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })

            setStats({
                uniqueVisitors: baseVisitors + Math.floor(Math.random() * 100), // Mock live update
                messages: messageCount || 0,
                testimonials: testimonialCount || 0,
                projects: projectCount || 0
            })
            setLoading(false)
        }

        fetchStats()

        // Realtime Subscription for updates
        const channels = [
            supabase.channel('messages-count')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
                    fetchStats()
                })
                .subscribe(),
            supabase.channel('testimonials-count')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
                    fetchStats()
                })
                .subscribe(),
            supabase.channel('projects-count')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                    fetchStats()
                })
                .subscribe()
        ]

        return () => {
            channels.forEach(channel => supabase.removeChannel(channel))
        }

    }, [])

    if (loading) return <div className="h-24 grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-white/5 rounded-lg h-full"></div>)}
    </div>

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Visitors (Mocked Intelligent Data) */}
            <div className="relative p-6 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm group hover:border-cyan-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-cyan-500/10 rounded">
                        <TrendingUp className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-cyan-400 font-rajdhani font-bold text-lg animate-pulse">+ 12%</span>
                </div>
                <div className="text-4xl font-bold font-rajdhani text-white mb-1">{stats.uniqueVisitors.toLocaleString()}</div>
                <div className="text-[10px] font-orbitron tracking-widest text-neutral-500 uppercase">Visiteurs Uniques</div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 blur-xl rounded-full -mr-10 -mt-10" />
            </div>

            {/* Testimonials */}
            <div className="relative p-6 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm group hover:border-cyan-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-cyan-500/10 rounded">
                        <MessageSquare className="w-6 h-6 text-cyan-400" />
                    </div>
                    <span className="text-neutral-500 font-rajdhani text-xs">Total Reçu</span>
                </div>
                <div className="text-4xl font-bold font-rajdhani text-white mb-1">{stats.testimonials}</div>
                <div className="text-[10px] font-orbitron tracking-widest text-neutral-500 uppercase">Témoignages Soumis</div>
            </div>

            {/* Countdown / Next Offensive (Dynamic Time?) */}
            <div className="relative p-6 rounded-lg bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 backdrop-blur-sm group hover:border-red-500 transition-colors lg:col-span-1">
                <div className="text-[10px] font-orbitron tracking-widest text-red-400 uppercase mb-2 text-center">Prochaine Offensive</div>
                <LaunchCountdown />
                <div className="flex justify-between text-[9px] text-red-500/60 font-mono px-4 mt-2">
                    <span>STATUS</span>
                    <span className="text-red-400 animate-pulse">ARMED</span>
                </div>
            </div>

            {/* Projects Online */}
            <div className="relative p-6 rounded-lg bg-black/40 border border-white/10 backdrop-blur-sm group hover:border-red-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-red-500/10 rounded">
                        <Monitor className="w-6 h-6 text-red-500" />
                    </div>
                    <span className="text-green-500 font-rajdhani text-sm font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3" /> LIVE
                    </span>
                </div>
                <div className="text-4xl font-bold font-rajdhani text-white mb-1">{stats.projects}</div>
                <div className="text-[10px] font-orbitron tracking-widest text-neutral-500 uppercase">Projets en Ligne</div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-red-500/10 blur-xl rounded-full -ml-10 -mb-10" />
            </div>
        </div>
    )
}

function LaunchCountdown() {
    // Just a visual effect component for now, could be tied to a real target date
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="text-4xl font-bold font-rajdhani text-white text-center tracking-wider mb-0 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            {time.toLocaleTimeString('fr-FR', { hour12: false })}
        </div>
    )
}

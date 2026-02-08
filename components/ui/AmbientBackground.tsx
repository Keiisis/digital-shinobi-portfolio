"use client"

import { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

// Particle generator
const generateEmbers = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 15 + 8,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.3
    }))
}

// Crow SVG path for silhouettes
const CrowSilhouette = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 100 60" className={className} style={style}>
        <path
            d="M50 30 L30 15 L10 25 L25 30 L10 35 L30 45 L50 30 M50 30 L70 15 L90 25 L75 30 L90 35 L70 45 L50 30"
            fill="currentColor"
        />
    </svg>
)

export function AmbientBackground() {
    const { scrollY } = useScroll()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const rotate = useTransform(scrollY, [0, 3000], [0, 120])
    const scale = useTransform(scrollY, [0, 1000], [1, 1.2])

    const embers = mounted ? generateEmbers(50) : []

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">

            {/* ============================================= */}
            {/* 1. THE MANGEKYOU - Abstract Sharingan Pattern */}
            {/* ============================================= */}
            <motion.div
                style={{ rotate, scale }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] md:w-[60vw] md:h-[60vw] opacity-15"
            >
                {/* Outer Ring */}
                <div className="absolute inset-0 border-2 border-red-600/20 rounded-full animate-[spin_60s_linear_infinite]" />

                {/* Middle Dashed Ring */}
                <div className="absolute inset-[10%] border border-red-500/10 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />

                {/* Inner Dotted Ring */}
                <div className="absolute inset-[25%] border-2 border-red-900/30 rounded-full border-dotted animate-[spin_25s_linear_infinite]" />

                {/* Core Glow */}
                <div className="absolute inset-[40%] bg-red-600/10 rounded-full blur-3xl animate-pulse" />

                {/* Tomoe Pattern - 3 curved blades */}
                {[0, 120, 240].map((deg) => (
                    <div
                        key={deg}
                        className="absolute top-1/2 left-1/2 origin-bottom"
                        style={{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }}
                    >
                        <div className="w-6 h-48 bg-gradient-to-t from-red-600/30 via-red-600/10 to-transparent rounded-full blur-sm" />
                    </div>
                ))}
            </motion.div>

            {/* ============================================= */}
            {/* 2. RISING EMBERS - Katon Particles            */}
            {/* ============================================= */}
            {mounted && embers.map((ember) => (
                <motion.div
                    key={ember.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${ember.x}%`,
                        width: ember.size,
                        height: ember.size,
                        background: `radial-gradient(circle, rgba(239,68,68,${ember.opacity}) 0%, rgba(153,27,27,0.5) 50%, transparent 100%)`,
                        boxShadow: `0 0 ${ember.size * 2}px rgba(239,68,68,0.4)`
                    }}
                    initial={{ y: "110vh", opacity: 0 }}
                    animate={{
                        y: "-10vh",
                        opacity: [0, ember.opacity, ember.opacity, 0],
                    }}
                    transition={{
                        duration: ember.duration,
                        repeat: Infinity,
                        delay: ember.delay,
                        ease: "linear"
                    }}
                />
            ))}

            {/* ============================================= */}
            {/* 3. THE CROWS - Itachi's Signature             */}
            {/* ============================================= */}
            {/* Crow Flock 1 - Main group */}
            <motion.div
                className="absolute z-10"
                initial={{ x: "110vw", y: "20vh" }}
                animate={{
                    x: [null, "-20vw"],
                    y: [null, "35vh"],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatDelay: 8,
                    ease: "linear"
                }}
            >
                <CrowSilhouette className="w-16 text-black/90 blur-[0.5px]" />
                <CrowSilhouette className="w-10 text-black/70 absolute -top-8 left-12" style={{ transform: 'rotate(-10deg)' }} />
                <CrowSilhouette className="w-8 text-black/50 absolute top-4 left-20" style={{ transform: 'rotate(15deg)' }} />
            </motion.div>

            {/* Crow Flock 2 - Secondary group (delayed) */}
            <motion.div
                className="absolute z-10"
                initial={{ x: "120vw", y: "60vh" }}
                animate={{
                    x: [null, "-30vw"],
                    y: [null, "45vh"],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    repeatDelay: 15,
                    delay: 12,
                    ease: "linear"
                }}
            >
                <CrowSilhouette className="w-12 text-black/80 blur-[0.3px]" />
                <CrowSilhouette className="w-8 text-black/60 absolute -top-6 left-8" style={{ transform: 'rotate(5deg)' }} />
            </motion.div>

            {/* ============================================= */}
            {/* 4. ATMOSPHERIC LAYERS                         */}
            {/* ============================================= */}

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.9)_100%)]" />

            {/* Bottom Red Glow - Like distant flames */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-red-950/30 via-red-950/10 to-transparent" />

            {/* Top Darkness - Heavy atmosphere */}
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/80 to-transparent" />

            {/* Scanlines - Subtle digital texture */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                }}
            />

            {/* Noise Texture - Organic feel */}
            <div
                className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }}
            />
        </div>
    )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export function CyberGridBackground() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll()

    // Create parallax and transform effects based on scroll
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -500])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -200])

    // Opacity control: fade in after hero section (approx 15% of page scroll)
    const opacity = useTransform(scrollYProgress, [0.1, 0.2], [0, 1])

    return (
        <motion.div
            ref={containerRef}
            style={{ opacity }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        >
            {/* Base Dark Layer */}
            <div className="absolute inset-0 bg-neutral-950" />

            {/* Dynamic Gradient Mesh */}
            <div className="absolute inset-x-0 top-[-50%] h-[200%] w-full opacity-30">
                <div className="absolute top-[20%] left-[10%] w-[40vw] h-[40vw] bg-red-600/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute top-[40%] right-[10%] w-[35vw] h-[35vw] bg-red-900/40 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                <div className="absolute bottom-[20%] left-[30%] w-[30vw] h-[30vw] bg-cyan-900/10 rounded-full blur-[80px] animate-pulse-slow delay-700" />
            </div>

            {/* Content Highlight Glow - Follows center of screen vertically */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/5 to-transparent h-full w-full" />

            {/* Cyber Grid - Perspective Plane */}
            <motion.div
                style={{ y: y1, rotateX: 60 }}
                className="absolute inset-[-50%] w-[200%] h-[200%] opacity-20"
            >
                <div className="w-full h-full bg-[linear-gradient(to_right,#ef4444_1px,transparent_1px),linear-gradient(to_bottom,#ef4444_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </motion.div>

            {/* Secondary Glitch Grid - Offset & Cyan */}
            <motion.div
                style={{ y: y2, rotateX: 60, x: 20 }}
                className="absolute inset-[-50%] w-[200%] h-[200%] opacity-10 mix-blend-screen"
            >
                <div className="w-full h-full bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </motion.div>

            {/* Floating Binary Integers */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                    <FloatingBinary key={i} index={i} />
                ))}
            </div>

            {/* Vignette Overlay for focus */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        </motion.div>
    )
}

function FloatingBinary({ index }: { index: number }) {
    const randomLeft = Math.random() * 100
    const randomDuration = Math.random() * 20 + 10
    const randomDelay = Math.random() * 5

    return (
        <motion.div
            className="absolute top-full text-red-500/20 font-mono text-xs select-none"
            style={{ left: `${randomLeft}%` }}
            animate={{
                y: "-120vh",
                opacity: [0, 1, 0]
            }}
            transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay,
                ease: "linear"
            }}
        >
            {Math.random() > 0.5 ? "1" : "0"}
        </motion.div>
    )
}

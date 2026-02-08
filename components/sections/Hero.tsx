"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { MousePointer2 } from "lucide-react"

const FRAME_COUNT = 26

export function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [currentFrame, setCurrentFrame] = useState(1)

    // Dynamic Content State
    const [heroContent, setHeroContent] = useState({
        title: "KEVIN CHACHA",
        subtitle: "Freelancer",
        role: "Architecte du Digital"
    })

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('*')
            if (data) {
                const settings: any = {}
                data.forEach((item: any) => settings[item.key] = item.value)
                setHeroContent({
                    title: settings['hero_title'] || "KEVIN CHACHA",
                    subtitle: settings['hero_subtitle'] || "Freelancer",
                    role: "Architecte du Digital"
                })
            }
        }
        fetchSettings()
    }, [])

    // Preload Images
    useEffect(() => {
        let loadedCount = 0
        const images: HTMLImageElement[] = []

        for (let i = 1; i <= FRAME_COUNT; i++) {
            const img = new Image()
            img.src = `/assets/hero-sequence/ezgif-frame-${i.toString().padStart(3, "0")}.png`
            img.onload = () => {
                loadedCount++
                if (loadedCount === FRAME_COUNT) {
                    setIsLoaded(true)
                }
            }
            images.push(img)
        }
    }, [])

    // Scroll Logic
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    // Smooth physics for frame transition
    const smoothProgress = useSpring(scrollYProgress, { mass: 0.5, stiffness: 50, damping: 15 })

    // Map scroll progress (0..1) to frame index (1..26)
    const frameIndex = useTransform(smoothProgress, [0, 1], [1, FRAME_COUNT])

    // Opacity fades for text elements based on scroll
    // Opacity fades for text elements - Text stays visible longer (60% of scroll)
    const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
    const textScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.8])
    const textBlur = useTransform(scrollYProgress, [0, 0.6], ["0px", "10px"])

    // Fade to black at the very end to blend perfectly with next section
    const bottomShadeOpacity = useTransform(scrollYProgress, [0.85, 1], [0, 1])

    // Update current frame state for rendering
    useMotionValueEvent(frameIndex, "change", (latest) => {
        const frame = Math.round(latest)
        // Clamp between 1 and FRAME_COUNT
        setCurrentFrame(Math.min(Math.max(frame, 1), FRAME_COUNT))
    })

    return (
        <section ref={containerRef} className="relative h-[200vh] bg-black">

            {/* STICKY CONTAINER: Stays fixed while we scroll through the 300vh section */}
            <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

                {/* 1. ANIMATION LAYER */}
                <div className="absolute inset-0 z-0">
                    <div className="relative w-full h-full">
                        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay for contrast */}

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" style={{ backgroundSize: "100% 2px, 3px 100%" }} />

                        <img
                            src={`/assets/hero-sequence/ezgif-frame-${currentFrame.toString().padStart(3, "0")}.png`}
                            alt="Hero Animation"
                            className={cn(
                                "w-full h-full object-cover transition-opacity duration-500",
                                isLoaded ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {/* Dramatic Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 z-20" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 opacity-60 z-20" />

                        {/* Cyber Grid Floor Transition */}
                        <motion.div
                            style={{ opacity: useTransform(scrollYProgress, [0.5, 1], [0, 1]), scale: useTransform(scrollYProgress, [0.5, 1], [0.8, 1.5]) }}
                            className="absolute bottom-[-20%] left-[-50%] w-[200%] h-[50%] bg-[linear-gradient(to_right,#202020_1px,transparent_1px),linear-gradient(to_bottom,#202020_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-30 transform perspective-[1000px] rotate-x-60"
                        />

                        {/* Bottom Transition Gradient */}
                        <motion.div
                            style={{ opacity: bottomShadeOpacity }}
                            className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-neutral-950 to-transparent z-40"
                        />
                    </div>
                </div>

                {/* 2. CREATIVE TYPOGRAPHY LAYER */}
                <motion.div
                    style={{ opacity: textOpacity, scale: textScale, filter: `blur(${textBlur})` }}
                    className="relative z-30 flex flex-col items-center justify-center text-center w-full px-4"
                >
                    {/* Top Tagline */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-[1px] bg-red-600/50" />
                        <span className="font-mono text-xs md:text-sm text-red-500 tracking-[0.3em] uppercase animate-pulse">
                            System Online
                        </span>
                        <div className="w-12 h-[1px] bg-red-600/50" />
                    </div>

                    {/* Massive Name - Glitch Style */}
                    <div className="relative mb-2">
                        <h1 className="font-orbitron font-black text-6xl md:text-9xl text-white tracking-tighter uppercase relative z-10 mix-blend-overlay">
                            {heroContent.title}
                        </h1>
                        <h1 className="font-orbitron font-black text-6xl md:text-9xl text-red-600 tracking-tighter uppercase absolute top-1 left-1 opacity-50 z-0 blur-[2px]">
                            {heroContent.title}
                        </h1>
                        <h1 className="font-orbitron font-black text-6xl md:text-9xl text-cyan-600 tracking-tighter uppercase absolute -top-1 -right-1 opacity-50 z-0 blur-[2px]">
                            {heroContent.title}
                        </h1>
                    </div>

                    {/* Subtitle / Role - Modern Badge Style */}
                    <div className="flex items-center gap-6 mb-12">
                        <div className="hidden md:block text-neutral-500 font-rajdhani text-sm rotate-180" style={{ writingMode: 'vertical-rl' }}>
                            EST. 2024
                        </div>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3 rounded-full relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                            <h2 className="font-rajdhani font-bold text-lg md:text-2xl text-white tracking-[0.2em] uppercase">
                                {heroContent.role} <span className="text-red-500 mx-2">//</span> {heroContent.subtitle}
                            </h2>
                        </div>

                        <div className="hidden md:block text-neutral-500 font-rajdhani text-sm" style={{ writingMode: 'vertical-rl' }}>
                            WK-47
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <Button
                            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
                            className="bg-red-600 hover:bg-red-700 text-white font-orbitron font-bold tracking-widest px-8 py-6 rounded-none skew-x-[-10deg] border border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all"
                        >
                            <span className="skew-x-[10deg]">EXPLORER</span>
                        </Button>

                        <Button
                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                            variant="outline"
                            className="bg-transparent hover:bg-white/5 text-white border-white/20 font-orbitron font-bold tracking-widest px-8 py-6 rounded-none skew-x-[-10deg] hover:border-red-500/50 hover:text-red-500 transition-all"
                        >
                            <span className="skew-x-[10deg]">ME CONTACTER</span>
                        </Button>
                    </div>

                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: textOpacity }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30"
                >
                    <span className="text-[10px] items-center gap-2 font-mono text-neutral-500 uppercase tracking-widest flex">
                        <MousePointer2 className="w-3 h-3" /> Scroll to Initialize
                    </span>
                    <div className="w-px h-12 bg-gradient-to-b from-red-500 to-transparent/10" />
                </motion.div>
            </div>
        </section>
    )
}

"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const AkatsukiCloud = ({ className = "", style = {} }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 162 103" className={className} style={style}>
        <path
            d="M81.5,0C69.3,0,58.3,5.3,50.8,13.7c-4.6,5.1-6.3,11.8-5.2,18.4c-0.6-0.1-1.3-0.1-1.9-0.1 c-17.7,0-32.5,12.7-35.6,29.8C3.1,64.2,0,69.5,0,75.4c0,15.2,12.3,27.6,27.6,27.6h106.9c15.2,0,27.6-12.3,27.6-27.6 c0-11-6.5-20.4-15.9-24.9c1.9-5.1,2.9-10.7,2.9-16.5C149.1,15.1,118.9,0,81.5,0z"
            fill="currentColor"
        />
        <path
            d="M81.5,4c35.1,0,63.6,14.2,63.6,31.7c0,5.4-0.9,10.6-2.7,15.4c-1.3,3.7,0.7,7.8,4.5,8.9 c8.1,2.5,14.1,10.2,14.1,19.4c0,11.3-9.1,20.4-20.4,20.4H33.5c-11.3,0-20.4-9.1-20.4-20.4c0-5.6,2.3-10.6,6-14.3 c2.8-2.8,3.2-7.2,1-10.5C17.3,49.8,16,45,16,40c0-18,14.6-32.9,33.5-35.3c0.6-0.1,1.3-0.1,1.9-0.1c1.2-4.9,2.8-9.8,6.8-14.2 C65.2,9,73.4,4,81.5,4 M81.5,0C69.3,0,58.3,5.3,50.8,13.7c-4.6,5.1-6.3,11.8-5.2,18.4c-0.6-0.1-1.3-0.1-1.9-0.1 c-17.7,0-32.5,12.7-35.6,29.8C3.1,64.2,0,69.5,0,75.4c0,15.2,12.3,27.6,27.6,27.6h106.9c15.2,0,27.6-12.3,27.6-27.6 c0-11-6.5-20.4-15.9-24.9c1.9-5.1,2.9-10.7,2.9-16.5C149.1,15.1,118.9,0,81.5,0L81.5,0z"
            fill="white"
            fillOpacity="0.8"
        />
    </svg>
)

export function AkatsukiBackground() {
    const { scrollYProgress } = useScroll()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Smooth transforms
    const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
    const moonY = useTransform(scrollYProgress, [0, 1], [0, 100])

    // Cloud movements (Parallax)
    const cloudX1 = useTransform(scrollYProgress, [0, 1], ["100vw", "-100vw"])
    const cloudX2 = useTransform(scrollYProgress, [0, 1], ["-50vw", "150vw"])
    const cloudX3 = useTransform(scrollYProgress, [0, 1], ["120vw", "-20vw"])

    return (
        <motion.div
            style={{ opacity }}
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#0a0505] to-[#1a0505]"
        >
            {/* 1. THE BLOOD MOON (Tsukuyomi) */}
            <motion.div
                style={{ y: moonY }}
                className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[60vh] h-[60vh] rounded-full opacity-20 blur-sm"
            >
                {/* Moon Body */}
                <div className="absolute inset-0 bg-red-600 rounded-full shadow-[0_0_100px_rgba(220,38,38,0.5)]" />
                {/* Craters/Texture */}
                <div className="absolute inset-4 bg-gradient-to-br from-transparent to-black/40 rounded-full" />
                <div className="absolute top-[20%] left-[20%] w-[15%] h-[15%] bg-black/10 rounded-full blur-md" />
                <div className="absolute bottom-[30%] right-[25%] w-[25%] h-[25%] bg-black/10 rounded-full blur-md" />
            </motion.div>

            {/* 2. RAIN (Amegakure vibe) */}
            <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[1px] bg-gradient-to-b from-transparent via-red-500/50 to-transparent animate-rain"
                        style={{
                            height: `${Math.random() * 20 + 10}%`,
                            left: `${Math.random() * 100}%`,
                            top: `-${Math.random() * 20}%`,
                            animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* 3. FLOATING AKATSUKI CLOUDS */}
            {mounted && (
                <>
                    {/* Cloud 1 - Foreground Large */}
                    <motion.div
                        style={{ x: cloudX1 }}
                        className="absolute top-[20%] w-64 h-40 opacity-80"
                    >
                        <AkatsukiCloud className="text-[#a80f0f] drop-shadow-[0_0_15px_rgba(255,0,0,0.4)]" />
                    </motion.div>

                    {/* Cloud 2 - Background Small */}
                    <motion.div
                        style={{ x: cloudX2 }}
                        className="absolute bottom-[30%] left-[10%] w-40 h-24 opacity-60 blur-[1px]"
                    >
                        <AkatsukiCloud className="text-[#800000] drop-shadow-[0_0_10px_rgba(180,0,0,0.3)]" />
                    </motion.div>

                    {/* Cloud 3 - Mid Huge */}
                    <motion.div
                        style={{ x: cloudX3 }}
                        className="absolute top-[60%] right-[10%] w-96 h-60 opacity-90 blur-[0.5px]"
                    >
                        <AkatsukiCloud className="text-[#c41e1e] drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]" />
                    </motion.div>
                </>
            )}

            {/* 4. RED MIST/FOG LAYERS */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-red-950/20 to-transparent" />

        </motion.div>
    )
}

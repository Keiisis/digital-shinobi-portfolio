"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function PagePreloader() {
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(() => setLoading(false), 500)
                    return 100
                }
                return prev + Math.random() * 15
            })
        }, 100)

        return () => clearInterval(timer)
    }, [])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Background Glitch noise */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                    {/* Centered Logo/Branding */}
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="font-orbitron text-4xl md:text-6xl font-black text-white tracking-widest mb-8 relative">
                                KEVIN CHACHA
                                <motion.div
                                    className="absolute -inset-2 border border-red-500/30"
                                    animate={{ opacity: [0.1, 0.5, 0.1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                />
                                <div className="absolute bottom-[-10px] left-0 w-full h-[1px] bg-red-600 shadow-[0_0_10px_#E50914]" />
                            </div>

                            {/* Loading Bar */}
                            <div className="w-64 h-1 bg-white/5 relative overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-0 left-0 bg-red-600 shadow-[0_0_15px_#E50914]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Status Text */}
                            <div className="mt-4 flex items-center justify-between w-64 font-mono text-[10px] text-red-500 tracking-tighter uppercase">
                                <span>Initializing System...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Technical details corner */}
                    <div className="absolute bottom-10 left-10 font-mono text-[8px] text-neutral-500 space-y-1">
                        <div>PROTOCOL: SHINOBI_SECURE_v2.0</div>
                        <div>KERNEL: DIGITAL_ARCH_v42</div>
                        <div>STATUS: BYPASSING GATEWAY...</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

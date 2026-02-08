"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useSpring, useMotionValue } from "framer-motion"

export function CustomCursor() {
    const [isVisible, setIsVisible] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    // Position of the actual mouse
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth position for the large ring
    const smoothX = useSpring(mouseX, { stiffness: 250, damping: 20, mass: 0.5 })
    const smoothY = useSpring(mouseY, { stiffness: 250, damping: 20, mass: 0.5 })

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
            if (!isVisible) setIsVisible(true)
        }

        const handleHoverStart = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-pointer')
            ) {
                setIsHovering(true)
            } else {
                setIsHovering(false)
            }
        }

        window.addEventListener("mousemove", moveMouse)
        window.addEventListener("mouseover", handleHoverStart)

        return () => {
            window.removeEventListener("mousemove", moveMouse)
            window.removeEventListener("mouseover", handleHoverStart)
        }
    }, [isVisible])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
            {/* Outer Ring */}
            <motion.div
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isHovering ? 2 : 1,
                    borderColor: isHovering ? "rgba(239, 68, 68, 0.8)" : "rgba(229, 9, 20, 0.3)",
                    borderWidth: isHovering ? 1 : 1.5,
                }}
                className="absolute w-8 h-8 rounded-full border border-red-500 transition-colors duration-300 flex items-center justify-center"
            >
                {/* Crosshair details inside ring */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-red-500/50" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-red-500/50" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-red-500/50" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-[1px] bg-red-500/50" />
            </motion.div>

            {/* Inner Dot */}
            <motion.div
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    scale: isHovering ? 0 : 1,
                    backgroundColor: "#EF4444"
                }}
                className="absolute w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />

            {/* Lagging Tech Lines (Visual Feast) */}
            <motion.div
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
                animate={{
                    opacity: isHovering ? 1 : 0,
                    rotate: isHovering ? 90 : 0
                }}
                className="absolute"
            >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-cyan-500/50" />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[1px] h-4 bg-cyan-500/50" />
            </motion.div>
        </div>
    )
}

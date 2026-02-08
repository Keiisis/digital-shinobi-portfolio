"use client"

import { motion, useScroll, useSpring } from "framer-motion"

export function ScrollProgress() {
    const { scrollYProgress } = useScroll()
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return (
        <motion.div
            className="fixed top-0 right-0 bottom-0 w-1 bg-neutral-900 z-50 origin-top"
        >
            <motion.div
                className="w-full bg-gradient-to-b from-red-600 via-red-500 to-cyan-500"
                style={{ scaleY, height: "100%" }}
            />
        </motion.div>
    )
}

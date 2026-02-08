"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { ProjectReactions } from "@/components/ui/ProjectReactions"

interface ProjectModalProps {
    project: any
    isOpen: boolean
    onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Use gallery images array if it exists and has items, otherwise fall back to single image_url
    const images = project?.images && project.images.length > 0
        ? project.images
        : project?.image_url ? [project.image_url] : []

    useEffect(() => {
        setCurrentImageIndex(0) // Reset on new project open
    }, [project])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowRight") nextImage()
            if (e.key === "ArrowLeft") prevImage()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [onClose])

    const nextImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }
    }

    const prevImage = () => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    if (!isOpen || !project) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-6xl h-[100dvh] md:h-[85vh] bg-neutral-900 border-none md:border md:border-white/10 rounded-none md:rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
                    >
                        {/* Close Button - Adapted for mobile safe area */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-red-600 rounded-full text-white transition-colors border border-white/10 backdrop-blur-md"
                        >
                            <X size={24} />
                        </button>

                        {/* Image Section (Left / Top) - 40% height on mobile, full width */}
                        <div className="relative w-full md:w-2/3 h-[40%] md:h-full bg-black flex items-center justify-center overflow-hidden group border-b border-white/10 md:border-b-0 md:border-r">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentImageIndex}
                                    src={images[currentImageIndex] || "/assets/placeholder.png"}
                                    alt={`Slide ${currentImageIndex + 1}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-contain p-4 md:p-0"
                                />
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                                        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/50 hover:bg-red-600 text-white rounded-full transition-all border border-white/10 backdrop-blur-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                                        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-black/50 hover:bg-red-600 text-white rounded-full transition-all border border-white/10 backdrop-blur-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>

                                    {/* Dots Indicator */}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {images.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? "bg-red-600 w-6" : "bg-white/30 w-1.5"}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Details Section (Right / Bottom) - 60% height on mobile */}
                        <div className="w-full md:w-1/3 h-[60%] md:h-full p-6 md:p-8 flex flex-col bg-neutral-900/95 backdrop-blur-xl overflow-y-auto custom-scrollbar relative">
                            {/* Gradient fade at top for mobile scroll hint */}
                            <div className="md:hidden absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-neutral-900 to-transparent pointer-events-none z-10" />

                            <div className="mt-2 md:mt-0 mb-6">
                                <span className="text-red-500 font-mono text-[10px] md:text-xs tracking-widest uppercase mb-2 block border-l-2 border-red-500 pl-3">
                                    {project.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white uppercase leading-tight mb-4">
                                    {project.title}
                                </h2>
                                <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-transparent mb-6" />
                            </div>

                            {/* Reactions Section */}
                            {project?.id && <ProjectReactions projectId={project.id} />}

                            <div className="prose prose-invert prose-sm text-neutral-400 mb-8 font-sans leading-relaxed text-sm md:text-base">
                                <p>{project.description || "Aucune description disponible pour ce projet."}</p>
                            </div>

                            <div className="mt-auto space-y-4 pb- safe-area-bottom">
                                {/* Tech Stack / Metadata Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['Digital', 'Creative', '2025'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-neutral-400 uppercase tracking-wider">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {project.link && (
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 md:py-4 px-6 uppercase tracking-widest transition-all md:skew-x-[-10deg] group rounded-lg md:rounded-none shadow-lg shadow-red-900/20"
                                    >
                                        <span className="md:skew-x-[10deg] flex items-center gap-2 text-sm md:text-base">
                                            Voir le projet <ExternalLink size={16} />
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

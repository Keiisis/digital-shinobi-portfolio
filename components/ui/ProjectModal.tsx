// ProjectModal - Enhanced with immersive fullscreen experience on mobile
"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { X, ChevronLeft, ChevronRight, ExternalLink, Sparkles, Eye, Calendar, Layers, PlayCircle } from "lucide-react"
import { ProjectReactions } from "@/components/ui/ProjectReactions"
import { useLanguage } from "@/app/context/LanguageContext"
import { useModal } from "@/app/context/ModalContext"
import { cn } from "@/lib/utils"

interface ProjectModalProps {
    project: any
    isOpen: boolean
    onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isFullscreenImage, setIsFullscreenImage] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const { t } = useLanguage()
    const { setProjectModalOpen } = useModal()

    // Swipe gesture for mobile
    const x = useMotionValue(0)
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

    // Images array logic with robustness check
    const rawImages = project?.images && project.images.length > 0
        ? project.images
        : project?.image_url ? [project.image_url] : []

    const images = rawImages.filter((img: string) => img && typeof img === 'string' && img.length > 0)

    // Notify context when modal opens/closes
    useEffect(() => {
        setProjectModalOpen(isOpen)
        return () => setProjectModalOpen(false)
    }, [isOpen, setProjectModalOpen])

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            document.body.style.touchAction = 'none'
        } else {
            document.body.style.overflow = ''
            document.body.style.touchAction = ''
        }
        return () => {
            document.body.style.overflow = ''
            document.body.style.touchAction = ''
        }
    }, [isOpen])

    useEffect(() => {
        setCurrentImageIndex(0)
        setImageLoaded(false)
    }, [project])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return
            if (e.key === "Escape") {
                if (isFullscreenImage) {
                    setIsFullscreenImage(false)
                } else {
                    onClose()
                }
            }
            if (e.key === "ArrowRight") nextImage()
            if (e.key === "ArrowLeft") prevImage()
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, isFullscreenImage, onClose])

    const nextImage = useCallback(() => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
            setImageLoaded(false)
        }
    }, [images.length])

    const prevImage = useCallback(() => {
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
            setImageLoaded(false)
        }
    }, [images.length])

    // Handle swipe gesture
    const handleDragEnd = (_: any, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 100) {
            if (info.offset.x > 0) {
                prevImage()
            } else {
                nextImage()
            }
        }
    }

    if (!isOpen || !project) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center"
                >
                    {/* Animated Background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black"
                    >
                        {/* Subtle animated gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-neutral-900/30" />
                        <motion.div
                            animate={{
                                backgroundPosition: ['0% 0%', '100% 100%'],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                repeatType: 'reverse'
                            }}
                            className="absolute inset-0 opacity-30"
                            style={{
                                backgroundImage: 'radial-gradient(circle at center, rgba(185, 28, 28, 0.1) 0%, transparent 50%)',
                                backgroundSize: '200% 200%'
                            }}
                        />
                    </motion.div>

                    {/* Premium Close Button - Always visible */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        onClick={onClose}
                        className="fixed top-4 right-4 z-[250] p-3 md:p-4 bg-black/60 hover:bg-red-600 active:bg-red-700 rounded-full text-white transition-all duration-300 border border-white/20 backdrop-blur-xl shadow-2xl shadow-black/50 group"
                        style={{
                            top: 'max(1rem, env(safe-area-inset-top))',
                            right: 'max(1rem, env(safe-area-inset-right))'
                        }}
                        aria-label="Fermer"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    </motion.button>

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full h-full md:w-[95vw] md:max-w-7xl md:h-[90vh] bg-neutral-950 md:border md:border-white/10 md:rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row"
                    >
                        {/* Left: Image Gallery Section */}
                        <div className="relative w-full md:w-2/3 h-[45%] md:h-full bg-black flex items-center justify-center overflow-hidden group">
                            {/* Decorative corner accents */}
                            <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-red-600/30 pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-red-600/30 pointer-events-none" />

                            {/* Image with swipe support */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={handleDragEnd}
                                    style={{ x, opacity }}
                                    className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                                    onClick={() => setIsFullscreenImage(true)}
                                >
                                    {/* Loading skeleton */}
                                    {!imageLoaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                                        </div>
                                    )}
                                    <img
                                        src={images[currentImageIndex] || "/assets/placeholder.png"}
                                        alt={`${project.title} - Image ${currentImageIndex + 1}`}
                                        onLoad={() => setImageLoaded(true)}
                                        className={cn(
                                            "w-full h-full object-contain p-4 md:p-8 transition-all duration-500",
                                            imageLoaded ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Expand hint */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/40 text-xs pointer-events-none"
                            >
                                <Eye size={14} />
                                <span className="hidden md:inline">{t("portfolio.click_expand", "Cliquer pour agrandir")}</span>
                                <span className="md:hidden">{t("portfolio.swipe_hint", "Glisser pour naviguer")}</span>
                            </motion.div>

                            {/* Navigation Arrows - Desktop */}
                            {images.length > 1 && (
                                <>
                                    <motion.button
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        onClick={(e) => { e.stopPropagation(); prevImage() }}
                                        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-red-600 text-white rounded-full transition-all duration-300 border border-white/10 backdrop-blur-sm hover:scale-110 hover:shadow-lg hover:shadow-red-600/30"
                                    >
                                        <ChevronLeft size={24} />
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        onClick={(e) => { e.stopPropagation(); nextImage() }}
                                        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-red-600 text-white rounded-full transition-all duration-300 border border-white/10 backdrop-blur-sm hover:scale-110 hover:shadow-lg hover:shadow-red-600/30"
                                    >
                                        <ChevronRight size={24} />
                                    </motion.button>
                                </>
                            )}

                            {/* Progress Dots */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-full">
                                    {images.map((_: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx) }}
                                            className={cn(
                                                "h-2 rounded-full transition-all duration-300",
                                                idx === currentImageIndex
                                                    ? "bg-red-600 w-6 shadow-lg shadow-red-600/50"
                                                    : "bg-white/30 w-2 hover:bg-white/50"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Image counter badge */}
                            {images.length > 1 && (
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-mono border border-white/10">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>

                        {/* Right: Details Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full md:w-1/3 h-[55%] md:h-full flex flex-col bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 overflow-hidden"
                        >
                            {/* Scrollable content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
                                {/* Category Badge */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-2 mb-4"
                                >
                                    <div className="w-8 h-[2px] bg-red-600" />
                                    <span className="text-red-500 font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase">
                                        {project.category}
                                    </span>
                                </motion.div>

                                {/* Title */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                    className="text-2xl md:text-3xl lg:text-4xl font-orbitron font-bold text-white uppercase leading-tight mb-6"
                                >
                                    {project.title}
                                </motion.h2>

                                {/* Meta info row */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-wrap gap-3 mb-6"
                                >
                                    {project.year && (
                                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                                            <Calendar size={12} />
                                            <span>{project.year}</span>
                                        </div>
                                    )}
                                    {project.client && (
                                        <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
                                            <Layers size={12} />
                                            <span>{project.client}</span>
                                        </div>
                                    )}
                                </motion.div>

                                {/* Reactions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.45 }}
                                    className="mb-6"
                                >
                                    {project?.id && <ProjectReactions projectId={project.id} />}
                                </motion.div>

                                {/* Description */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="prose prose-invert prose-sm text-neutral-400 mb-8 font-sans leading-relaxed"
                                >
                                    <p className="text-sm md:text-base">
                                        {project.description || t("portfolio.no_description")}
                                    </p>
                                </motion.div>

                                {/* Videos Section */}
                                {project.videos && project.videos.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="mb-8"
                                    >
                                        <h4 className="text-white font-orbitron text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <PlayCircle size={16} className="text-red-500" />
                                            {t("portfolio.video_content", "Contenu Vidéo")}
                                        </h4>
                                        <div className="space-y-4">
                                            {project.videos.map((videoUrl: string, idx: number) => {
                                                if (!videoUrl) return null;
                                                const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
                                                const isVimeo = videoUrl.includes('vimeo.com');

                                                let embedUrl = videoUrl;
                                                if (isYoutube) {
                                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                    const match = videoUrl.match(regExp);
                                                    if (match && match[2].length === 11) {
                                                        embedUrl = `https://www.youtube.com/embed/${match[2]}`;
                                                    }
                                                } else if (isVimeo) {
                                                    const match = videoUrl.match(/vimeo.com\/(\d+)/);
                                                    if (match) {
                                                        embedUrl = `https://player.vimeo.com/video/${match[1]}`;
                                                    }
                                                }

                                                return (
                                                    <div key={idx} className="aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                                                        <iframe
                                                            src={embedUrl}
                                                            className="w-full h-full"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        ></iframe>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Tech Tags */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55 }}
                                    className="flex flex-wrap gap-2 mb-6"
                                >
                                    {(project.tags || ['Digital', 'Creative', '2025']).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-neutral-400 uppercase tracking-wider hover:bg-red-600/10 hover:border-red-600/30 hover:text-red-400 transition-all cursor-default"
                                        >
                                            <Sparkles size={10} className="inline mr-1" />
                                            {tag}
                                        </span>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Fixed CTA at bottom */}
                            {project.link && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="p-4 md:p-6 border-t border-white/5 bg-black/40 backdrop-blur-sm"
                                    style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                                >
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-6 uppercase tracking-widest transition-all duration-300 rounded-xl group shadow-lg shadow-red-900/30 hover:shadow-red-600/40 hover:-translate-y-0.5"
                                    >
                                        <span className="text-sm">{t("portfolio.view_project", "Voir le projet")}</span>
                                        <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Fullscreen Image Overlay */}
                    <AnimatePresence>
                        {isFullscreenImage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[300] bg-black flex items-center justify-center"
                                onClick={() => setIsFullscreenImage(false)}
                            >
                                <button
                                    onClick={() => setIsFullscreenImage(false)}
                                    className="absolute top-4 right-4 z-[310] p-3 bg-white/10 hover:bg-red-600 text-white rounded-full transition-all border border-white/20"
                                    style={{ top: 'max(1rem, env(safe-area-inset-top))' }}
                                >
                                    <X size={24} />
                                </button>
                                <motion.img
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    src={images[currentImageIndex]}
                                    alt={project.title}
                                    className="max-w-full max-h-full object-contain p-4"
                                />
                                {images.length > 1 && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                                        {currentImageIndex + 1} / {images.length}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

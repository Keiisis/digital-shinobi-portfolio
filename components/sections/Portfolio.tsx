"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { ProjectModal } from "@/components/ui/ProjectModal"

export function Portfolio() {
    const [activeTab, setActiveTab] = useState("TOUT")
    const [projects, setProjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState<any | null>(null)

    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false })

            if (data) setProjects(data)
            setLoading(false)
        }

        fetchProjects()
    }, [])

    const filteredProjects = activeTab === "TOUT"
        ? projects
        : projects.filter(p => p.category?.toUpperCase() === activeTab)

    return (
        <section id="portfolio" className="py-24 relative">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="font-heading text-3xl font-bold text-[#E50914] tracking-[0.2em] mb-12 uppercase drop-shadow-[0_0_15px_rgba(229,9,20,0.8)]">
                        Mes Missions
                    </h2>

                    {/* Tabs matching ref: Red underline for active, subtle text for others */}
                    <div className="flex flex-wrap justify-center gap-8 mb-16 border-b border-white/10 pb-1">
                        {["TOUT", "DESIGN GRAPHIQUE", "WEB DESIGN", "AUTOMATISATION", "COMMUNITY MANAGEMENT"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveTab(filter)}
                                className={`pb-4 px-2 text-[10px] md:text-xs font-heading tracking-widest transition-all relative ${activeTab === filter ? "text-white" : "text-neutral-500 hover:text-white"
                                    }`}
                            >
                                {filter}
                                {activeTab === filter && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E50914] shadow-[0_0_10px_#E50914]"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Grid matching ref: Rectangular, dark, text bottom left */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full text-center text-neutral-500 py-12">Chargement des missions...</div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="col-span-full text-center text-neutral-500 py-12">Aucune mission trouvée dans cette catégorie.</div>
                    ) : (
                        filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative aspect-[16/9] cursor-pointer"
                                onClick={() => {
                                    // Intelligent Click Handling
                                    if (project.link) {
                                        window.open(project.link, '_blank')
                                    } else if (project.file_url) {
                                        window.open(project.file_url, '_blank')
                                    } else {
                                        // Open Modal for Gallery/Details
                                        setSelectedProject(project)
                                    }
                                }}
                            >
                                {/* Image Container with "Cut Corner" clip path & Smart Cropping */}
                                <div className="absolute inset-0 clip-path-tech overflow-hidden bg-neutral-900 border border-neutral-800 group-hover:border-red-600/50 transition-colors"
                                    style={{ clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)" }}>

                                    {/* Smart Object Position: object-cover ensures 16:9 fill. center center usually best for smart crop */}
                                    <img
                                        src={project.image_url || "/assets/placeholder.png"}
                                        alt={project.title}
                                        className="object-cover w-full h-full opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                                        style={{ objectPosition: 'center' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </div>

                                {/* Text Overlay */}
                                <div className="absolute bottom-4 left-6 z-10 w-[80%]">
                                    <h3 className="text-sm font-heading font-bold text-white mb-1 uppercase tracking-wider truncate">{project.title}</h3>
                                    <span className="text-[10px] text-red-500 font-mono uppercase tracking-widest">{project.category}</span>
                                </div>

                                {/* Link Indicator - Dynamic Icon based on type */}
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-2 rounded-full border border-red-500/30">
                                    {project.category === 'AUTOMATISATION' ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    ) : project.link ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </div>

                                {/* Decorative Tech Dots */}
                                <div className="absolute bottom-2 right-2 flex gap-1">
                                    <div className="w-1 h-1 bg-red-600 rounded-full" />
                                    <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                                    <div className="w-1 h-1 bg-neutral-600 rounded-full" />
                                </div>
                            </motion.div>
                        )))}
                </div>
            </div>

            {/* Project Modal */}
            <ProjectModal
                project={selectedProject}
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </section>
    )
}

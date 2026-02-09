"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
    Download,
    Search,
    Trash2,
    Linkedin,
    Loader2,
    Zap,
    Mail,
    MapPin,
    Briefcase,
    Users,
    Globe,
    ExternalLink,
    ChevronDown,
    Building2
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import * as XLSX from 'xlsx'

interface Prospect {
    id: string
    created_at: string
    name: string
    email: string | null
    phone: string | null
    region: string
    domain: string
    source: string
    notes: string | null
}

interface JobOffer {
    id: string
    created_at: string
    title: string
    company: string
    location: string
    link: string
    category: string
    region: string
    description: string
}

const REGIONS = ["AFRIQUE", "EUROPE", "ASIE", "AMÉRIQUE DU NORD", "AMÉRIQUE DU SUD", "OCÉANIE"]
const DOMAINS = ["WEB DESIGN", "AUTOMATISATION", "UI/UX", "COMMUNITY MANAGEMENT", "COPYWRITING"]

export default function AdminDonneesClients() {
    const [activeTab, setActiveTab] = useState<'prospects' | 'jobs'>('prospects')
    const [prospects, setProspects] = useState<Prospect[]>([])
    const [jobs, setJobs] = useState<JobOffer[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRegion, setSelectedRegion] = useState(REGIONS[1])
    const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0])
    const [isScraping, setIsScraping] = useState(false)
    const [scrapingProgress, setScrapingProgress] = useState(0)
    const [showExportModal, setShowExportModal] = useState(false)

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)
        if (activeTab === 'prospects') {
            const { data, error } = await supabase
                .from('prospects')
                .select('*')
                .order('created_at', { ascending: false })
            if (!error && data) setProspects(data)
        } else {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })
            if (!error && data) setJobs(data)
        }
        setLoading(false)
    }

    const exportToExcel = (type: 'prospects' | 'jobs') => {
        const dataToExport = type === 'prospects' ? prospects : jobs
        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, type === 'prospects' ? "Prospects" : "Offres_Emploi")
        XLSX.writeFile(workbook, `Shinobi_${type}_${new Date().toISOString().split('T')[0]}.xlsx`)
        setShowExportModal(false)
    }

    const startScraping = async () => {
        setIsScraping(true)
        setScrapingProgress(10)

        const timer = setInterval(() => {
            setScrapingProgress(prev => (prev < 95 ? prev + 3 : prev))
        }, 800)

        try {
            const endpoint = activeTab === 'prospects' ? '/api/prospects/scrape' : '/api/jobs/scrape'
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ region: selectedRegion, domain: selectedDomain })
            })

            const data = await response.json()
            clearInterval(timer)
            setScrapingProgress(100)

            if (data.error) {
                alert(`Erreur d'infiltration : ${data.error}`)
                return
            }

            setTimeout(async () => {
                await fetchData()
                alert(`${data.count} ${activeTab === 'prospects' ? 'profils réels' : 'offres d\'emploi'} détectés et archivés !`)
            }, 500)

        } catch (error) {
            console.error("Scraping error:", error)
            alert("Échec de la connexion aux capteurs distants.")
        } finally {
            setTimeout(() => {
                setIsScraping(false)
                setScrapingProgress(0)
            }, 1000)
        }
    }

    const deleteItem = async (id: string) => {
        if (!confirm("Effacer définitivement cette donnée ?")) return
        const table = activeTab === 'prospects' ? 'prospects' : 'jobs'
        if (activeTab === 'prospects') setProspects(prev => prev.filter(p => p.id !== id))
        else setJobs(prev => prev.filter(j => j.id !== id))
        await supabase.from(table).delete().eq('id', id)
    }

    const filteredProspects = prospects.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const filteredJobs = jobs.filter(j =>
        j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 pb-20">
            {/* Header Dynamique */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="font-orbitron text-3xl text-white font-bold tracking-wider uppercase flex items-center gap-3">
                        <Users className="text-red-500" /> Données Clients {activeTab === 'jobs' ? '& Offres' : ''}
                    </h1>
                    <p className="text-neutral-400 font-mono text-xs mt-1 uppercase tracking-widest">
                        Terminal d'Intelligence de Marché • {activeTab === 'prospects' ? 'Cibles Prospects' : 'Opportunités Business'}
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowExportModal(!showExportModal)}
                        className="flex items-center gap-2 px-6 py-2.5 border border-red-500 bg-red-600/20 text-red-500 rounded text-xs font-bold font-orbitron hover:bg-red-600 hover:text-white transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                    >
                        <Download className="w-4 h-4" /> EXPORTER LES RAPPORTS <ChevronDown className="w-3 h-3" />
                    </button>

                    <AnimatePresence>
                        {showExportModal && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-white/10 rounded-lg shadow-2xl z-50 p-2 overflow-hidden"
                            >
                                <button
                                    onClick={() => exportToExcel('prospects')}
                                    className="w-full text-left px-4 py-3 text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-white/5 rounded transition-colors uppercase flex items-center gap-2"
                                >
                                    <Users className="w-3.5 h-3.5" /> Base Prospects
                                </button>
                                <button
                                    onClick={() => exportToExcel('jobs')}
                                    className="w-full text-left px-4 py-3 text-[10px] font-bold text-neutral-400 hover:text-white hover:bg-white/5 rounded transition-colors uppercase flex items-center gap-2 border-t border-white/5"
                                >
                                    <Briefcase className="w-3.5 h-3.5" /> Offres d'Emploi
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation par Onglets */}
            <div className="flex border-b border-white/5 gap-8">
                <button
                    onClick={() => setActiveTab('prospects')}
                    className={cn(
                        "pb-4 px-2 text-xs font-bold font-orbitron tracking-widest transition-all relative",
                        activeTab === 'prospects' ? "text-red-500" : "text-neutral-500 hover:text-white"
                    )}
                >
                    PARCHEMINS PROSPECTS (CIBLES)
                    {activeTab === 'prospects' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444]" />}
                </button>
                <button
                    onClick={() => setActiveTab('jobs')}
                    className={cn(
                        "pb-4 px-2 text-xs font-bold font-orbitron tracking-widest transition-all relative",
                        activeTab === 'jobs' ? "text-cyan-400" : "text-neutral-500 hover:text-white"
                    )}
                >
                    MISSIONS DÉTECTÉES (OFFRES)
                    {activeTab === 'jobs' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />}
                </button>
            </div>

            {/* Zone Principale */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Panel de Scraping (Gauche) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 space-y-6 sticky top-24">
                        <div className={cn(
                            "flex items-center gap-2 font-orbitron text-sm font-bold tracking-widest",
                            activeTab === 'prospects' ? "text-red-500" : "text-cyan-400"
                        )}>
                            <Globe className={cn("w-5 h-5", isScraping && "animate-spin")} />
                            {activeTab === 'prospects' ? 'SCRAPER CIBLES' : 'SCANNER MISSIONS'}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2 font-mono">Région du Monde</label>
                                <select
                                    value={selectedRegion}
                                    onChange={(e) => setSelectedRegion(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                >
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-2 font-mono">Domaine & Arsenal</label>
                                <select
                                    value={selectedDomain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                >
                                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={startScraping}
                                disabled={isScraping}
                                className={cn(
                                    "w-full flex items-center justify-center gap-3 py-4 rounded font-bold font-orbitron tracking-widest transition-all disabled:opacity-50 relative overflow-hidden group shadow-lg",
                                    activeTab === 'prospects' ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20" : "bg-cyan-600 hover:bg-cyan-700 text-black shadow-cyan-900/20"
                                )}
                            >
                                {isScraping ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        INFILTRATION...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                        {activeTab === 'prospects' ? 'Lancer Infiltration' : 'Détecter Missions'}
                                        <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                    </>
                                )}
                            </button>
                        </div>

                        {isScraping && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                                    <span className="animate-pulse">Scannage des serveurs LinkedIn...</span>
                                    <span>{scrapingProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${scrapingProgress}%` }}
                                        className={cn("h-full transition-all duration-300", activeTab === 'prospects' ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-cyan-400 shadow-[0_0_10px_#22d3ee]")}
                                    />
                                </div>
                            </div>
                        )}

                        <p className="text-[9px] text-neutral-600 leading-tight italic font-mono">
                            Chaque requête scanne des milliers d'indexations réelles pour te fournir les cibles les plus pertinentes de {selectedRegion}.
                        </p>
                    </div>
                </div>

                {/* Tableaux de Données (Droite) */}
                <div className="lg:col-span-3 bg-neutral-900/30 border border-white/5 rounded-xl p-6 flex flex-col gap-6 min-h-[600px]">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative group flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={activeTab === 'prospects' ? "Nom, email ou domaine..." : "Titre de poste, entreprise..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-neutral-700"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {activeTab === 'prospects' ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">
                                            <th className="px-4 py-4">Cible / Profil</th>
                                            <th className="px-4 py-4">Intelligence Contact</th>
                                            <th className="px-4 py-4">Secteur / Géo</th>
                                            <th className="px-4 py-4">Source</th>
                                            <th className="px-4 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {filteredProspects.map((p) => (
                                                <motion.tr
                                                    key={p.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600/20 to-red-900/40 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs">
                                                                {p.name?.charAt(0).toUpperCase() || '?'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-white tracking-wide">{p.name || 'Profil Exa'}</span>
                                                                <span className="text-[10px] text-neutral-600 font-mono truncate max-w-[200px]">{p.notes?.split('URL:')[0]}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                                                                <Mail className="w-3 h-3 text-neutral-600" /> {p.email || 'Email non public'}
                                                            </div>
                                                            {p.phone && (
                                                                <div className="text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                                                                    <Zap className="w-3 h-3 text-yellow-500" /> {p.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-[10px] text-neutral-500 flex items-center gap-1 uppercase tracking-tighter">
                                                                <MapPin className="w-2.5 h-2.5 text-red-500/50" /> {p.region}
                                                            </div>
                                                            <div className="text-[10px] text-cyan-400 flex items-center gap-1 font-bold">
                                                                <Briefcase className="w-2.5 h-2.5" /> {p.domain}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-[8px] font-bold px-2 py-0.5 rounded border border-white/5 bg-white/5 text-neutral-500 uppercase tracking-widest">
                                                            {p.source}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {p.notes?.includes('http') && (
                                                                <a
                                                                    href={p.notes.split('URL: ')[1]}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="p-2 text-neutral-500 hover:text-cyan-400 transition-colors"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            )}
                                                            <button
                                                                onClick={() => deleteItem(p.id)}
                                                                className="p-2 text-neutral-700 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">
                                            <th className="px-4 py-4">Opportunité / Poste</th>
                                            <th className="px-4 py-4">Entreprise</th>
                                            <th className="px-4 py-4">Secteur / Géo</th>
                                            <th className="px-4 py-4 text-right">Détails</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {filteredJobs.map((j) => (
                                                <motion.tr
                                                    key={j.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="border-b border-white/5 hover:bg-cyan-400/[0.02] transition-colors group"
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase">
                                                                {j.title?.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-bold text-white tracking-wide">{j.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2 text-xs text-neutral-400 tracking-wide font-mono">
                                                            <Building2 className="w-3.5 h-3.5 text-neutral-600" /> {j.company}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-[10px] text-neutral-500 flex items-center gap-1 uppercase tracking-tighter">
                                                                <MapPin className="w-2.5 h-2.5 text-cyan-500/50" /> {j.region}
                                                            </div>
                                                            <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-bold">
                                                                <Target className="w-2.5 h-2.5 hidden" /> {j.category}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <a
                                                                href={j.link}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-3 py-1.5 rounded bg-cyan-900/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase hover:bg-cyan-500 hover:text-black transition-all flex items-center gap-2"
                                                            >
                                                                Ouvrir Offre <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                            <button
                                                                onClick={() => deleteItem(j.id)}
                                                                className="p-2 text-neutral-700 hover:text-red-500 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            )}

                            {(activeTab === 'prospects' ? filteredProspects : filteredJobs).length === 0 && (
                                <div className="py-24 text-center">
                                    <Globe className="w-12 h-12 mx-auto mb-4 text-neutral-800 animate-pulse" />
                                    <div className="text-neutral-700 font-mono text-xs uppercase tracking-[0.4em]">
                                        Aucune donnée détectée dans ce secteur
                                    </div>
                                    <p className="text-[10px] text-neutral-800 mt-2">Préparez une infiltration via le panel gauche.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Target({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
        </svg>
    )
}

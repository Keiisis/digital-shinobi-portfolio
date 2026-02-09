"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Save, Loader2, Monitor, Type, Mail, User, Lock, Shield, Globe, Image as ImageIcon, Upload, Bot, Sparkles, Share2, Github, Linkedin, Twitter, Instagram, Zap, BarChart3, Terminal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { ImageUpload } from "@/components/ui/ImageUpload"
import { cn } from "@/lib/utils"

function AdminSettingsContent() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("PROFILE") // PROFILE | GLOBAL | NAVBAR | ASSISTANT
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [reportOutput, setReportOutput] = useState<string | null>(null)
    const [isGeneratingReport, setIsGeneratingReport] = useState(false)
    const [isBoostingSEO, setIsBoostingSEO] = useState(false)
    const [seoResult, setSeoResult] = useState<any>(null)

    const searchParams = useSearchParams()

    // Global Settings State
    const [settings, setSettings] = useState<Record<string, string>>({})

    // Assistant Settings State
    const [assistant, setAssistant] = useState({
        name: "Kevin Assistant",
        personality: "",
        tone: "",
        knowledge_base: "",
        system_prompt: "",
        is_active: true
    })

    // Profile State
    const [profile, setProfile] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        avatar_url: ""
    })

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab === 'GLOBAL') setActiveTab('GLOBAL')
        else if (tab === 'NAVBAR') setActiveTab('NAVBAR')
        else if (tab === 'ASSISTANT') setActiveTab('ASSISTANT')
        else if (tab === 'SOCIALS') setActiveTab('SOCIALS')
        else setActiveTab('PROFILE')

        fetchSettings()
        fetchUser()
        fetchAssistantSettings()
    }, [searchParams])

    const fetchAssistantSettings = async () => {
        const { data } = await supabase.from('assistant_settings').select('*').single()
        if (data) {
            setAssistant({
                name: data.name || "Kevin Assistant",
                personality: data.personality || "",
                tone: data.tone || "",
                knowledge_base: data.knowledge_base || "",
                system_prompt: data.system_prompt || "",
                is_active: data.is_active ?? true
            })
        }
    }

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setProfile(prev => ({
                ...prev,
                email: user.email!,
                username: user.user_metadata?.username || "",
                avatar_url: user.user_metadata?.avatar_url || ""
            }))
        }
    }

    const fetchSettings = async () => {
        try {
            const { data } = await supabase.from('site_settings').select('*')
            if (data) {
                const settingsMap: Record<string, string> = {}
                data.forEach((item: any) => { settingsMap[item.key] = item.value })
                setSettings(settingsMap)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveGlobal = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const updates = Object.entries(settings).map(([key, value]) => ({ key, value }))
            const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' })
            if (error) throw error
            setMessage({ type: 'success', text: "Configuration globale mise à jour." })
            // Trigger a custom event to notify listeners (e.g. Header)
            window.dispatchEvent(new Event('settingsUpdated'))
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur lors de la sauvegarde." })
        } finally {
            setSaving(false)
        }
    }

    const handleSaveAssistant = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const { error } = await supabase
                .from('assistant_settings')
                .update(assistant)
                .eq('id', '00000000-0000-0000-0000-000000000001') // Static ID from migration

            if (error) throw error
            setMessage({ type: 'success', text: "Paramètres de l'assistant IA mis à jour." })
        } catch (error) {
            console.error(error)
            setMessage({ type: 'error', text: "Erreur lors de la sauvegarde de l'assistant." })
        } finally {
            setSaving(false)
        }
    }

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true)
        setReportOutput(null)
        try {
            const res = await fetch('/api/admin/assistant/report', { method: 'POST' })
            const data = await res.json()
            if (data.report) setReportOutput(data.report)
            else throw new Error()
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur lors de la génération du rapport." })
        } finally {
            setIsGeneratingReport(false)
        }
    }

    const handleSEOBoost = async () => {
        setIsBoostingSEO(true)
        setSeoResult(null)
        try {
            const res = await fetch('/api/admin/assistant/seo-boost', { method: 'POST' })
            const data = await res.json()
            if (data.meta_description) {
                setSeoResult(data)
                // Automatiquement mettre à jour les réglages site
                const updates = [
                    { key: 'seo_description', value: data.meta_description },
                    { key: 'seo_keywords', value: data.keywords.join(', ') },
                    { key: 'seo_structured_data', value: JSON.stringify(data.structured_data) }
                ]
                await supabase.from('site_settings').upsert(updates, { onConflict: 'key' })
                setMessage({ type: 'success', text: "Boost SEO Neural activé et injecté dans la base." })
            } else throw new Error()
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur lors du Boost SEO." })
        } finally {
            setIsBoostingSEO(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const updates: any = {
                email: profile.email,
                data: {
                    username: profile.username,
                    avatar_url: profile.avatar_url
                }
            }

            if (profile.password) {
                if (profile.password !== profile.confirmPassword) {
                    throw new Error("Les mots de passe ne correspondent pas.")
                }
                updates.password = profile.password
            }

            const { error } = await supabase.auth.updateUser(updates)
            if (error) throw error

            setMessage({ type: 'success', text: "Profil mis à jour. Vérifiez votre email si vous l'avez changé." })
            setProfile(prev => ({ ...prev, password: "", confirmPassword: "" }))
            // Trigger a custom event for profile updates
            window.dispatchEvent(new Event('profileUpdated'))
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || "Erreur de mise à jour du profil." })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-12 text-center text-neutral-500 font-mono animate-pulse">Chargement du système...</div>

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div>
                <h1 className="font-orbitron text-3xl text-white font-bold tracking-wider mb-2">
                    PARAMÈTRES DU SYSTÈME <span className="text-red-600 text-sm align-middle ml-2">// CONFIGURATION</span>
                </h1>
                <p className="text-neutral-400 text-xs font-mono">Gérez votre identité et les réglages globaux du site.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("PROFILE")}
                    className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${activeTab === "PROFILE" ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
                >
                    <User className="w-4 h-4 inline-block mr-2" /> Mon Profil
                    {activeTab === "PROFILE" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("GLOBAL")}
                    className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${activeTab === "GLOBAL" ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
                >
                    <Globe className="w-4 h-4 inline-block mr-2" /> Site Global
                    {activeTab === "GLOBAL" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("NAVBAR")}
                    className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${activeTab === "NAVBAR" ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
                >
                    <Globe className="w-4 h-4 inline-block mr-2" /> Navbar
                    {activeTab === "NAVBAR" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("ASSISTANT")}
                    className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${activeTab === "ASSISTANT" ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
                >
                    <Sparkles className="w-4 h-4 inline-block mr-2 text-amber-400" /> Assistant IA
                    {activeTab === "ASSISTANT" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                </button>
                <button
                    onClick={() => setActiveTab("SOCIALS")}
                    className={`px-6 py-3 text-sm font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${activeTab === "SOCIALS" ? "text-red-500" : "text-neutral-500 hover:text-white"}`}
                >
                    <Share2 className="w-4 h-4 inline-block mr-2 text-cyan-400" /> Comptes Sociaux
                    {activeTab === "SOCIALS" && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                </button>
            </div>

            {/* Messages */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded border flex items-center gap-3 ${message.type === 'error' ? 'bg-red-900/20 border-red-500/50 text-red-200' : 'bg-green-900/20 border-green-500/50 text-green-200'
                        }`}
                >
                    {message.type === 'error' ? <Shield className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    {message.text}
                </motion.div>
            )}

            {/* TAB CONTENT: PROFILE */}
            {activeTab === "PROFILE" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <form onSubmit={handleUpdateProfile} className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 md:p-8 space-y-6 backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="w-20 h-20 rounded-full bg-red-900/20 border border-red-500/30 overflow-hidden relative group">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-red-500">
                                        <User className="w-8 h-8" />
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Compte Kage</h3>
                                <p className="text-neutral-500 text-xs font-mono">Modifiez votre identité numérique.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Nom d'utilisateur</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
                                        <input
                                            type="text"
                                            value={profile.username}
                                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded pl-10 p-3 text-white focus:border-red-500 outline-none transition-colors"
                                            placeholder="Ex: KEVIN CHACHA"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <ImageUpload
                                        value={profile.avatar_url}
                                        onChange={(url: string) => setProfile({ ...profile, avatar_url: url })}
                                        label="Avatar du Profil (Image)"
                                        className="h-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded pl-10 p-3 text-white focus:border-red-500 outline-none transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Nouveau mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
                                        <input
                                            type="password"
                                            value={profile.password}
                                            onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded pl-10 p-3 text-white focus:border-red-500 outline-none transition-colors"
                                            placeholder="Laisser vide pour ne pas changer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Confirmer le mot de passe</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-600" />
                                        <input
                                            type="password"
                                            value={profile.confirmPassword}
                                            onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded pl-10 p-3 text-white focus:border-red-500 outline-none transition-colors"
                                            placeholder="Répéter le mot de passe"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-white text-black hover:bg-red-600 hover:text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Mettre à jour le profil
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* TAB CONTENT: GLOBAL SETTINGS */}
            {activeTab === "GLOBAL" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 md:p-8 space-y-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="w-16 h-16 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-500">
                                <Monitor className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Configuration Site</h3>
                                <p className="text-neutral-500 text-xs font-mono">Réglages visibles sur le frontend.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2 mt-4 mb-2 pb-2 border-b border-white/5">
                                <h4 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-red-500" /> Elements du Header & Branding
                                </h4>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Nom du Site (Logo Text)</label>
                                <input
                                    type="text"
                                    value={settings['site_name'] || ''}
                                    onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors font-orbitron tracking-widest"
                                    placeholder="DIGITAL SHINOBI"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <ImageUpload
                                    value={settings['site_logo'] || ''}
                                    onChange={(url) => setSettings({ ...settings, site_logo: url })}
                                    label="Logo du Site (Image)"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <ImageUpload
                                    value={settings['site_favicon'] || ''}
                                    onChange={(url) => setSettings({ ...settings, site_favicon: url })}
                                    label="Favicon du Site (Icône)"
                                />
                                <div className="mt-2 p-3 bg-blue-900/10 border border-blue-500/20 rounded flex items-start gap-3">
                                    <Monitor className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                                    <div className="text-[10px] text-blue-200 font-mono">
                                        <strong className="block text-blue-400 mb-1">RECOMMANDATION OPTIMALE :</strong>
                                        Pour un résultat parfait sur tous les navigateurs, utilisez une image <strong>carrée</strong> (ratio 1:1).<br />
                                        Taille recommandée : <strong>32x32 pixels</strong> ou <strong>64x64 pixels</strong>.<br />
                                        Format : <strong>.PNG</strong> ou <strong>.ICO</strong>.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Titre Hero (H1)</label>
                                <input
                                    type="text"
                                    value={settings['hero_title'] || ''}
                                    onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors font-orbitron tracking-widest"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Sous-titre Hero</label>
                                <input
                                    type="text"
                                    value={settings['hero_subtitle'] || ''}
                                    onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Email de Contact (Public)</label>
                                <input
                                    type="email"
                                    value={settings['contact_email'] || ''}
                                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Numéro de Téléphone (Affichage)</label>
                                <input
                                    type="text"
                                    value={settings['contact_phone'] || ''}
                                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Numéro WhatsApp (Format: 229XXXXXXXX)</label>
                                <input
                                    type="text"
                                    value={settings['whatsapp_number'] || ''}
                                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors font-mono"
                                    placeholder="229XXXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={handleSaveGlobal}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Sauvegarder Config
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB CONTENT: NAVBAR */}
            {activeTab === "NAVBAR" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 md:p-8 space-y-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-500">
                                <Globe className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Configuration Navbar</h3>
                                <p className="text-neutral-500 text-xs font-mono">Personnalisez le menu de navigation.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="col-span-1 md:col-span-2">
                                <ImageUpload
                                    value={settings['site_logo'] || ''}
                                    onChange={(url) => setSettings({ ...settings, site_logo: url })}
                                    label="Logo Navbar (Carre recommandé)"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-4 mt-4">
                                <h4 className="text-red-500 font-bold uppercase text-xs mb-4 tracking-widest">Identité Visuelle (Texte)</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase text-neutral-400 mb-1">Logo Text (DS)</label>
                                        <input
                                            type="text"
                                            value={settings['navbar_logo_short'] || 'DS'}
                                            onChange={(e) => setSettings({ ...settings, navbar_logo_short: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-neutral-400 mb-1">Titre 1 (DIGITAL)</label>
                                        <input
                                            type="text"
                                            value={settings['navbar_title_primary'] || 'DIGITAL'}
                                            onChange={(e) => setSettings({ ...settings, navbar_title_primary: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] uppercase text-neutral-400 mb-1">Titre 2 (SHINOBI)</label>
                                        <input
                                            type="text"
                                            value={settings['navbar_title_secondary'] || 'SHINOBI'}
                                            onChange={(e) => setSettings({ ...settings, navbar_title_secondary: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded p-2 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-4 mt-4">
                                <h4 className="text-red-500 font-bold uppercase text-xs mb-4 tracking-widest">Liens de Navigation</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <span className="text-neutral-500 w-8 text-xs font-mono">01</span>
                                        <input
                                            type="text"
                                            value={settings['nav_link_1_label'] || 'Arsenal'}
                                            onChange={(e) => setSettings({ ...settings, nav_link_1_label: e.target.value })}
                                            className="flex-1 bg-black border border-white/10 rounded p-2 text-white text-sm"
                                            placeholder="Label pour #skills"
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-neutral-500 w-8 text-xs font-mono">02</span>
                                        <input
                                            type="text"
                                            value={settings['nav_link_2_label'] || 'Missions'}
                                            onChange={(e) => setSettings({ ...settings, nav_link_2_label: e.target.value })}
                                            className="flex-1 bg-black border border-white/10 rounded p-2 text-white text-sm"
                                            placeholder="Label pour #portfolio"
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-neutral-500 w-8 text-xs font-mono">03</span>
                                        <input
                                            type="text"
                                            value={settings['nav_link_3_label'] || 'Alliés'}
                                            onChange={(e) => setSettings({ ...settings, nav_link_3_label: e.target.value })}
                                            className="flex-1 bg-black border border-white/10 rounded p-2 text-white text-sm"
                                            placeholder="Label pour #clients"
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-neutral-500 w-8 text-xs font-mono">04</span>
                                        <input
                                            type="text"
                                            value={settings['nav_link_4_label'] || 'Témoignages'}
                                            onChange={(e) => setSettings({ ...settings, nav_link_4_label: e.target.value })}
                                            className="flex-1 bg-black border border-white/10 rounded p-2 text-white text-sm"
                                            placeholder="Label pour #testimonials"
                                        />
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <span className="text-neutral-500 w-8 text-xs font-mono">05</span>
                                        <input
                                            type="text"
                                            value={settings['nav_link_5_label'] || 'Transmission'}
                                            onChange={(e) => setSettings({ ...settings, nav_link_5_label: e.target.value })}
                                            className="flex-1 bg-black border border-white/10 rounded p-2 text-white text-sm"
                                            placeholder="Label pour #contact"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-4 mt-4">
                                <h4 className="text-red-500 font-bold uppercase text-xs mb-4 tracking-widest">Call To Action (Bouton)</h4>
                                <div>
                                    <label className="block text-[10px] uppercase text-neutral-400 mb-1">Texte du Bouton</label>
                                    <input
                                        type="text"
                                        value={settings['nav_cta_label'] || 'INITIATE'}
                                        onChange={(e) => setSettings({ ...settings, nav_cta_label: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded p-3 text-white text-sm font-bold tracking-wider"
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={handleSaveGlobal}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Sauvegarder Navbar
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB CONTENT: ASSISTANT SETTINGS */}
            {activeTab === "ASSISTANT" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    {/* Main Config */}
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 md:p-8 space-y-6 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />

                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="w-16 h-16 rounded-full bg-amber-900/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                                <Bot className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Kevin Assistant (IA)</h3>
                                <p className="text-neutral-500 text-xs font-mono">Configurez l'intelligence de votre site.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tools Section */}
                            <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Strategic Report Button */}
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-red-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={isGeneratingReport}
                                        className="relative w-full flex items-center justify-between p-4 bg-black border border-white/10 rounded-lg hover:border-amber-500/50 transition-all overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-amber-900/20 flex items-center justify-center text-amber-500">
                                                {isGeneratingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-bold text-white tracking-widest uppercase">Intelligence Report</h4>
                                                <p className="text-[10px] text-neutral-500 uppercase">Générer un briefing complet du site</p>
                                            </div>
                                        </div>
                                        <Bot className="w-4 h-4 text-amber-500/50 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                {/* SEO Neural Boost Button */}
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                    <button
                                        onClick={handleSEOBoost}
                                        disabled={isBoostingSEO}
                                        className="relative w-full flex items-center justify-between p-4 bg-black border border-white/10 rounded-lg hover:border-cyan-500/50 transition-all overflow-hidden"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-cyan-900/20 flex items-center justify-center text-cyan-500">
                                                {isBoostingSEO ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Zap className="w-5 h-5" />}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-sm font-bold text-white tracking-widest uppercase">SEO Neural Boost</h4>
                                                <p className="text-[10px] text-neutral-500 uppercase">Injection Blackhat & PNL Automatique</p>
                                            </div>
                                        </div>
                                        <Sparkles className="w-4 h-4 text-cyan-500/50 group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Report / Results Zone */}
                            {(reportOutput || seoResult) && (
                                <div className="col-span-1 md:col-span-2 space-y-4">
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="bg-black border border-white/10 rounded-lg overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-neutral-900/50">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                                <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                                <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                            </div>
                                            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                                                {reportOutput ? "Terminal Analysis Output" : "Neural Optimization Logs"}
                                            </span>
                                        </div>
                                        <div className="p-4 max-h-80 overflow-y-auto font-mono text-xs leading-relaxed text-neutral-300 custom-scrollbar">
                                            {reportOutput && (
                                                <div className="whitespace-pre-wrap">
                                                    <span className="text-amber-500">$ digital-shinobi --generate-strategic-brief</span><br />
                                                    <span className="text-blue-500">[INFO] Compiling database entries...</span><br />
                                                    <span className="text-blue-500">[INFO] Running Llama-3-70B Logic engine...</span><br /><br />
                                                    {reportOutput}
                                                </div>
                                            )}
                                            {seoResult && (
                                                <div className="space-y-4">
                                                    <div className="p-2 border border-cyan-500/20 bg-cyan-500/5 rounded">
                                                        <span className="text-cyan-500 font-bold tracking-widest text-[10px] uppercase">Injection PNL Réussie :</span>
                                                        <ul className="mt-2 list-disc list-inside space-y-1 text-cyan-200/80 italic">
                                                            {seoResult.pnl_hooks.map((hook: string, i: number) => (
                                                                <li key={i}>{hook}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <span className="text-green-500 font-bold text-[10px] uppercase">Status : </span>
                                                        <span className="text-white">Base de données mise à jour avec les nouvelles méta-données neurales.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Nom de l'Assistant</label>
                                <input
                                    type="text"
                                    value={assistant.name}
                                    onChange={(e) => setAssistant({ ...assistant, name: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors font-orbitron"
                                    placeholder="Ex: Kevin Assistant"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Ton de Voix</label>
                                <input
                                    type="text"
                                    value={assistant.tone}
                                    onChange={(e) => setAssistant({ ...assistant, tone: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
                                    placeholder="Ex: Professionnel et Amical"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest">Type de Personnalité</label>
                                <input
                                    type="text"
                                    value={assistant.personality}
                                    onChange={(e) => setAssistant({ ...assistant, personality: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors"
                                    placeholder="Ex: Un guide chaleureux et respectueux"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest flex items-center justify-between">
                                    Base de Connaissances (Ce qu'il sait de vous)
                                    <span className="text-[10px] text-neutral-600 font-normal italic">Soyez précis pour de meilleures réponses</span>
                                </label>
                                <textarea
                                    value={assistant.knowledge_base}
                                    onChange={(e) => setAssistant({ ...assistant, knowledge_base: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-amber-500 outline-none transition-colors h-40 resize-none font-sans text-sm"
                                    placeholder="Racontez votre parcours, vos expertises, vos tarifs, vos horaires..."
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest flex items-center justify-between">
                                    Prompt Système (Instructions Directes)
                                    <span className="text-[10px] text-red-500/50 font-normal italic font-mono uppercase">Avancé - Ne pas modifier sans savoir</span>
                                </label>
                                <textarea
                                    value={assistant.system_prompt}
                                    onChange={(e) => setAssistant({ ...assistant, system_prompt: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-red-500 outline-none transition-colors h-32 resize-none font-mono text-xs"
                                    placeholder="Instructions pour l'IA..."
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex items-center gap-4 p-4 border border-white/5 bg-black/30 rounded-lg">
                                <div className={`w-12 h-12 rounded flex items-center justify-center shrink-0 ${assistant.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                    <span className="text-xl">●</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Statut de l'Assistant</h4>
                                    <p className="text-xs text-neutral-500">Activez ou désactivez l'assistant sur tout le site.</p>
                                </div>
                                <button
                                    onClick={() => setAssistant({ ...assistant, is_active: !assistant.is_active })}
                                    className={cn(
                                        "px-4 py-2 rounded font-bold text-xs uppercase transition-all tracking-widest",
                                        assistant.is_active ? "bg-green-600 text-white" : "bg-neutral-800 text-neutral-500"
                                    )}
                                >
                                    {assistant.is_active ? 'Activé' : 'Désactivé'}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={handleSaveAssistant}
                                disabled={saving}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Initialiser l'Assistant
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB CONTENT: SOCIALS */}
            {activeTab === "SOCIALS" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <div className="bg-neutral-900/50 border border-white/5 rounded-xl p-6 md:p-8 space-y-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                            <div className="w-16 h-16 rounded-full bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                                <Share2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-wide">Comptes Sociaux</h3>
                                <p className="text-neutral-500 text-xs font-mono">Renseignez vos liens de réseaux sociaux pour le Footer.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LinkedIn */}
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Linkedin className="w-4 h-4 text-[#0077B5]" /> LinkedIn
                                </label>
                                <input
                                    type="url"
                                    value={settings['social_linkedin'] || ''}
                                    onChange={(e) => setSettings({ ...settings, social_linkedin: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors font-mono text-sm"
                                    placeholder="https://linkedin.com/in/votre-profil"
                                />
                            </div>

                            {/* Instagram */}
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Instagram className="w-4 h-4 text-[#E4405F]" /> Instagram
                                </label>
                                <input
                                    type="url"
                                    value={settings['social_instagram'] || ''}
                                    onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors font-mono text-sm"
                                    placeholder="https://instagram.com/votre-profil"
                                />
                            </div>

                            {/* GitHub */}
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Github className="w-4 h-4 text-white" /> GitHub
                                </label>
                                <input
                                    type="url"
                                    value={settings['social_github'] || ''}
                                    onChange={(e) => setSettings({ ...settings, social_github: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors font-mono text-sm"
                                    placeholder="https://github.com/votre-profil"
                                />
                            </div>

                            {/* Twitter/X */}
                            <div>
                                <label className="block text-xs uppercase text-neutral-400 mb-2 tracking-widest flex items-center gap-2">
                                    <Twitter className="w-4 h-4 text-[#1DA1F2]" /> Twitter / X
                                </label>
                                <input
                                    type="url"
                                    value={settings['social_twitter'] || ''}
                                    onChange={(e) => setSettings({ ...settings, social_twitter: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded p-3 text-white focus:border-cyan-500 outline-none transition-colors font-mono text-sm"
                                    placeholder="https://twitter.com/votre-profil"
                                />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Share2 className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                                <div className="text-xs text-cyan-200">
                                    <strong className="block text-cyan-400 mb-1">OÙ CES LIENS APPARAISSENT ?</strong>
                                    Ces liens seront affichés en bas de votre site dans la section <strong>Footer</strong>, juste en dessous de la description "DIGITAL {'>'} SHINOBI". Laissez un champ vide pour ne pas afficher l'icône correspondante.
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-white/5">
                            <button
                                onClick={handleSaveGlobal}
                                disabled={saving}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded font-bold uppercase text-sm tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Sauvegarder Réseaux
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}

function CheckCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}

export default function AdminSettingsPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-neutral-500 font-mono animate-pulse">Chargement du système...</div>}>
            <AdminSettingsContent />
        </Suspense>
    )
}

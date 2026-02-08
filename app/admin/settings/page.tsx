"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Save, Loader2, Monitor, Type, Mail, User, Lock, Shield, Globe, Image as ImageIcon, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { ImageUpload } from "@/components/ui/ImageUpload"

function AdminSettingsContent() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("PROFILE") // PROFILE | GLOBAL
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const searchParams = useSearchParams()

    // Global Settings State
    const [settings, setSettings] = useState<Record<string, string>>({})

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
        else setActiveTab('PROFILE')

        fetchSettings()
        fetchUser()
    }, [searchParams])

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

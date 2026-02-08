"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, User, Scan, AlertCircle, Fingerprint, ShieldCheck, ShieldAlert } from "lucide-react"
import { useLanguage } from "@/app/context/LanguageContext"

export default function LoginPage() {
    const [identity, setIdentity] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState("")
    const router = useRouter()
    const { t } = useLanguage()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setLoginStatus('idle')

        // Simulate scanning delay for effect
        await new Promise(r => setTimeout(r, 1500))

        try {
            let email = identity
            // Basic mapping for "Keys" -> email
            if (identity === 'Keys') {
                email = 'chefkeiis377@gmail.com'
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })

            if (authError) throw authError

            // SUCCESS
            console.log("Login successful, refreshing session...")
            setLoginStatus('success')

            // Force refresh to update server-side session state for middleware
            router.refresh()

            // Redirect after animation
            setTimeout(() => {
                console.log("Redirecting to /admin...")
                router.push('/admin')
            }, 2000)

        } catch (err: any) {
            // ERROR
            setLoginStatus('error')
            setErrorMessage("ACCÈS INTERDIT, VOUS N'ÊTES PAS KEYS")
            setLoading(false)

            // Reset status after a few seconds to allow retry
            setTimeout(() => {
                setLoginStatus('idle')
            }, 3000)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden font-body">

            {/* Background Image & Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" /> {/* Gradient Overlay */}

                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/login-bg.jpg"
                        alt="Digital Shinobi Login Background"
                        className="w-full h-full object-cover opacity-60"
                    />
                </motion.div>

                <div className="absolute inset-0 z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            </div>

            {/* MAIN FORM CONTAINER */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="w-full max-w-md p-1 relative z-30"
            >
                {/* Tech Frame */}
                <div className="absolute inset-0 border border-red-900/50 rounded-lg pointer-events-none">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-red-500" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-red-500" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500" />
                </div>

                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-8 shadow-[0_0_50px_rgba(220,38,38,0.2)]">

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/30 mb-4 animate-pulse">
                            <Scan className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="font-orbitron text-2xl text-white font-bold tracking-widest uppercase">
                            {t('login.title')}
                        </h1>
                        <p className="text-red-500/70 text-xs font-mono mt-2 tracking-widest">GATEKEEPER SYSTEM V.4.0 active</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Identité
                            </label>
                            <input
                                type="text"
                                value={identity}
                                onChange={(e) => setIdentity(e.target.value)}
                                placeholder="Email ou Username"
                                className="w-full bg-neutral-900/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none focus:bg-red-900/10 transition-all font-mono placeholder:text-neutral-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest flex items-center gap-2">
                                <Lock className="w-3 h-3" /> Clé de Sécurité
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-neutral-900/50 border border-white/10 rounded p-3 text-white focus:border-red-500 focus:outline-none focus:bg-red-900/10 transition-all font-mono placeholder:text-neutral-700"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-heading font-bold tracking-widest uppercase rounded transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <span className="relative flex items-center justify-center gap-3">
                                {loading ? "ANALYSE BIOMÉTRIQUE..." : t('login.submit')}
                                {!loading && <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            </span>
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[10px] text-neutral-600 font-mono">
                        <span>ID: GUA-SEC-01</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            SERVER ONLINE
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FULL SCREEN OVERLAYS FOR SUCCESS / ERROR */}
            <AnimatePresence>
                {loginStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-green-900/90 backdrop-blur-md flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="text-center"
                        >
                            <ShieldCheck className="w-32 h-32 text-green-400 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(74,222,128,0.5)]" />
                            <h2 className="font-orbitron font-bold text-5xl text-white tracking-widest mb-4 uppercase drop-shadow-lg">
                                ACCÈS <span className="text-green-400">AUTORISÉ</span>
                            </h2>
                            <p className="font-mono text-green-200 tracking-widest animate-pulse">BIENVENUE, KEYS.</p>
                        </motion.div>
                    </motion.div>
                )}

                {loginStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <ShieldAlert className="w-32 h-32 text-red-500 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-bounce" />
                            <h2 className="font-orbitron font-bold text-4xl md:text-5xl text-white tracking-widest mb-4 uppercase drop-shadow-lg glitch-text">
                                ACCÈS INTERDIT
                            </h2>
                            <p className="font-mono text-red-400 text-xl tracking-widest uppercase border-t border-b border-red-500 py-2">
                                VOUS N'ÊTES PAS KEYS
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

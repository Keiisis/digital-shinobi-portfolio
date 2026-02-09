"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface ExperienceContextType {
    playHover: () => void
    playClick: () => void
    playSwoosh: () => void
    isGlitchActive: boolean
    triggerGlitch: (duration?: number) => void
    toggleAudio: () => void
    isAudioPlaying: boolean
    audioVolume: number
    setAudioVolume: (val: number) => void
    settings: any // Typed lazily for now
}

const ExperienceContext = createContext<ExperienceContextType>({
    playHover: () => { },
    playClick: () => { },
    playSwoosh: () => { },
    isGlitchActive: false,
    triggerGlitch: () => { },
    toggleAudio: () => { },
    isAudioPlaying: false,
    audioVolume: 0.2,
    setAudioVolume: () => { },
    settings: {}
})

export const useExperience = () => useContext(ExperienceContext)

// Mini SFX Library (Base64 encoded for instant load/compression)
// Hover: Short high-tech blip
const SFX_HOVER = "data:audio/wav;base64,UklGRjYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACAgICAgICAgICAgICAgICAgICAgICAgIA=" // Placeholder (Silent) - replaced with real synth below
// Actually, generating tiny buffers via Web Audio API is lighter than base64 strings for simple beeps.

export function ExperienceProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<any>({})
    const [isGlitchActive, setIsGlitchActive] = useState(false)
    const [isAudioPlaying, setIsAudioPlaying] = useState(false)
    const [audioVolume, setAudioVolume] = useState(0.2)
    const [konamiIndex, setKonamiIndex] = useState(0)

    // Audio Refs
    const bgMusicRef = useRef<HTMLAudioElement | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    const router = useRouter()

    // KONAMI CODE: ↑ ↑ ↓ ↓ ← → ← → B A
    const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

    useEffect(() => {
        fetchSettings()

        // Init Audio Context for SFX
        const AudioCtor = (window.AudioContext || (window as any).webkitAudioContext)
        if (AudioCtor) {
            audioContextRef.current = new AudioCtor()
        }

        // Keyboard Listener
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!settings['xp_konami_code'] || settings['xp_konami_code'] === 'false') return

            if (e.key === KONAMI_CODE[konamiIndex]) {
                const nextIndex = konamiIndex + 1
                setKonamiIndex(nextIndex)
                if (nextIndex === KONAMI_CODE.length) {
                    executeShadowProtocol()
                    setKonamiIndex(0)
                }
            } else {
                setKonamiIndex(0)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [konamiIndex, settings])

    // Update BG Music volume real-time
    useEffect(() => {
        if (bgMusicRef.current) {
            bgMusicRef.current.volume = audioVolume
        }
    }, [audioVolume])

    // Manage BG Music Source
    useEffect(() => {
        const audioUrl = settings['xp_audio_url'] || '/audio/background.mp3'
        const initialVolume = parseFloat(settings['xp_audio_volume'] || '0.05')
        const audioEnabled = settings['xp_audio_enabled'] !== 'false'

        if (audioUrl && typeof window !== 'undefined') {
            if (!bgMusicRef.current) {
                bgMusicRef.current = new Audio(audioUrl)
                bgMusicRef.current.loop = true

                // Track actual playing state
                bgMusicRef.current.onplay = () => setIsAudioPlaying(true)
                bgMusicRef.current.onpause = () => setIsAudioPlaying(false)
            } else {
                const currentSrc = bgMusicRef.current.src
                const targetUrl = audioUrl.startsWith('http') ? audioUrl : window.location.origin + audioUrl

                if (currentSrc !== targetUrl) {
                    bgMusicRef.current.src = audioUrl
                }
            }

            bgMusicRef.current.volume = audioVolume
            setAudioVolume(initialVolume)

            // Attempt Autoplay / Handle First Interaction
            const startAudio = () => {
                if (audioEnabled && bgMusicRef.current && bgMusicRef.current.paused) {
                    bgMusicRef.current.play()
                        .then(() => {
                            // Cleanup listeners once playing starts
                            window.removeEventListener('click', startAudio)
                            window.removeEventListener('touchstart', startAudio)
                            window.removeEventListener('keydown', startAudio)
                        })
                        .catch(e => console.log("Autoplay still blocked", e))
                }
            }

            if (audioEnabled) {
                window.addEventListener('click', startAudio)
                window.addEventListener('touchstart', startAudio)
                window.addEventListener('keydown', startAudio)

                // Try playing immediately (might work if interaction already happened)
                startAudio()
            }

            return () => {
                window.removeEventListener('click', startAudio)
                window.removeEventListener('touchstart', startAudio)
                window.removeEventListener('keydown', startAudio)
            }
        }
    }, [settings['xp_audio_url'], settings['xp_audio_enabled']])

    const fetchSettings = async () => {
        const { data } = await supabase.from('site_settings').select('*')
        if (data) {
            const map: any = {}
            data.forEach((item: any) => map[item.key] = item.value)
            setSettings(map)

            // Set initial volume from DB if present
            if (map['xp_audio_volume']) {
                setAudioVolume(parseFloat(map['xp_audio_volume']))
            }
        }
    }

    const executeShadowProtocol = () => {
        console.log("🥷 SHADOW PROTOCOL INITIATED")
        triggerGlitch(3000)
        playSwoosh()

        // Invert colors physically via CSS filter on body
        document.documentElement.style.filter = "invert(1) hue-rotate(180deg)"
        setTimeout(() => {
            document.documentElement.style.filter = "none"
            if (settings['xp_konami_redirect']) {
                window.location.href = settings['xp_konami_redirect']
            } else {
                alert("ACCESS GRANTED: SHADOW SYSTEM UNLOCKED")
                // Here we could unlock a hidden admin mode or feature
            }
        }, 3000)
    }

    // --- SFX GENERATOR ---
    const playOscillator = (type: OscillatorType, freq: number, duration: number, vol = 0.1) => {
        if (settings['xp_sfx_enabled'] === 'false') return
        if (!audioContextRef.current) return

        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') ctx.resume()

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, ctx.currentTime + duration)

        gain.gain.setValueAtTime(vol, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start()
        osc.stop(ctx.currentTime + duration)
    }

    const playHover = () => {
        // High tech chirp - softer
        playOscillator('sine', 1500, 0.08, 0.01)
    }

    const playClick = () => {
        // Confirm beep - precise
        playOscillator('sine', 800, 0.15, 0.03)
    }

    const playSwoosh = () => {
        // Improved "Cyber Swoosh" using high-pass filtered white noise
        if (settings['xp_sfx_enabled'] === 'false') return
        if (!audioContextRef.current) return

        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') ctx.resume()

        const bufferSize = ctx.sampleRate * 0.4
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1
        }

        const noise = ctx.createBufferSource()
        noise.buffer = buffer

        const filter = ctx.createBiquadFilter()
        filter.type = 'highpass'
        filter.frequency.setValueAtTime(1000, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

        noise.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)

        noise.start()
        noise.stop(ctx.currentTime + 0.4)
    }

    const triggerGlitch = (duration = 300) => {
        if (settings['xp_visual_glitch'] === 'false') return
        setIsGlitchActive(true)
        setTimeout(() => setIsGlitchActive(false), duration)
    }

    const toggleAudio = () => {
        if (!bgMusicRef.current) return

        // Ensure AudioContext is resumed (required by most browsers)
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume()
        }

        if (isAudioPlaying) {
            bgMusicRef.current.pause()
        } else {
            bgMusicRef.current.play().catch(e => {
                console.error("Play failed", e)
                // If it fails, maybe it's the first interaction, try again or show UI
            })
        }
    }

    return (
        <ExperienceContext.Provider value={{
            playHover,
            playClick,
            playSwoosh,
            isGlitchActive,
            triggerGlitch,
            toggleAudio,
            isAudioPlaying,
            audioVolume,
            setAudioVolume,
            settings
        }}>
            {/* Global Glitch Overlay */}
            {isGlitchActive && (
                <div className="fixed inset-0 z-[9999] pointer-events-none mix-blend-difference bg-white/10">
                    <div className="absolute inset-0 animate-pulse bg-red-500/20 mix-blend-overlay" />
                </div>
            )}
            {children}
        </ExperienceContext.Provider>
    )
}

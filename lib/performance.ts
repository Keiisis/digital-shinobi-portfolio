// Performance optimization utilities for the Digital Shinobi portfolio

/**
 * Detects if the device is low-powered (mobile or slow GPU)
 */
export const isLowPowerDevice = (): boolean => {
    if (typeof window === 'undefined') return false

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return true

    // Check for mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    // Check for low memory (if available)
    const nav = navigator as any
    const lowMemory = nav.deviceMemory && nav.deviceMemory < 4

    // Check for slow connection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    const slowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')

    return isMobile || lowMemory || slowConnection
}

/**
 * Get optimized animation settings based on device capability
 */
export const getAnimationSettings = () => {
    const lowPower = isLowPowerDevice()

    return {
        // Hero frame animation
        frameCount: lowPower ? 10 : 26,  // Use fewer frames on low-power devices
        frameSkip: lowPower ? 3 : 1,     // Skip frames on low-power

        // Particle counts
        emberCount: lowPower ? 15 : 50,
        rainCount: lowPower ? 12 : 40,

        // Animation durations (longer = less CPU)
        particleDuration: lowPower ? 20 : 12,

        // Quality settings
        enableBlur: !lowPower,
        enableShadows: !lowPower,
        enableParallax: !lowPower,

        // Frame rate targeting
        targetFps: lowPower ? 30 : 60
    }
}

/**
 * Throttle function for scroll handlers
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean = false
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

/**
 * Request animation frame with throttling
 */
export const rafThrottle = <T extends (...args: any[]) => any>(
    callback: T
): ((...args: Parameters<T>) => void) => {
    let requestId: number | null = null

    return (...args: Parameters<T>) => {
        if (requestId === null) {
            requestId = requestAnimationFrame(() => {
                callback(...args)
                requestId = null
            })
        }
    }
}

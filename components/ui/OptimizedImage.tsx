"use client"

import Image from "next/image"
import { useState } from "react"

interface OptimizedImageProps {
    src: string
    alt: string
    fill?: boolean
    width?: number
    height?: number
    className?: string
    sizes?: string
    priority?: boolean
    quality?: number
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
}

// Low quality blur placeholder (tiny gray image)
const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQIDBAAFEQYHEiExQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/ANR3G1Lf7bf5MKJcpDUdh1TaUM4QhIBwAAOgPAFKUqxS1xkMTZ/Z/9k="

// Check if URL is from Supabase (safe for Next.js Image optimization)
const isOptimizable = (url: string): boolean => {
    if (!url) return false
    return url.includes('supabase.co') || url.startsWith('/')
}

export function OptimizedImage({
    src,
    alt,
    fill = false,
    width,
    height,
    className = "",
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    priority = false,
    quality = 75,
    objectFit = "cover"
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    // Fallback for failed images
    if (hasError || !src) {
        return (
            <div
                className={`bg-neutral-800 flex items-center justify-center ${className}`}
                style={fill ? { position: 'absolute', inset: 0 } : { width, height }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
            </div>
        )
    }

    const imageProps = {
        src,
        alt,
        quality,
        sizes,
        priority,
        className: `
            ${className}
            ${objectFit === "cover" ? "object-cover" : ""}
            ${objectFit === "contain" ? "object-contain" : ""}
            ${isLoading ? "scale-105 blur-sm" : "scale-100 blur-0"}
            transition-all duration-500 ease-out
        `,
        onLoad: () => setIsLoading(false),
        onError: () => setHasError(true),
        placeholder: "blur" as const,
        blurDataURL,
    }

    if (fill) {
        return <Image {...imageProps} fill />
    }

    return (
        <Image
            {...imageProps}
            width={width || 800}
            height={height || 600}
        />
    )
}

import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase only if env vars are present
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

import { LanguageProvider } from '@/app/context/LanguageContext'
import { ModalProvider } from '@/app/context/ModalContext'
import { ExperienceProvider } from '@/app/context/ExperienceContext'
import { CustomCursor } from "@/components/ui/CustomCursor"
import { PagePreloader } from "@/components/ui/PagePreloader"
import { KevinAssistant } from "@/components/ui/KevinAssistant"

import { siteConfig } from '@/config/site'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: `${siteConfig.name} | ${siteConfig.owner}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    icons: {
      icon: '/favicon.ico',
    },
    authors: [{ name: siteConfig.owner }],
    creator: siteConfig.owner,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={cn(
        "min-h-screen bg-black text-white antialiased font-body overflow-x-hidden selection:bg-red-600 selection:text-white",
        orbitron.variable,
        rajdhani.variable,
        inter.variable
      )}>
        <LanguageProvider>
          <ExperienceProvider>
            <ModalProvider>
              <PagePreloader />
              <CustomCursor />
              <KevinAssistant />
              {children}
            </ModalProvider>
          </ExperienceProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

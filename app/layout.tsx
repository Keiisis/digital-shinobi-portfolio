import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase for server-side metadata generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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
import { CustomCursor } from "@/components/ui/CustomCursor"
import { PagePreloader } from "@/components/ui/PagePreloader"
import { KevinAssistant } from "@/components/ui/KevinAssistant"


export async function generateMetadata(): Promise<Metadata> {
  // Fetch site settings for dynamic metadata
  const { data } = await supabase.from('site_settings').select('*')
  let favicon = '/favicon.ico' // Default

  if (data) {
    const settings = data.reduce((acc: any, item: any) => {
      acc[item.key] = item.value
      return acc
    }, {})
    if (settings.site_favicon) {
      favicon = settings.site_favicon
    }
  }

  return {
    title: 'Digital Shinobi | Kevin Chacha',
    description: 'Digital Shinobi Portfolio - Architecte du Digital',
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    }
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
          <PagePreloader />
          <CustomCursor />
          <KevinAssistant />
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

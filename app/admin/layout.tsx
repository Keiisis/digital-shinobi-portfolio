"use client"

import { useState } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import SystemFooter from '@/components/admin/SystemFooter'
import { AnimatePresence, motion } from 'framer-motion'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-black text-white font-rajdhani overflow-hidden flex flex-col relative selection:bg-red-500/30 selection:text-white">
            {/* Background - Nebula Image */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0 pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-black/80 z-0 pointer-events-none" />

            {/* Grid Overlay */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay" />

            {/* Main Layout */}
            <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1 relative">
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Mobile Backdrop */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                <main className="flex-1 lg:ml-64 mt-20 mb-12 p-4 md:p-8 overflow-y-auto z-10 relative scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent w-full">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <SystemFooter />
        </div>
    )
}

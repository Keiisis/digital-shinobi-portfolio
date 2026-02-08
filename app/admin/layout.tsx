import AdminHeader from '@/components/admin/AdminHeader'
import AdminSidebar from '@/components/admin/AdminSidebar'
import SystemFooter from '@/components/admin/SystemFooter'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-black text-white font-rajdhani overflow-hidden flex flex-col relative selection:bg-red-500/30 selection:text-white">
            {/* Background - Nebula Image handled by global css on body, but we ensure overlays here */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-40 z-0 pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-t from-red-950/20 via-transparent to-black/80 z-0 pointer-events-none" />

            {/* Grid Overlay */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay" />

            {/* Main Layout */}
            <AdminHeader />
            <AdminSidebar />

            <main className="flex-1 ml-64 mt-20 mb-12 p-8 overflow-y-auto z-10 relative scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
                {children}
            </main>

            <SystemFooter />
        </div>
    )
}

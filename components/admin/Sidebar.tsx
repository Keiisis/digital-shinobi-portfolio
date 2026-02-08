"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    FolderOpen,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    ShieldAlert
} from "lucide-react"

const navItems = [
    { label: "Tableau de Bord", href: "/admin", icon: LayoutDashboard },
    { label: "Missions (Projets)", href: "/admin/projects", icon: FolderOpen },
    { label: "Alliances (Témoignages)", href: "/admin/testimonials", icon: Users },
    { label: "Transmissions (Contact)", href: "/admin/messages", icon: MessageSquare }, // New route
    { label: "Configuration Système", href: "/admin/settings", icon: Settings },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-black border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-50">
            <div className="h-16 flex items-center px-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
                        K
                    </div>
                    <span className="font-orbitron font-bold text-white tracking-wider text-lg">
                        KAGE <span className="text-red-600">ADMIN</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                <div className="px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Principal
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-r-full text-sm font-medium transition-all duration-200 border-l-2",
                                isActive
                                    ? "bg-red-500/10 text-red-500 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                                    : "text-neutral-400 border-transparent hover:text-white hover:bg-white/5 hover:border-white/20"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-red-500" : "text-neutral-500 group-hover:text-white")} />
                            {item.label}
                        </Link>
                    )
                })}

                <div className="mt-8 px-4 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Système
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-r-full text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-500/10 hover:border-l-2 hover:border-red-500 transition-all duration-200">
                    <ShieldAlert className="w-5 h-5" />
                    <span>Security Logs</span>
                </button>
            </nav>

            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    )
}

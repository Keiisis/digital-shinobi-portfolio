"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Target,
    Briefcase,
    Users,
    MessageSquare,
    Settings,
    Mic2
} from "lucide-react"

const navItems = [
    { label: "TABLEAU DE BORD", href: "/admin", icon: LayoutDashboard },
    { label: "MES MISSIONS", href: "/admin/projects", icon: Target },
    { label: "MON ARSENAL", href: "/admin/skills", icon: Briefcase },
    { label: "MES ALLIANCES", href: "/admin/testimonials", icon: Users },
    { label: "PARTENAIRES", href: "/admin/clients", icon: Briefcase }, // Re-using Briefcase icon or finding another suitable one like Handshake if available, but Briefcase is fine or maybe tailored. Let's use 'Handshake' if available or 'Building2'. Briefcase is already used for Skills (Mon Arsenal). Let's swap or use 'Globe' or 'Building'.
    { label: "VOIX DES CLANS", href: "/admin/messages", icon: Mic2 },
    { label: "PARAMÈTRES GLOBAUX", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 flex flex-col fixed inset-y-0 left-0 z-50 pt-24 pb-8 px-4">
            <nav className="flex-1 space-y-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-4 px-4 py-3 rounded text-xs font-bold font-orbitron tracking-widest transition-all duration-300",
                                isActive
                                    ? "text-cyan-400 bg-cyan-950/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                    : "text-neutral-500 hover:text-red-500 hover:bg-red-950/10"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-cyan-400" : "text-neutral-600 group-hover:text-red-500")} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto px-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent mb-6" />
            </div>
        </aside>
    )
}

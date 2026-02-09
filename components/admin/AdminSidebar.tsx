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
    Mic2,
    Search
} from "lucide-react"

const navItems = [
    { label: "TABLEAU DE BORD", href: "/admin", icon: LayoutDashboard },
    { label: "MES MISSIONS", href: "/admin/projects", icon: Target },
    { label: "MON ARSENAL", href: "/admin/skills", icon: Briefcase },
    { label: "MES ALLIANCES", href: "/admin/testimonials", icon: Users },
    { label: "DONNÉES CLIENTS", href: "/admin/prospects", icon: Search },
    { label: "PARTENAIRES", href: "/admin/clients", icon: Briefcase },
    { label: "VOIX DES CLANS", href: "/admin/messages", icon: Mic2 },
    { label: "PARAMÈTRES GLOBAUX", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const pathname = usePathname()

    return (
        <aside className={cn(
            "w-64 flex flex-col fixed inset-y-0 left-0 z-[60] pt-24 pb-8 px-4 bg-black/95 lg:bg-transparent border-r border-white/5 lg:border-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-[20px_0_30px_rgba(0,0,0,0.5)] lg:shadow-none",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <nav className="flex-1 space-y-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "group flex items-center gap-4 px-4 py-3 rounded text-[10px] md:text-xs font-bold font-orbitron tracking-widest transition-all duration-300",
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

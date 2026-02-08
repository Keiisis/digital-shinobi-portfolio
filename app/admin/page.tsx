import AdminStats from "@/components/admin/AdminStats"
import MissionControl from "@/components/admin/MissionControl"
import { TestimonialScanner, QuickActions } from "@/components/admin/DashboardWidgets"

export default function AdminDashboard() {
    return (
        <div className="h-full flex flex-col">
            {/* 1. Stats Row */}
            <AdminStats />

            {/* 2. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                {/* Left Column: Mission Control (Projects) - Spans 2 cols */}
                <div className="lg:col-span-2 h-full min-h-[400px]">
                    <MissionControl />
                </div>

                {/* Right Column: Widgets */}
                <div className="flex flex-col gap-6">
                    <TestimonialScanner />
                    <div className="mt-auto">
                        <QuickActions />
                    </div>
                </div>
            </div>

            {/* 3. Bottom Area (QG Thumbnails - Optional based on reference showing footer content) */}
            <div className="mt-8">
                <h3 className="font-orbitron font-bold text-lg text-white mb-4 uppercase tracking-wider pl-2 border-l-2 border-red-500">QG du Kage</h3>
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-32 rounded-lg border border-white/10 bg-black/40 overflow-hidden relative group hover:border-red-500/50 transition-colors cursor-pointer">
                            <div className="absolute inset-0 bg-neutral-900" />
                            {/* Overlay info */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                                <div className="font-rajdhani font-bold text-white uppercase">Projet Alpha {item}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

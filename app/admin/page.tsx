import AdminStats from "@/components/admin/AdminStats"
import MissionControl from "@/components/admin/MissionControl"
import { TestimonialScanner, QuickActions } from "@/components/admin/DashboardWidgets"
import { ReactionStats, ProjectLeaderboard } from "@/components/admin/ReactionStats"

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
                    {/* Engagement Stats */}
                    <ReactionStats />

                    <TestimonialScanner />
                    <div className="mt-auto">
                        <QuickActions />
                    </div>
                </div>
            </div>

            {/* 3. Leaderboard Section */}
            <div className="mt-8">
                <h3 className="font-orbitron font-bold text-lg text-white mb-4 uppercase tracking-wider pl-2 border-l-2 border-red-500 flex items-center gap-3">
                    🏆 Projets Populaires
                    <span className="text-xs font-normal text-neutral-500">Classement en temps réel</span>
                </h3>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                    <ProjectLeaderboard limit={5} />
                </div>
            </div>
        </div>
    )
}


import { Terminal, Cpu, HardDrive } from "lucide-react"

export default function SystemFooter() {
    return (
        <footer className="h-12 border-t border-white/10 bg-black/80 backdrop-blur-md flex items-center px-4 md:px-6 justify-between text-[10px] font-mono text-neutral-500 fixed bottom-0 left-0 lg:left-64 right-0 z-40">
            <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 text-cyan-500/70">
                    <span className="bg-cyan-900/30 px-1 rounded text-cyan-400 font-bold">1</span>
                    <span className="uppercase tracking-wider">COMMAND_LINE_ACTIVE</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="hidden md:inline">SYSTEM_STATUS: NOMINAL</span>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="hidden xs:flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU: 35%</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden sm:flex items-center gap-1"><HardDrive className="w-3 h-3" /> GPU: 20%</span>
                </div>
            </div>
        </footer>
    )
}

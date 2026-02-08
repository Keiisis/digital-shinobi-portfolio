import { HeroSection as Hero } from "@/components/sections/Hero"
import { Skills } from "@/components/sections/Skills"
import { Portfolio } from "@/components/sections/Portfolio"
import { Clients } from "@/components/sections/Clients"
import { Testimonials } from "@/components/sections/Testimonials"
import { Contact } from "@/components/sections/Contact"
import { TestimonialSubmission } from "@/components/sections/TestimonialSubmission"
import { AmbientBackground } from "@/components/ui/AmbientBackground"
import { Footer } from "@/components/ui/Footer"
import { CyberpunkNavbar } from "@/components/ui/CyberpunkNavbar"
import { ScrollProgress } from "@/components/ui/ScrollProgress"
import { AkatsukiBackground } from "@/components/ui/AkatsukiBackground"

export default function Home() {
    return (
        <main className="min-h-screen bg-neutral-950 overflow-x-hidden selection:bg-red-500 selection:text-white relative">
            <ScrollProgress />
            <CyberpunkNavbar />
            <AmbientBackground />
            <AkatsukiBackground />

            <div className="relative z-10 flex flex-col gap-0">
                <div id="hero">
                    <Hero />
                </div>

                <section id="skills" className="relative">
                    <Skills />
                </section>

                <section id="portfolio" className="relative">
                    <Portfolio />
                </section>

                <section id="clients" className="relative">
                    <Clients />
                </section>

                <section id="testimonials" className="relative">
                    <Testimonials />
                    <TestimonialSubmission />
                </section>

                <section id="contact" className="relative">
                    <Contact />
                </section>

                <Footer />
            </div>
        </main>
    )
}

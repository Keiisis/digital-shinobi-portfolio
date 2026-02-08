import { Shield, Lock, FileText, Server } from "lucide-react"
import { Footer } from "@/components/ui/Footer"
import Link from "next/link"

export default function MentionsLegales() {
    return (
        <div className="min-h-screen bg-black text-white font-body selection:bg-red-500 selection:text-white">
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <Link href="/" className="font-orbitron font-bold text-2xl tracking-widest text-white">
                        DIGITAL <span className="text-red-500 mx-1">{'>'}</span> SHINOBI
                    </Link>
                    <Link href="/" className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
                        Retour à la base
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 pt-32 pb-24 max-w-4xl">
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-12 text-center uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
                    Mentions Légales
                </h1>

                <div className="space-y-12">
                    {/* Section 1: Identité */}
                    <div className="bg-neutral-900/30 border border-white/5 rounded-lg p-8 hover:border-red-900/30 transition-colors">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <Shield className="w-6 h-6" />
                            <h2 className="font-orbitron text-xl font-bold tracking-wider uppercase">1. Identité de l'Éditeur</h2>
                        </div>
                        <div className="text-neutral-400 space-y-2 font-mono text-sm leading-relaxed pl-9 border-l border-white/10">
                            <p><span className="text-white">Nom Commercial :</span> Digital Shinobi</p>
                            <p><span className="text-white">Responsable Publication :</span> Kevin Chacha</p>
                            <p><span className="text-white">Adresse :</span> Cotonou, Bénin</p>
                            <p><span className="text-white">Contact :</span> chefkeiis377@gmail.com</p>
                            <p><span className="text-white">Téléphone :</span> +229 01 97 20 90 37</p>
                        </div>
                    </div>

                    {/* Section 2: Hébergement */}
                    <div className="bg-neutral-900/30 border border-white/5 rounded-lg p-8 hover:border-red-900/30 transition-colors">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <Server className="w-6 h-6" />
                            <h2 className="font-orbitron text-xl font-bold tracking-wider uppercase">2. Hébergement</h2>
                        </div>
                        <div className="text-neutral-400 space-y-2 font-mono text-sm leading-relaxed pl-9 border-l border-white/10">
                            <p>Ce site est hébergé par Vercel Inc.</p>
                            <p>340 S Lemon Ave #4133 Walnut, CA 91789, USA</p>
                            <p><a href="https://vercel.com" className="hover:text-white underline underline-offset-4">https://vercel.com</a></p>
                        </div>
                    </div>

                    {/* Section 3: Propriété Intellectuelle */}
                    <div className="bg-neutral-900/30 border border-white/5 rounded-lg p-8 hover:border-red-900/30 transition-colors">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <Lock className="w-6 h-6" />
                            <h2 className="font-orbitron text-xl font-bold tracking-wider uppercase">3. Propriété Intellectuelle</h2>
                        </div>
                        <div className="text-neutral-400 font-light text-sm leading-relaxed pl-9 border-l border-white/10">
                            <p>
                                L'ensemble de ce site relève de la législation béninoise et internationale sur le droit d'auteur et la propriété intellectuelle.
                                Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                                La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Données Personnelles */}
                    <div className="bg-neutral-900/30 border border-white/5 rounded-lg p-8 hover:border-red-900/30 transition-colors">
                        <div className="flex items-center gap-3 mb-6 text-red-500">
                            <FileText className="w-6 h-6" />
                            <h2 className="font-orbitron text-xl font-bold tracking-wider uppercase">4. Données Personnelles</h2>
                        </div>
                        <div className="text-neutral-400 font-light text-sm leading-relaxed pl-9 border-l border-white/10">
                            <p className="mb-4">
                                Conformément aux lois en vigueur, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant.
                                Les informations collectées via le formulaire de contact sont exclusivement destinées à répondre à vos demandes et ne sont jamais vendues à des tiers.
                            </p>
                            <p>Pour exercer ce droit, contactez-nous par email à : <span className="text-white font-mono">chefkeiis377@gmail.com</span></p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export const siteConfig = {
    name: "Digital Shinobi",
    owner: "Kevin Chacha",
    role: "Architecte du Digital & Shinobi du Web",
    description: "Portfolio Immersif Haute Performance avec Intelligence de Prospection Intégrée",
    url: "https://votre-site.com",
    ogImage: "https://votre-site.com/og.jpg",
    links: {
        github: "https://github.com/votre-compte",
        linkedin: "https://linkedin.com/in/votre-profil",
    },
    contact: {
        email: "chefkeiis377@gmail.com",
        address: "Cotonou, Bénin",
    },
    theme: {
        primary: "#ef4444", // Red 500
        secondary: "#22d3ee", // Cyan 400
        accent: "#facc15", // Yellow 400
    },
    features: {
        aiScraper: true,
        aiEnhancer: true,
        emailSystem: true,
        dataExport: true,
    }
}

export type SiteConfig = typeof siteConfig

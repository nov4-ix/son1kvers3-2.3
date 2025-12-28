// Configuración de Apps - Ecosistema Son1kVers3
export const APPS_CONFIG = {
    // The Generator (Completo) - FUNCIONANDO
    generatorFull: {
        name: "The Generator",
        path: "/generator",
        external: true,
        externalUrl: "https://the-generator-nextjs-git-main-son1kvers3s-projects-c805d053.vercel.app",
        icon: "🎵",
        description: "Generador completo de música con IA",
        category: "primary",
        status: "active"
    },

    // Nova Post Pilot - FUNCIONANDO
    novaPostPilot: {
        name: "Nova Post Pilot",
        path: "/nova",
        external: true,
        externalUrl: "https://nova-post-pilot-27dl5sd8o-son1kvers3s-projects-c805d053.vercel.app",
        icon: "📊",
        description: "Marketing y analytics con IA",
        category: "primary",
        status: "active"
    },

    // Ghost Studio - PRÓXIMAMENTE
    ghostStudio: {
        name: "Ghost Studio",
        path: "/ghost-studio",
        external: true,
        externalUrl: "#",
        icon: "🎛️",
        description: "Mini DAW para covers y edición de audio",
        category: "primary",
        status: "pending",
        comingSoon: true
    },

    // El Santuario (Live Collaboration) - PRÓXIMAMENTE
    elSantuario: {
        name: "El Santuario",
        path: "/santuario",
        external: true,
        externalUrl: "#",
        icon: "🏛️",
        description: "Colaboraciones y chat en tiempo real",
        category: "social",
        status: "development",
        comingSoon: true
    }
};

// Pixel se maneja por separado como componente flotante
export const PIXEL_CONFIG = {
    enabled: true,
    defaultOpen: true,
    learningEnabled: true
};

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

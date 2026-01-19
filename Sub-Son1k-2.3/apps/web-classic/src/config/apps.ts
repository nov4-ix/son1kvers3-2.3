// Configuración de Apps - Ecosistema Son1kVers3
export const APPS_CONFIG = {
    // The Generator (Completo) - FUNCIONANDO
    generatorFull: {
        name: "The Generator",
        path: "/generator",
        external: false,
        icon: "🎵",
        description: "Generador completo con 6 Perillas Literarias y Lyric Studio",
        category: "primary",
        status: "active",
        features: ["6 Perillas Literarias", "Lyric Studio", "Optimizador de Prompts"]
    },

    // Nova Post Pilot - FUNCIONANDO
    novaPostPilot: {
        name: "Nova Post Pilot",
        path: "/nova",
        external: false,
        icon: "📊",
        description: "Marketing y analytics con IA",
        category: "primary",
        status: "active"
    },

    // Ghost Studio - FUNCIONANDO
    ghostStudio: {
        name: "Ghost Studio",
        path: "/ghost-studio",
        external: false,
        icon: "🎛️",
        description: "Mini DAW para covers y edición de audio",
        category: "primary",
        status: "active",
        comingSoon: false
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

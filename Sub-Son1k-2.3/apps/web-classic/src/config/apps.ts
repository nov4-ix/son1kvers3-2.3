// Configuración de Apps - Ecosistema Son1kVers3
export const APPS_CONFIG = {
    // The Generator (Completo) - FUNCIONANDO
    generatorFull: {
        name: "The Generator",
        path: "/generator",
        external: true,
        externalUrl: "https://the-generator-gpzj6pn9y-son1kvers3s-projects.vercel.app",
        icon: "🎵",
        description: "Generador completo de música con IA",
        category: "primary",
        status: "active"
    },

    // Ghost Studio - LISTO PARA DEPLOY
    ghostStudio: {
        name: "Ghost Studio",
        path: "/ghost-studio",
        external: true,
        externalUrl: "#", // Se actualizará después del deploy
        icon: "🎛️",
        description: "Mini DAW para covers y edición de audio",
        category: "primary",
        status: "pending"
    },

    // Nova Post Pilot - LISTO PARA DEPLOY
    novaPostPilot: {
        name: "Nova Post Pilot",
        path: "/nova",
        external: true,
        externalUrl: "#", // Se actualizará después del deploy
        icon: "📊",
        description: "Marketing y analytics con IA",
        category: "primary",
        status: "pending"
    },

    // El Santuario (Live Collaboration) - EN DESARROLLO
    elSantuario: {
        name: "El Santuario",
        path: "/santuario",
        external: true,
        externalUrl: "#",
        icon: "🏛️",
        description: "Colaboraciones y chat en tiempo real",
        category: "social",
        status: "development", // No está listo para deploy aún
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

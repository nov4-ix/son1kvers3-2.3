import { create } from 'zustand';

export interface Clip {
    id: string;
    trackId: string;
    audioBuffer: AudioBuffer | null; // Null si es placeholder o cargando
    url: string; // URL del blob para reproducción simple si es necesario
    startTime: number; // En segundos (posición en timeline)
    duration: number; // En segundos (duración del clip visible)
    offset: number; // En segundos (punto de inicio dentro del audio original)
    name: string;
    color?: string;
}

export interface Track {
    id: string;
    name: string;
    volume: number; // 0 a 1
    pan: number; // -1 a 1
    muted: boolean;
    soloed: boolean;
    color: string;
    clips: Clip[];
    isRecording: boolean;
}

interface DAWState {
    isPlaying: boolean;
    currentTime: number;
    tempo: number;
    tracks: Track[];
    selectedClipId: string | null;
    selectedTrackId: string | null;
    zoom: number; // Pixeles por segundo
    snapToGrid: boolean;

    // Actions
    setIsPlaying: (isPlaying: boolean) => void;
    setCurrentTime: (time: number) => void;
    setTempo: (tempo: number) => void;
    addTrack: (track?: Partial<Track>) => void;
    removeTrack: (trackId: string) => void;
    updateTrack: (trackId: string, updates: Partial<Track>) => void;
    addClip: (clip: Clip) => void;
    removeClip: (clipId: string) => void;
    updateClip: (clipId: string, updates: Partial<Clip>) => void;
    selectClip: (clipId: string | null) => void;
    selectTrack: (trackId: string | null) => void;
    setZoom: (zoom: number) => void;
    toggleSnap: () => void;
}

export const useDAWStore = create<DAWState>((set) => ({
    isPlaying: false,
    currentTime: 0,
    tempo: 120,
    tracks: [],
    selectedClipId: null,
    selectedTrackId: null,
    zoom: 50, // 50px por segundo por defecto
    snapToGrid: true,

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentTime: (currentTime) => set({ currentTime }),
    setTempo: (tempo) => set({ tempo }),

    addTrack: (track) => set((state) => {
        const newTrack: Track = {
            id: Math.random().toString(36).substr(2, 9),
            name: `Track ${state.tracks.length + 1}`,
            volume: 0.8,
            pan: 0,
            muted: false,
            soloed: false,
            color: getRandomColor(),
            clips: [],
            isRecording: false,
            ...track
        };
        return { tracks: [...state.tracks, newTrack] };
    }),

    removeTrack: (trackId) => set((state) => ({
        tracks: state.tracks.filter(t => t.id !== trackId)
    })),

    updateTrack: (trackId, updates) => set((state) => ({
        tracks: state.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t)
    })),

    addClip: (clip) => set((state) => ({
        tracks: state.tracks.map(t =>
            t.id === clip.trackId
                ? { ...t, clips: [...t.clips, clip] }
                : t
        )
    })),

    removeClip: (clipId) => set((state) => ({
        tracks: state.tracks.map(t => ({
            ...t,
            clips: t.clips.filter(c => c.id !== clipId)
        }))
    })),

    updateClip: (clipId, updates) => set((state) => ({
        tracks: state.tracks.map(t => ({
            ...t,
            clips: t.clips.map(c => c.id === clipId ? { ...c, ...updates } : c)
        }))
    })),

    selectClip: (selectedClipId) => set({ selectedClipId }),
    selectTrack: (selectedTrackId) => set({ selectedTrackId }),
    setZoom: (zoom) => set({ zoom }),
    toggleSnap: () => set((state) => ({ snapToGrid: !state.snapToGrid }))
}));

function getRandomColor() {
    const colors = ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF4400', '#8A2BE2'];
    return colors[Math.floor(Math.random() * colors.length)];
}

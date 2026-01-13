import { create } from 'zustand';

export interface Collaborator {
    id: string;
    name: string;
    color: string;
    avatar?: string;
    status: 'online' | 'idle' | 'offline';
}

export interface RemoteCursor {
    userId: string;
    trackId?: string;
    timestamp: number; // Position in seconds
    x: number; // Screen X (optional for UI overlays)
    y: number; // Screen Y (optional)
}

export interface Conflict {
    id: string;
    userId: string;
    resourceId: string; // e.g., trackId or regionId
    timestamp: number;
    description: string;
    resolved: boolean;
}

interface CollaborationState {
    isConnected: boolean;
    socketId: string | null;
    collaborators: Collaborator[];
    cursors: Record<string, RemoteCursor>;
    conflicts: Conflict[];

    // Actions
    setIsConnected: (connected: boolean) => void;
    setSocketId: (id: string | null) => void;
    addCollaborator: (user: Collaborator) => void;
    removeCollaborator: (userId: string) => void;
    updateCollaboratorStatus: (userId: string, status: Collaborator['status']) => void;
    updateCursor: (cursor: RemoteCursor) => void;
    addConflict: (conflict: Conflict) => void;
    resolveConflict: (conflictId: string) => void;
    setCollaborators: (users: Collaborator[]) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
    isConnected: false,
    socketId: null,
    collaborators: [],
    cursors: {},
    conflicts: [],

    setIsConnected: (connected) => set({ isConnected: connected }),
    setSocketId: (id) => set({ socketId: id }),

    addCollaborator: (user) => set((state) => {
        if (state.collaborators.find(c => c.id === user.id)) return state;
        return { collaborators: [...state.collaborators, user] };
    }),

    removeCollaborator: (userId) => set((state) => ({
        collaborators: state.collaborators.filter(c => c.id !== userId),
        // Also remove cursor
        cursors: Object.fromEntries(
            Object.entries(state.cursors).filter(([key]) => key !== userId)
        )
    })),

    updateCollaboratorStatus: (userId, status) => set((state) => ({
        collaborators: state.collaborators.map(c =>
            c.id === userId ? { ...c, status } : c
        )
    })),

    updateCursor: (cursor) => set((state) => ({
        cursors: {
            ...state.cursors,
            [cursor.userId]: cursor
        }
    })),

    addConflict: (conflict) => set((state) => ({
        conflicts: [...state.conflicts, conflict]
    })),

    resolveConflict: (conflictId) => set((state) => ({
        conflicts: state.conflicts.map(c =>
            c.id === conflictId ? { ...c, resolved: true } : c
        )
    })),

    setCollaborators: (users) => set({ collaborators: users })
}));

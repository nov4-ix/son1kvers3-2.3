import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface CollabUser {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    joinedAt: number;
}

export interface CursorPosition {
    x: number;
    y: number;
    timestamp: number;
}

export interface StateChange {
    userId: string;
    path: string;
    value: any;
    timestamp: number;
}

interface UseCollaborationReturn {
    users: CollabUser[];
    cursors: Map<string, CursorPosition>;
    state: Record<string, any>;
    isConnected: boolean;
    joinRoom: (roomId: string, user: CollabUser) => void;
    leaveRoom: () => void;
    updateState: (path: string, value: any) => void;
    moveCursor: (x: number, y: number) => void;
}

export function useCollaboration(
    serverUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
): UseCollaborationReturn {
    const [users, setUsers] = useState<CollabUser[]>([]);
    const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
    const [state, setState] = useState<Record<string, any>>({});
    const [isConnected, setIsConnected] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const currentRoomRef = useRef<string | null>(null);
    const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initialize Socket.io
        const socket = io(serverUrl, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Collab] Connected to server');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[Collab] Disconnected from server');
            setIsConnected(false);
        });

        // Room state
        socket.on('room:state', (data: {
            users: CollabUser[];
            state: Record<string, any>;
            cursors: Record<string, CursorPosition>;
        }) => {
            setUsers(data.users);
            setState(data.state);
            setCursors(new Map(Object.entries(data.cursors)));
        });

        // User joined
        socket.on('user:joined', (data: { user: CollabUser; socketId: string }) => {
            setUsers(prev => [...prev, data.user]);
        });

        // User left
        socket.on('user:left', (data: { userId: string }) => {
            setUsers(prev => prev.filter(u => u.id !== data.userId));
            setCursors(prev => {
                const newCursors = new Map(prev);
                newCursors.delete(data.userId);
                return newCursors;
            });
        });

        // Cursor update
        socket.on('cursor:update', (data: { userId: string; position: CursorPosition }) => {
            setCursors(prev => {
                const newCursors = new Map(prev);
                newCursors.set(data.userId, data.position);
                return newCursors;
            });
        });

        // State changed
        socket.on('state:changed', (data: { changes: StateChange[]; userId: string }) => {
            setState(prev => {
                const newState = { ...prev };
                data.changes.forEach(change => {
                    // Simple path resolver
                    const parts = change.path.split('.');
                    let target: any = newState;
                    for (let i = 0; i < parts.length - 1; i++) {
                        if (!target[parts[i]]) target[parts[i]] = {};
                        target = target[parts[i]];
                    }
                    target[parts[parts.length - 1]] = change.value;
                });
                return newState;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [serverUrl]);

    const joinRoom = useCallback((roomId: string, user: CollabUser) => {
        if (socketRef.current && isConnected) {
            currentRoomRef.current = roomId;
            socketRef.current.emit('room:join', { roomId, user });
        }
    }, [isConnected]);

    const leaveRoom = useCallback(() => {
        if (socketRef.current && currentRoomRef.current) {
            socketRef.current.emit('room:leave', currentRoomRef.current);
            currentRoomRef.current = null;
            setUsers([]);
            setCursors(new Map());
            setState({});
        }
    }, []);

    const updateState = useCallback((path: string, value: any) => {
        if (socketRef.current && currentRoomRef.current) {
            const change: StateChange = {
                userId: socketRef.current.id || 'unknown',
                path,
                value,
                timestamp: Date.now()
            };

            // Optimistic update
            setState(prev => {
                const newState = { ...prev };
                const parts = path.split('.');
                let target: any = newState;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!target[parts[i]]) target[parts[i]] = {};
                    target = target[parts[i]];
                }
                target[parts[parts.length - 1]] = value;
                return newState;
            });

            // Emit to server
            socketRef.current.emit('state:update', {
                roomId: currentRoomRef.current,
                changes: [change]
            });
        }
    }, []);

    const moveCursor = useCallback((x: number, y: number) => {
        if (socketRef.current && currentRoomRef.current) {
            // Throttle cursor updates to 60fps
            if (!throttleTimerRef.current) {
                throttleTimerRef.current = setTimeout(() => {
                    throttleTimerRef.current = null;
                }, 16); // ~60fps

                socketRef.current.emit('cursor:move', {
                    roomId: currentRoomRef.current,
                    position: { x, y, timestamp: Date.now() }
                });
            }
        }
    }, []);

    return {
        users,
        cursors,
        state,
        isConnected,
        joinRoom,
        leaveRoom,
        updateState,
        moveCursor
    };
}

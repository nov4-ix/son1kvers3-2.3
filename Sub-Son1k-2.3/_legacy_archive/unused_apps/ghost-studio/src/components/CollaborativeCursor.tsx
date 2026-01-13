'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { CollabUser, CursorPosition } from '../hooks/useCollaboration';

interface CollaborativeCursorProps {
    userId: string;
    user: CollabUser;
    position: CursorPosition;
}

export function CollaborativeCursor({ userId, user, position }: CollaborativeCursorProps) {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Smooth cursor movement with CSS transition
        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
        }
    }, [position]);

    return (
        <AnimatePresence>
            <motion.div
                ref={cursorRef}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
                style={{
                    left: 0,
                    top: 0,
                    willChange: 'transform'
                }}
            >
                {/* Cursor SVG */}
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={user.color}
                    className="drop-shadow-lg"
                >
                    <path d="M5.65 2.11a1 1 0 011.59.05l13.5 21a1 1 0 01-1.28 1.44l-5.47-2.88-3.61 6.5a1 1 0 01-1.74-.96l3.61-6.5-6.31-1.32a1 1 0 01-.29-1.84l13.5-15z" />
                </svg>

                {/* User Label */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-2 px-2 py-1 rounded text-xs font-semibold text-white shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: user.color }}
                >
                    {user.name}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

interface CollaborativeCursorsProps {
    users: CollabUser[];
    cursors: Map<string, CursorPosition>;
    localUserId: string;
}

export function CollaborativeCursors({ users, cursors, localUserId }: CollaborativeCursorsProps) {
    return (
        <>
            {users
                .filter(u => u.id !== localUserId)
                .map(user => {
                    const position = cursors.get(user.id);
                    if (!position) return null;

                    return (
                        <CollaborativeCursor
                            key={user.id}
                            userId={user.id}
                            user={user}
                            position={position}
                        />
                    );
                })}
        </>
    );
}

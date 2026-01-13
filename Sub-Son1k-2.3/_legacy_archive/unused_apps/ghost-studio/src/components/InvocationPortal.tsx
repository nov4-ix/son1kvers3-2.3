
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useStudioStore } from '../store/studioStore';
import { useAudioPlayerStore } from '../store/audioPlayerStore';

// --- Configuration ---
const COLORS = {
    bg: '#171925',
    primary: '#40FDAE', // Green Neon
    accent: '#B858FE',  // Purple
    secondary: '#047AF6', // Blue
    latent: '#15333B'   // Latent Mesh Base
};

// --- Components ---

function LatentCore({ isAnalyizing }: { isAnalyizing: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();

        // Rotation
        meshRef.current.rotation.x = t * 0.2;
        meshRef.current.rotation.y = t * 0.3;

        // Pulse effect when analyzing
        const scaleBase = 1.5;
        const pulse = isAnalyizing ? Math.sin(t * 10) * 0.2 : Math.sin(t * 2) * 0.05;
        meshRef.current.scale.setScalar(scaleBase + pulse);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[1, 32, 32]} ref={meshRef}>
                <meshStandardMaterial
                    color={isAnalyizing ? COLORS.accent : COLORS.latent}
                    wireframe
                    transparent
                    opacity={0.3}
                    emissive={isAnalyizing ? COLORS.accent : COLORS.latent}
                    emissiveIntensity={isAnalyizing ? 2 : 0.5}
                />
            </Sphere>
        </Float>
    );
}

function DataFlowParticles({ isPlaying }: { isPlaying: boolean }) {
    const count = 1000;
    const mesh = useRef<THREE.Points>(null);

    // Generate random positions
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20; // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (!mesh.current) return;

        // Flow speed depends on playing state
        const speed = isPlaying ? 0.15 : 0.02;

        // Access positions directly
        // @ts-ignore
        const positions = mesh.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            // Move particles towards camera (positive z)
            positions[i * 3 + 2] += speed;

            // Reset if too close
            if (positions[i * 3 + 2] > 5) {
                positions[i * 3 + 2] = -10;
            }
        }

        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color={COLORS.primary}
                transparent
                opacity={isPlaying ? 0.8 : 0.4}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

function InvocationPulse({ active }: { active: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame((state) => {
        if (!meshRef.current || !active) {
            if (meshRef.current) meshRef.current.scale.setScalar(0);
            return;
        }

        // Expansion animation loop
        const t = state.clock.getElapsedTime();
        const cycle = (t * 2) % 1; // 0 to 1

        meshRef.current.scale.setScalar(cycle * 15);
        if (materialRef.current) {
            materialRef.current.opacity = 1 - cycle;
        }
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshBasicMaterial
                ref={materialRef}
                color={COLORS.accent}
                transparent
                opacity={0}
                side={THREE.BackSide} // Render inside out for shockwave
            />
        </mesh>
    );
}

// --- Main Component ---

export function InvocationPortal() {
    const { isAnalyzing } = useStudioStore();
    const { isPlaying } = useAudioPlayerStore();

    // Mock typing state for now, user can connect it later
    const [isTyping, setIsTyping] = useState(false);

    // Listen for typing in window (simple heuristic)
    useEffect(() => {
        const handleKey = () => {
            setIsTyping(true);
            const timeout = setTimeout(() => setIsTyping(false), 500);
            return () => clearTimeout(timeout);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[#171925]">
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                {/* Cinematic Mist */}
                <color attach="background" args={[COLORS.bg]} />
                <fog attach="fog" args={[COLORS.bg, 2, 12]} />

                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color={COLORS.secondary} />
                <pointLight position={[-10, -10, -10]} intensity={2} color={COLORS.primary} />

                {/* Core Elements */}
                <LatentCore isAnalyizing={isAnalyzing || isTyping} />
                <DataFlowParticles isPlaying={isPlaying} />

                {/* Effects */}
                <InvocationPulse active={isAnalyzing || isTyping} />

                {/* Background Atmosphere */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
                <Sparkles count={50} scale={6} size={4} speed={0.4} opacity={0.5} color={COLORS.secondary} />
            </Canvas>
        </div>
    );
}

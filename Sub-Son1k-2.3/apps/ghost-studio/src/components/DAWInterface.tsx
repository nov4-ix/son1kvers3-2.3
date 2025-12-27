import React, { useEffect, useRef, useState } from 'react';
import { useDAWStore } from '../../store/dawStore';
import { audioEngine } from '../../lib/AudioEngine';
import { Play, Pause, Square, Plus, Mic, Volume2, Scissors, Magnet } from 'lucide-react';
import { TrackHeader } from './daw/TrackHeader';
import { Timeline } from './daw/Timeline';
import { TrackLane } from './daw/TrackLane';
import { PluginRack } from './daw/PluginRack';

export default function DAWInterface() {
    const {
        tracks,
        isPlaying,
        currentTime,
        addTrack,
        setIsPlaying,
        setCurrentTime,
        snapToGrid,
        toggleSnap,
        selectedTrackId
    } = useDAWStore();

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        audioEngine.init().then(() => setIsReady(true));
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioEngine.stopAll();
            setIsPlaying(false);
        } else {
            audioEngine.startPlayback(currentTime);
            setIsPlaying(true);
        }
    };

    const handleStop = () => {
        audioEngine.stopAll();
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Actualizar tiempo visualmente durante reproducción
    useEffect(() => {
        let raf: number;
        if (isPlaying) {
            const startTime = performance.now();
            const startAudioTime = currentTime;

            const loop = () => {
                const elapsed = (performance.now() - startTime) / 1000;
                setCurrentTime(startAudioTime + elapsed);
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
        }
        return () => cancelAnimationFrame(raf);
    }, [isPlaying]);

    return (
        <div className="flex flex-col h-[800px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
            {/* Toolbar */}
            <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePlayPause}
                        className={`p-2 rounded-full ${isPlaying ? 'bg-yellow-500 text-black' : 'bg-green-500 text-black'}`}
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button onClick={handleStop} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
                        <Square size={18} />
                    </button>
                    <div className="w-px h-8 bg-gray-700 mx-2" />
                    <div className="font-mono text-xl text-cyan-400">
                        {formatTime(currentTime)}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleSnap}
                        className={`p-2 rounded ${snapToGrid ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        title="Snap to Grid"
                    >
                        <Magnet size={18} />
                    </button>
                    <button className="p-2 rounded text-gray-400 hover:bg-gray-700" title="Split Tool">
                        <Scissors size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Track Headers (Left) */}
                <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col overflow-y-auto">
                    {tracks.map(track => (
                        <TrackHeader key={track.id} track={track} />
                    ))}
                    <button
                        onClick={() => addTrack()}
                        className="m-2 p-2 border-2 border-dashed border-gray-600 rounded text-gray-400 hover:border-gray-400 hover:text-gray-200 flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Track
                    </button>
                </div>

                {/* Timeline & Lanes (Right) */}
                <div className="flex-1 flex flex-col bg-gray-900 overflow-x-auto relative">
                    <Timeline />
                    <div className="flex-1 relative">
                        {/* Grid Background */}
                        <div className="absolute inset-0 pointer-events-none opacity-10"
                            style={{ backgroundImage: 'linear-gradient(90deg, #444 1px, transparent 1px)', backgroundSize: '50px 100%' }}
                        />

                        {tracks.map(track => (
                            <TrackLane key={track.id} track={track} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Plugin Rack (Bottom) */}
            {selectedTrackId && (
                <PluginRack trackId={selectedTrackId} />
            )}
        </div>
    );
}

function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

import React, { useState } from 'react';
import { Sliders, Zap, Activity, Waves } from 'lucide-react';
import { useDAWStore } from '../../store/dawStore';
import { audioEngine } from '../../lib/AudioEngine';
import { SpectralShaper } from '../../lib/effects/SpectralShaper';
import { PressureChamber } from '../../lib/effects/PressureChamber';
import { NebulaSpace } from '../../lib/effects/NebulaSpace';

interface Props {
    trackId: string;
}

export function PluginRack({ trackId }: Props) {
    const [activePlugin, setActivePlugin] = useState<string | null>(null);
    const [plugins, setPlugins] = useState<any[]>([]);

    const addPlugin = (type: string) => {
        const ctx = audioEngine.getContext();
        if (!ctx) return;

        let plugin;
        switch (type) {
            case 'eq':
                plugin = new SpectralShaper(ctx);
                break;
            case 'compressor':
                plugin = new PressureChamber(ctx);
                break;
            case 'reverb':
                plugin = new NebulaSpace(ctx);
                break;
        }

        if (plugin) {
            audioEngine.addEffect(trackId, plugin.input);
            // En una app real, necesitaríamos conectar el output del plugin al siguiente nodo
            // La implementación actual de AudioEngine.addEffect es simplificada y asume AudioNode simple
            // Para soportar nuestros plugins complejos (que tienen input/output separados),
            // AudioEngine necesitaría ser más inteligente o el plugin exponer un nodo unificado (GraphNode)
            // Por ahora, asumiremos que AudioEngine maneja la conexión interna del plugin

            setPlugins([...plugins, plugin]);
            setActivePlugin(plugin.id);
        }
    };

    return (
        <div className="h-48 bg-gray-900 border-t border-gray-700 p-4 flex gap-4">
            {/* Selector de Plugins */}
            <div className="w-48 border-r border-gray-700 pr-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Add Effect</h3>
                <button onClick={() => addPlugin('eq')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-sm text-cyan-400 flex items-center gap-2">
                    <Activity size={14} /> Spectral Shaper
                </button>
                <button onClick={() => addPlugin('compressor')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-sm text-red-400 flex items-center gap-2">
                    <Zap size={14} /> Pressure Chamber
                </button>
                <button onClick={() => addPlugin('reverb')} className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-sm text-purple-400 flex items-center gap-2">
                    <Waves size={14} /> Nebula Space
                </button>
            </div>

            {/* Lista de Plugins Activos */}
            <div className="flex-1 flex gap-2 overflow-x-auto">
                {plugins.map(plugin => (
                    <div
                        key={plugin.id}
                        className={`w-64 bg-gray-800 rounded-lg border ${activePlugin === plugin.id ? 'border-cyan-500' : 'border-gray-700'} p-3 flex flex-col`}
                        onClick={() => setActivePlugin(plugin.id)}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-white text-sm">{plugin.name}</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        </div>

                        {/* Controles Específicos */}
                        <div className="flex-1 space-y-3">
                            {plugin.type === 'eq' && (
                                <>
                                    <Knob label="Low" onChange={(v) => plugin.setParam('lowGain', v * 24 - 12)} />
                                    <Knob label="Mid" onChange={(v) => plugin.setParam('midGain', v * 24 - 12)} />
                                    <Knob label="High" onChange={(v) => plugin.setParam('highGain', v * 24 - 12)} />
                                </>
                            )}
                            {plugin.type === 'compressor' && (
                                <>
                                    <Knob label="Force" onChange={(v) => plugin.setParam('force', v * 100)} />
                                    <Knob label="Release" onChange={(v) => plugin.setParam('release', v)} />
                                </>
                            )}
                            {plugin.type === 'reverb' && (
                                <>
                                    <Knob label="Dim" onChange={(v) => plugin.setParam('dimension', v * 5)} />
                                    <Knob label="Echo" onChange={(v) => plugin.setParam('echo', v)} />
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Knob({ label, onChange }: { label: string, onChange: (val: number) => void }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{label}</span>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.5"
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
}

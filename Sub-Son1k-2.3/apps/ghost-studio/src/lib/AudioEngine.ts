import { useDAWStore } from '../store/dawStore';

class AudioEngine {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private trackNodes: Map<string, {
        input: GainNode; // Punto de entrada para sources
        output: GainNode; // Salida final del track (post-fader)
        gain: GainNode; // Fader de volumen
        panner: StereoPannerNode; // Paneo
        effects: AudioNode[]; // Cadena de efectos
        sourceNodes: AudioBufferSourceNode[];
    }> = new Map();

    private isInitialized = false;
    private lookahead = 25.0; // ms
    private scheduleAheadTime = 0.1; // s
    private nextNoteTime = 0.0;
    private timerID: number | null = null;

    constructor() {
        // Singleton instance logic could go here if needed
    }

    async init() {
        if (this.isInitialized) return;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.context = new AudioContextClass();

        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.8;

        this.isInitialized = true;
        console.log('🎹 AudioEngine Initialized');
    }

    getContext() {
        return this.context;
    }

    async resume() {
        if (this.context?.state === 'suspended') {
            await this.context.resume();
        }
    }

    // Gestión de Tracks
    createTrackNodes(trackId: string) {
        if (!this.context || !this.masterGain) return;

        const input = this.context.createGain();
        const gain = this.context.createGain();
        const panner = this.context.createStereoPanner();

        // Cadena por defecto: Input -> Gain -> Panner -> Master
        input.connect(gain);
        gain.connect(panner);
        panner.connect(this.masterGain);

        this.trackNodes.set(trackId, {
            input,
            output: panner, // La salida final es el panner por ahora
            gain,
            panner,
            effects: [],
            sourceNodes: []
        });
    }

    // Gestión de Efectos
    addEffect(trackId: string, effectNode: AudioNode) {
        const nodes = this.trackNodes.get(trackId);
        if (!nodes) return;

        // Desconectar cadena actual
        // Flujo: Input -> [Efectos] -> Gain -> Panner

        // 1. Desconectar Input del primer nodo actual (o del Gain si no hay efectos)
        nodes.input.disconnect();

        // 2. Si hay efectos existentes, desconectar el último del Gain
        if (nodes.effects.length > 0) {
            const lastEffect = nodes.effects[nodes.effects.length - 1];
            lastEffect.disconnect();
        }

        // 3. Añadir nuevo efecto al array
        nodes.effects.push(effectNode);

        // 4. Reconstruir cadena
        this.reconnectChain(nodes);
    }

    removeEffect(trackId: string, effectNode: AudioNode) {
        const nodes = this.trackNodes.get(trackId);
        if (!nodes) return;

        const index = nodes.effects.indexOf(effectNode);
        if (index === -1) return;

        // Desconectar todo para asegurar limpieza
        nodes.input.disconnect();
        nodes.effects.forEach(node => node.disconnect());

        // Remover efecto
        nodes.effects.splice(index, 1);

        // Reconstruir cadena
        this.reconnectChain(nodes);
    }

    private reconnectChain(nodes: any) {
        let currentNode = nodes.input;

        // Conectar efectos en serie
        nodes.effects.forEach((effect: AudioNode) => {
            currentNode.connect(effect);
            currentNode = effect;
        });

        // Conectar último nodo al Gain (Fader)
        currentNode.connect(nodes.gain);

        // Gain -> Panner -> Master (ya deberían estar conectados, pero aseguramos)
        // nodes.gain.connect(nodes.panner); // Ya conectado en createTrackNodes
    }

    updateTrackVolume(trackId: string, volume: number) {
        const nodes = this.trackNodes.get(trackId);
        if (nodes) {
            nodes.gain.gain.setTargetAtTime(volume, this.context!.currentTime, 0.01);
        }
    }

    updateTrackPan(trackId: string, pan: number) {
        const nodes = this.trackNodes.get(trackId);
        if (nodes) {
            nodes.panner.pan.setTargetAtTime(pan, this.context!.currentTime, 0.01);
        }
    }

    // Reproducción
    playClip(trackId: string, buffer: AudioBuffer, startTime: number, offset: number = 0, duration?: number) {
        if (!this.context) return;

        const nodes = this.trackNodes.get(trackId);
        if (!nodes) {
            this.createTrackNodes(trackId); // Auto-create if missing
            return this.playClip(trackId, buffer, startTime, offset, duration);
        }

        const source = this.context.createBufferSource();
        source.buffer = buffer;
        // Conectar al Input del track (antes de efectos y fader)
        source.connect(nodes!.input);

        // Calcular tiempos absolutos
        // startTime es relativo al inicio del timeline
        // offset es el punto de inicio dentro del audio

        // Si startTime es 0, empieza ya (o cuando se indique)
        // Pero necesitamos sincronizar con el currentTime del DAW

        // Esta función es de bajo nivel, el scheduler debe llamar a esto con el tiempo correcto
        source.start(startTime, offset, duration);

        nodes!.sourceNodes.push(source);

        source.onended = () => {
            const index = nodes!.sourceNodes.indexOf(source);
            if (index > -1) {
                nodes!.sourceNodes.splice(index, 1);
            }
        };

        return source;
    }

    stopAll() {
        this.trackNodes.forEach(nodes => {
            nodes.sourceNodes.forEach(source => {
                try {
                    source.stop();
                } catch (e) {
                    // Ignore errors if already stopped
                }
            });
            nodes.sourceNodes = [];
        });
    }

    // Scheduler (Simplificado para MVP)
    // En una implementación real, esto usaría un Web Worker para el timing
    // o requestAnimationFrame con lookahead

    startPlayback(startTime: number = 0) {
        this.resume();
        // Lógica de scheduling compleja omitida por brevedad
        // Aquí iteraríamos sobre los clips del store y programaríamos los sources

        const store = useDAWStore.getState();
        const tracks = store.tracks;

        tracks.forEach(track => {
            track.clips.forEach(clip => {
                if (clip.audioBuffer) {
                    // Calcular cuándo debe sonar este clip relativo al startTime solicitado
                    // Si el clip empieza en 5s y pedimos reproducir desde 0s -> start(ctx.currentTime + 5)
                    // Si pedimos reproducir desde 10s -> start(ctx.currentTime, offset + (10-5))

                    const clipStart = clip.startTime;
                    const clipEnd = clip.startTime + clip.duration;

                    if (clipEnd > startTime) {
                        // El clip debe sonar
                        let playAt = 0;
                        let offset = clip.offset;
                        let duration = clip.duration;

                        if (clipStart >= startTime) {
                            // Empieza en el futuro
                            playAt = this.context!.currentTime + (clipStart - startTime);
                        } else {
                            // Ya empezó, reproducir desde la mitad
                            const timePassed = startTime - clipStart;
                            offset += timePassed;
                            duration -= timePassed;
                            playAt = this.context!.currentTime;
                        }

                        this.playClip(track.id, clip.audioBuffer, playAt, offset, duration);
                    }
                }
            });
        });
    }
}

export const audioEngine = new AudioEngine();

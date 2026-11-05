// Audio processing utilities for Gemini Live API
// Input: 16kHz PCM 16-bit mono little-endian
// Output: 24kHz PCM 16-bit mono little-endian

export function float32To16BitPCMBase64(input: Float32Array): string {
  const pcm16 = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    // Clamp sample between -1 and 1
    const s = Math.max(-1, Math.min(1, input[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Convert Int16Array buffer to base64 safely
  const bytes = new Uint8Array(pcm16.buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isMuted = false;

  constructor() {
    // Initialized on first user interaction
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public playChunk(base64Pcm: string) {
    this.initContext();
    if (!this.audioCtx || this.isMuted) return;

    try {
      const binaryString = atob(base64Pcm);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const buffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.audioCtx.destination);
      }

      const now = this.audioCtx.currentTime;
      if (this.nextStartTime < now) {
        this.nextStartTime = now;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += buffer.duration;
      this.activeSources.push(source);

      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index !== -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('Failed to decode and play audio chunk:', err);
    }
  }

  public stopPlayback() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // ignore already stopped
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    } else {
      this.nextStartTime = 0;
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopPlayback();
    }
  }

  public close() {
    this.stopPlayback();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private onAudioChunk: ((base64Pcm: string) => void) | null = null;
  public isRecording = false;
  public isMuted = false;

  constructor(onChunk: (base64Pcm: string) => void) {
    this.onAudioChunk = onChunk;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public async start(): Promise<void> {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;

    // Buffer size 4096 gives ~256ms chunk at 16kHz
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.isRecording || this.isMuted) return;
      const channelData = e.inputBuffer.getChannelData(0);
      const base64 = float32To16BitPCMBase64(channelData);
      if (this.onAudioChunk) {
        this.onAudioChunk(base64);
      }
    };

    this.source.connect(this.analyser);
    this.source.connect(this.processor);
    // Needed to keep processor alive in Chrome
    this.processor.connect(this.audioCtx.destination);

    this.isRecording = true;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public stop() {
    this.isRecording = false;
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

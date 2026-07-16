import type { ActiveStem, ProjectConfig, StemMix, StemName } from "./types.ts";
import { STEM_NAMES } from "./types.ts";

const FADE_SECONDS = 0.7;

export class MusicPreview {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private unlocked = false;
  private buffers = new Map<StemName, AudioBuffer>();
  private stems = new Map<StemName, ActiveStem>();
  private levelCompleteBuffer: AudioBuffer | null = null;
  private usingGeneratedFallback = false;
  private projectBase = "";
  private stemFiles: Partial<Record<Exclude<StemName, "accent">, string>> = {};
  private levelCompleteFile = "";
  private levelMixes: StemMix[] = [];
  private mode: "idle" | "solo" | "mix" = "idle";

  get fallbackActive(): boolean {
    return this.usingGeneratedFallback;
  }

  get activeMode(): string {
    return this.mode;
  }

  async unlock(): Promise<boolean> {
    if (this.unlocked) return true;
    try {
      this.ctx = this.ctx ?? new AudioContext();
      await this.ctx.resume();
      this.masterGain = this.masterGain ?? this.ctx.createGain();
      this.masterGain.gain.value = 0.9;
      this.masterGain.connect(this.ctx.destination);
      this.unlocked = true;
      return true;
    } catch (error) {
      console.warn("Audio unlock failed:", error);
      return false;
    }
  }

  async loadProject(config: ProjectConfig, basePath: string): Promise<void> {
    this.stopAll();
    this.projectBase = basePath.replace(/\/$/, "");
    this.stemFiles = config.stems;
    this.levelCompleteFile = `${this.projectBase}/${config.sfx.levelComplete}`;
    this.levelMixes = config.levelMixes;
    this.levelCompleteBuffer = null;
    this.buffers.clear();
    this.usingGeneratedFallback = false;

    if (!(await this.unlock())) return;
    await this.loadAllBuffers();
  }

  private async loadAllBuffers(): Promise<void> {
    if (!this.ctx) return;

    const entries = Object.entries(this.stemFiles) as Array<
      [Exclude<StemName, "accent">, string]
    >;

    for (const [name, relativePath] of entries) {
      const path = `${this.projectBase}/${relativePath}`;
      try {
        const response = await fetch(path);
        if (!response.ok) {
          console.warn(`Music stem missing: ${path}; using generated fallback soundtrack.`);
          this.generateFallbackBuffers();
          this.usingGeneratedFallback = true;
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(name, audioBuffer);
      } catch (error) {
        console.warn(`Failed to load stem ${name}; using generated fallback soundtrack.`, error);
        this.generateFallbackBuffers();
        this.usingGeneratedFallback = true;
        return;
      }
    }

    this.buffers.set("accent", this.buildAccentBuffer());
  }

  private generateFallbackBuffers(): void {
    if (!this.ctx) return;
    this.buffers.clear();
    this.buffers.set("base", this.buildBaseBuffer());
    this.buffers.set("pressure", this.buildPressureBuffer());
    this.buffers.set("chase", this.buildChaseBuffer());
    this.buffers.set("dread", this.buildDreadBuffer());
    this.buffers.set("accent", this.buildAccentBuffer());
  }

  private buildBaseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const duration = 8;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    const bpm = 172;
    const beatSeconds = 60 / bpm;
    const pulseLength = 0.12;
    const noteA = 55;
    const noteB = 65.41;

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / sampleRate;
      const beatPos = (t / beatSeconds) % 1;
      const barPos = (t / (beatSeconds * 8)) % 1;
      const note = barPos < 0.5 ? noteA : noteB;
      const env = beatPos < pulseLength / beatSeconds ? Math.exp(-20 * beatPos) : 0.0;
      const low = Math.sin(2 * Math.PI * note * t);
      const sub = Math.sin(2 * Math.PI * (note * 0.5) * t);
      data[i] = (low * 0.2 + sub * 0.1) * env;
    }
    return buffer;
  }

  private buildPressureBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const duration = 8;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    const bpm = 172;
    const stepSeconds = (60 / bpm) / 2;
    const hitLen = 0.035;

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / sampleRate;
      const stepPos = (t / stepSeconds) % 1;
      const env = stepPos < hitLen / stepSeconds ? Math.exp(-45 * stepPos) : 0.0;
      const noise = (Math.random() * 2 - 1) * 0.12;
      data[i] = noise * env;
    }
    return buffer;
  }

  private buildChaseBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const duration = 8;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    const bpm = 172;
    const stepSeconds = (60 / bpm) / 4;
    const notes = [110, 146.83, 164.81, 196];

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / sampleRate;
      const step = Math.floor(t / stepSeconds);
      const stepPos = (t / stepSeconds) % 1;
      const note = notes[step % notes.length];
      const env = Math.exp(-18 * stepPos);
      const phase = 2 * Math.PI * note * t;
      const saw = ((phase / Math.PI) % 2) - 1;
      data[i] = saw * 0.12 * env;
    }
    return buffer;
  }

  private buildDreadBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const duration = 8;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    const droneA = 46.25;
    const droneB = 49.0;
    const lfoFreq = 0.11;

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / sampleRate;
      const lfo = (Math.sin(2 * Math.PI * lfoFreq * t) + 1) * 0.5;
      const tone = Math.sin(2 * Math.PI * droneA * t) * 0.12;
      const overtone = Math.sin(2 * Math.PI * droneB * t) * 0.06;
      const hiss = (Math.random() * 2 - 1) * 0.02;
      data[i] = (tone + overtone + hiss) * (0.6 + lfo * 0.4);
    }
    return buffer;
  }

  private buildAccentBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const duration = 8;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    const bpm = 172;
    const beatSeconds = 60 / bpm;
    const notes = [82.41, 98.0, 110.0, 123.47];

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / sampleRate;
      const beat = Math.floor(t / beatSeconds);
      const beatPos = (t / beatSeconds) % 1;
      const note = notes[beat % notes.length];
      const env = beatPos < 0.08 ? Math.exp(-28 * beatPos) : 0.0;
      const tri = Math.asin(Math.sin(2 * Math.PI * note * t)) * (2 / Math.PI);
      data[i] = tri * 0.16 * env;
    }
    return buffer;
  }

  private ensureStemRunning(name: StemName): ActiveStem | null {
    if (!this.ctx || !this.masterGain) return null;

    const existing = this.stems.get(name);
    if (existing) return existing;

    const buffer = this.buffers.get(name);
    if (!buffer) return null;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();

    const stem: ActiveStem = { source, gainNode };
    this.stems.set(name, stem);
    return stem;
  }

  private rampGain(gainNode: GainNode, target: number): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(target, now + FADE_SECONDS);
  }

  private setMasterForLevel(level: number): void {
    if (!this.masterGain || !this.ctx) return;
    const masterTarget = level >= 7 ? 0.82 : level >= 5 ? 0.86 : 0.9;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(masterTarget, now + FADE_SECONDS);
  }

  async playStem(name: StemName, volume: number): Promise<void> {
    if (!(await this.unlock()) || this.buffers.size === 0) return;

    this.mode = "solo";

    for (const stemName of STEM_NAMES) {
      const stem = this.stems.get(stemName);
      if (!stem) continue;
      const target = stemName === name ? volume : 0;
      this.rampGain(stem.gainNode, target);
    }

    if (!this.stems.has(name)) {
      const stem = this.ensureStemRunning(name);
      if (stem) this.rampGain(stem.gainNode, volume);
    }

    if (this.masterGain) {
      const now = this.ctx!.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.9, now + FADE_SECONDS);
    }
  }

  stopStem(name: StemName): void {
    const stem = this.stems.get(name);
    if (!stem) return;
    this.rampGain(stem.gainNode, 0);
    if (this.mode === "solo") this.mode = "idle";
  }

  setStemVolume(name: StemName, volume: number): void {
    const stem = this.stems.get(name);
    if (!stem || this.mode !== "solo") return;
    this.rampGain(stem.gainNode, volume);
  }

  async playMix(level: number): Promise<void> {
    if (!(await this.unlock()) || this.buffers.size === 0) return;

    this.mode = "mix";
    const mix = this.levelToMix(level);

    for (const stemName of STEM_NAMES) {
      const target = mix[stemName];
      let stem = this.stems.get(stemName);
      if (!stem && target > 0) {
        stem = this.ensureStemRunning(stemName) ?? undefined;
      }
      if (stem) this.rampGain(stem.gainNode, target);
    }

    this.setMasterForLevel(level);
  }

  stopMix(): void {
    if (this.mode !== "mix") return;
    for (const stemName of STEM_NAMES) {
      const stem = this.stems.get(stemName);
      if (stem) this.rampGain(stem.gainNode, 0);
    }
    this.mode = "idle";
  }

  stopAll(): void {
    for (const stemName of STEM_NAMES) {
      const stem = this.stems.get(stemName);
      if (stem) {
        try {
          stem.source.stop();
        } catch {
          /* already stopped */
        }
        stem.source.disconnect();
        stem.gainNode.disconnect();
      }
    }
    this.stems.clear();
    this.mode = "idle";
  }

  private levelToMix(level: number): StemMix {
    const idx = Math.max(0, Math.min(level - 1, this.levelMixes.length - 1));
    return this.levelMixes[idx];
  }

  private async ensureLevelCompleteBuffer(): Promise<AudioBuffer | null> {
    if (this.levelCompleteBuffer) return this.levelCompleteBuffer;
    if (!(await this.unlock()) || !this.ctx) return null;

    try {
      const response = await fetch(this.levelCompleteFile);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        this.levelCompleteBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        return this.levelCompleteBuffer;
      }
    } catch (error) {
      console.warn("Level complete SFX missing; using generated stinger.", error);
    }

    this.levelCompleteBuffer = this.buildLevelCompleteBuffer();
    return this.levelCompleteBuffer;
  }

  async playLevelComplete(level: number): Promise<void> {
    if (this.ctx?.state === "suspended") return;
    if (!(await this.unlock()) || !this.ctx || !this.masterGain) return;

    const buffer = await this.ensureLevelCompleteBuffer();
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 1 + (Math.min(level, 8) - 1) * 0.025;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = level >= 8 ? 0.95 : 0.82;

    source.connect(gainNode);
    gainNode.connect(this.masterGain);
    source.start();
  }

  private buildLevelCompleteBuffer(): AudioBuffer {
    const ctx = this.ctx!;
    const duration = 0.85;
    const sampleRate = ctx.sampleRate;
    const frameCount = Math.floor(duration * sampleRate);
    const buffer = ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);
    const notes = [523.25, 659.25, 783.99, 1046.5];

    for (let i = 0; i < frameCount; i += 1) {
      const t = i / sampleRate;
      let sample = 0;

      for (let n = 0; n < notes.length; n += 1) {
        const start = n * 0.11;
        const localT = t - start;
        if (localT < 0 || localT > 0.28) continue;
        const env = Math.exp(-10 * localT);
        const freq = notes[n];
        const tone = Math.sin(2 * Math.PI * freq * localT);
        const overtone = Math.sin(2 * Math.PI * freq * 2 * localT) * 0.18;
        sample += (tone + overtone) * env * 0.22;
      }

      if (t < 0.04) {
        sample += (Math.random() * 2 - 1) * 0.08 * Math.exp(-120 * t);
      }

      data[i] = sample;
    }

    return buffer;
  }
}

export const STEM_NAMES = ["base", "pressure", "chase", "dread", "accent"] as const;
export type StemName = (typeof STEM_NAMES)[number];

export type StemMix = Record<StemName, number>;

export interface ProjectConfig {
  id: string;
  name: string;
  stems: Partial<Record<Exclude<StemName, "accent">, string>>;
  sfx: {
    levelComplete: string;
  };
  levelMixes: StemMix[];
}

export interface ActiveStem {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

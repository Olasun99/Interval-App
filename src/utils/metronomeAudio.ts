let metronomeCtx: AudioContext | null = null;

export const getMetronomeAudioContext = () => {
  if (!metronomeCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      metronomeCtx = new AudioContextClass();
    }
  }
  return metronomeCtx;
};

export type MetronomeSound = 'digital' | 'woodblock' | 'cowbell' | 'clave' | 'soft';

export const playBeat = (ctx: AudioContext, time: number, isAccent: boolean, sound: MetronomeSound, volume: number = 1.0) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  gain.gain.value = volume;
  
  const env = ctx.createGain();
  
  if (sound === 'woodblock') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 800 : 600, time);
    env.gain.setValueAtTime(1, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  } else if (sound === 'cowbell') {
    osc.type = 'square';
    // Square wave with specific frequencies gives a cowbell-ish metallic sound
    osc.frequency.setValueAtTime(isAccent ? 840 : 700, time);
    env.gain.setValueAtTime(1, time);
    env.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  } else if (sound === 'clave') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 2500 : 2000, time);
    env.gain.setValueAtTime(1, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  } else if (sound === 'soft') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isAccent ? 600 : 400, time);
    env.gain.setValueAtTime(0.8, time);
    env.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
  } else {
    // digital
    osc.type = 'square';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, time);
    env.gain.setValueAtTime(0.8, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  }
  
  osc.connect(env);
  env.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.2);
};

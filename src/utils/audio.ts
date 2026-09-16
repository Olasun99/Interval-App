export type SoundPreset = 'sharp_ring' | 'loud_bang' | 'classic_alarm' | 'digital_beep' | 'bell';

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (sharedAudioCtx) return sharedAudioCtx;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  sharedAudioCtx = new AudioContextClass();
  return sharedAudioCtx;
};

export const playAlarm = (preset: SoundPreset = 'sharp_ring', volume: number = 1.0, extraLoud: boolean = false) => {
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // Use a compressor to maximize loudness and prevent clipping
  const compressor = audioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-10, now);
  compressor.knee.setValueAtTime(10, now);
  compressor.ratio.setValueAtTime(12, now);
  compressor.attack.setValueAtTime(0, now);
  compressor.release.setValueAtTime(0.25, now);
  
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = extraLoud ? volume * 4.0 : volume;
  
  compressor.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  // If Extra Loud, trigger multiple rapid layered events
  const layers = extraLoud ? 3 : 1;
  const timeOffsets = extraLoud ? [0, 0.05, 0.1] : [0];

  timeOffsets.forEach(offset => {
    const playTime = now + offset;
    if (preset === 'sharp_ring') {
    // Very loud, piercing ring - Multiple dissonant oscillators
    const freqs = [2500, 2550, 2600];
    freqs.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(1, playTime);
      gain.gain.exponentialRampToValueAtTime(0.01, playTime + 1.5);
      
      osc.connect(gain);
      gain.connect(compressor);
      
      osc.start(playTime);
      osc.stop(playTime + 1.5);
    });
  } else if (preset === 'loud_bang') {
    // Synthetic loud bang/crash - white noise + low punch
    const bufferSize = audioCtx.sampleRate * 1.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, playTime);
    filter.frequency.exponentialRampToValueAtTime(100, playTime + 0.8);

    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(3.0, playTime); // Drive it hard into compressor
    noiseGain.gain.exponentialRampToValueAtTime(0.01, playTime + 1.5);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(compressor);
    
    // Add low frequency punch
    const punch = audioCtx.createOscillator();
    punch.type = 'sine';
    punch.frequency.setValueAtTime(150, playTime);
    punch.frequency.exponentialRampToValueAtTime(10, playTime + 0.5);
    
    const punchGain = audioCtx.createGain();
    punchGain.gain.setValueAtTime(2.0, playTime);
    punchGain.gain.exponentialRampToValueAtTime(0.01, playTime + 0.5);
    
    punch.connect(punchGain);
    punchGain.connect(compressor);

    noise.start(playTime);
    noise.stop(playTime + 1.5);
    punch.start(playTime);
    punch.stop(playTime + 0.5);
  } else if (preset === 'bell') {
    // FM synthesis style bell
    const numOscs = 4;
    const baseFreq = 800;
    const ratios = [1, 2.76, 5.4, 8.9];
    
    ratios.forEach((ratio, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = baseFreq * ratio;
      
      // Higher partials decay faster
      const decay = 2.0 / (i + 1);
      gain.gain.setValueAtTime(1.0 / (i + 1), playTime);
      gain.gain.exponentialRampToValueAtTime(0.001, playTime + decay);
      
      osc.connect(gain);
      gain.connect(compressor);
      
      osc.start(playTime);
      osc.stop(playTime + decay);
    });
  } else if (preset === 'digital_beep') {
    const beep = (time: number, freq: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(1.5, time);
      gain.gain.setTargetAtTime(0, time + duration - 0.05, 0.015);
      
      osc.connect(gain);
      gain.connect(compressor);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    beep(playTime, 1200, 0.2);
    beep(playTime + 0.3, 1200, 0.2);
  } else {
    // classic_alarm
    const beep = (time: number, freq: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'square';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(1.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      
      osc.connect(gain);
      gain.connect(compressor);
      
      osc.start(time);
      osc.stop(time + duration);
    };

    beep(playTime, 1000, 0.15);
    beep(playTime + 0.25, 1000, 0.15);
    beep(playTime + 0.5, 1000, 0.15);
    
    beep(playTime + 1.25, 1000, 0.15);
    beep(playTime + 1.5, 1000, 0.15);
    beep(playTime + 1.75, 1000, 0.15);
  }
  }); // End timeOffsets loop
  
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200, 100, 500]);
  }
};

export const speakMessage = (message: string, volume: number = 1.0) => {
  if (!('speechSynthesis' in window)) return;
  
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.volume = volume;
  utterance.rate = 1.0;
  
  window.speechSynthesis.cancel(); // Stop anything currently playing
  window.speechSynthesis.speak(utterance);
};

let ambientSource: AudioBufferSourceNode | null = null;
let ambientGain: GainNode | null = null;

export type AmbientSound = 'none' | 'white_noise' | 'brown_noise' | 'rain';

export const playAmbient = (preset: AmbientSound, volume: number = 0.5) => {
  stopAmbient();
  if (preset === 'none') return;
  
  const audioCtx = getAudioContext();
  if (!audioCtx) return;
  
  const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  
  if (preset === 'white_noise') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (preset === 'brown_noise' || preset === 'rain') {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; 
    }
  }
  
  ambientSource = audioCtx.createBufferSource();
  ambientSource.buffer = buffer;
  ambientSource.loop = true;
  
  const filter = audioCtx.createBiquadFilter();
  if (preset === 'rain') {
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
  } else if (preset === 'brown_noise') {
    filter.type = 'lowpass';
    filter.frequency.value = 400;
  } else {
    filter.type = 'allpass';
  }
  
  ambientGain = audioCtx.createGain();
  ambientGain.gain.value = volume * 0.15; 
  
  ambientSource.connect(filter);
  filter.connect(ambientGain);
  ambientGain.connect(audioCtx.destination);
  
  ambientSource.start();
};

export const stopAmbient = () => {
  if (ambientSource) {
    try {
      ambientSource.stop();
      ambientSource.disconnect();
    } catch (e) {}
    ambientSource = null;
  }
  if (ambientGain) {
    try {
      ambientGain.disconnect();
    } catch (e) {}
    ambientGain = null;
  }
};

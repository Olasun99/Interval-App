import { useState, useEffect, useRef, useCallback } from 'react';
import { getMetronomeAudioContext, playBeat, MetronomeSound } from '../utils/metronomeAudio';

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
  const [sound, setSound] = useState<MetronomeSound>('digital');
  const [accentFirstBeat, setAccentFirstBeat] = useState(true);
  const [volume, setVolume] = useState(1.0);
  
  // React state for visual syncing (can be slightly delayed vs audio)
  const [currentVisualBeat, setCurrentVisualBeat] = useState(-1);

  const nextNoteTimeRef = useRef(0);
  const currentBeatInMeasureRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  
  const lookahead = 25.0; // ms
  const scheduleAheadTime = 0.1; // s

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / bpm;
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatInMeasureRef.current = (currentBeatInMeasureRef.current + 1) % beatsPerMeasure;
  }, [bpm, beatsPerMeasure]);

  const scheduleNote = useCallback((beatNumber: number, time: number) => {
    // Schedule visual update. We use a simple timeout based on the audioCtx time vs performance.now or just setTimeout.
    // A robust way is to calculate the time difference.
    const ctx = getMetronomeAudioContext();
    if (ctx) {
      const timeUntilNote = (time - ctx.currentTime) * 1000;
      setTimeout(() => {
        setCurrentVisualBeat(beatNumber);
      }, Math.max(0, timeUntilNote));
    }

    const audioContext = getMetronomeAudioContext();
    if (!audioContext) return;
    
    const isAccent = accentFirstBeat && beatNumber === 0;
    playBeat(audioContext, time, isAccent, sound, volume);
  }, [accentFirstBeat, sound, volume]);

  const scheduler = useCallback(() => {
    const ctx = getMetronomeAudioContext();
    if (!ctx) return;

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(currentBeatInMeasureRef.current, nextNoteTimeRef.current);
      nextNote();
    }
  }, [nextNote, scheduleNote]);

  useEffect(() => {
    if (isPlaying) {
      const ctx = getMetronomeAudioContext();
      if (ctx) {
         if (ctx.state === 'suspended') {
            ctx.resume();
         }
         nextNoteTimeRef.current = ctx.currentTime + 0.05;
         currentBeatInMeasureRef.current = 0;
         timerIDRef.current = window.setInterval(scheduler, lookahead);
      }
    } else {
      if (timerIDRef.current !== null) {
        window.clearInterval(timerIDRef.current);
        timerIDRef.current = null;
      }
      setCurrentVisualBeat(-1);
    }

    return () => {
      if (timerIDRef.current !== null) {
        window.clearInterval(timerIDRef.current);
      }
    };
  }, [isPlaying, scheduler]);

  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const handleTapTempo = () => {
    const now = performance.now();
    setTapTimes(prev => {
       const newTimes = [...prev, now];
       // Reset if last tap was more than 2 seconds ago
       if (newTimes.length > 1 && (now - newTimes[newTimes.length - 2]) > 2000) {
         return [now];
       }
       if (newTimes.length > 5) newTimes.shift(); // keep last 5 taps for average
       return newTimes;
    });
  };

  useEffect(() => {
    if (tapTimes.length >= 2) {
       const intervals = [];
       for(let i=1; i<tapTimes.length; i++) {
          intervals.push(tapTimes[i] - tapTimes[i-1]);
       }
       const avgInterval = intervals.reduce((a,b)=>a+b, 0) / intervals.length;
       const newBpm = Math.round(60000 / avgInterval);
       if (newBpm >= 20 && newBpm <= 400) {
          setBpm(newBpm);
       }
    }
  }, [tapTimes]);

  return {
    isPlaying,
    setIsPlaying,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    sound,
    setSound,
    accentFirstBeat,
    setAccentFirstBeat,
    volume,
    setVolume,
    currentVisualBeat,
    handleTapTempo
  };
}

import { useState, useEffect, useRef } from 'react';
import { playAlarm, speakMessage, SoundPreset } from '../utils/audio';
import { TimerMode, PomodoroPhase } from './useIntervalTimer'; // keep these types

export function useDriftlessTimer(
  mode: TimerMode,
  selectedIntervalMinutes: number,
  pomoWork: number,
  pomoBreak: number,
  soundPreset: SoundPreset,
  voiceMessage: string = '',
  voiceEnabled: boolean = false,
  extraLoud: boolean = false
) {
  const [isActive, setIsActive] = useState(() => {
    const st = localStorage.getItem('timer_startTime');
    const pst = localStorage.getItem('timer_pauseStartTime');
    return (st !== null && pst === null);
  });
  
  // Base time tracking
  const [startTime, setStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('timer_startTime');
    return saved ? parseInt(saved) : null;
  });
  const [accumulatedPauseTime, setAccumulatedPauseTime] = useState(() => {
    const saved = localStorage.getItem('timer_accumulatedPauseTime');
    return saved ? parseInt(saved) : 0;
  });
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('timer_pauseStartTime');
    return saved ? parseInt(saved) : null;
  });
  
  // Adjustments
  const [extraTimeAdded, setExtraTimeAdded] = useState(() => {
    const saved = localStorage.getItem('timer_extraTimeAdded');
    return saved ? parseInt(saved) : 0;
  });
  const [intervalsSkipped, setIntervalsSkipped] = useState(() => {
    const saved = localStorage.getItem('timer_intervalsSkipped');
    return saved ? parseInt(saved) : 0;
  });

  // Status
  const [intervalsCompleted, setIntervalsCompleted] = useState(() => {
    const saved = localStorage.getItem('timer_intervalsCompleted');
    return saved ? parseInt(saved) : 0;
  });
  const [phase, setPhase] = useState<PomodoroPhase>(() => {
    const saved = localStorage.getItem('timer_phase');
    return (saved as PomodoroPhase) || 'work';
  });

  // Save to localStorage on change
  useEffect(() => {
    if (startTime !== null) localStorage.setItem('timer_startTime', startTime.toString());
    else localStorage.removeItem('timer_startTime');
  }, [startTime]);

  useEffect(() => { localStorage.setItem('timer_accumulatedPauseTime', accumulatedPauseTime.toString()); }, [accumulatedPauseTime]);
  
  useEffect(() => {
    if (pauseStartTime !== null) localStorage.setItem('timer_pauseStartTime', pauseStartTime.toString());
    else localStorage.removeItem('timer_pauseStartTime');
  }, [pauseStartTime]);

  useEffect(() => { localStorage.setItem('timer_extraTimeAdded', extraTimeAdded.toString()); }, [extraTimeAdded]);
  useEffect(() => { localStorage.setItem('timer_intervalsSkipped', intervalsSkipped.toString()); }, [intervalsSkipped]);
  useEffect(() => { localStorage.setItem('timer_intervalsCompleted', intervalsCompleted.toString()); }, [intervalsCompleted]);
  useEffect(() => { localStorage.setItem('timer_phase', phase); }, [phase]);

  const [timeLeft, setTimeLeft] = useState(0); // for display
  const [totalElapsed, setTotalElapsed] = useState(0);

  const getTargetSeconds = (m: TimerMode, p: PomodoroPhase) => {
    if (m === 'interval') return selectedIntervalMinutes * 60;
    return p === 'work' ? pomoWork * 60 : pomoBreak * 60;
  };

  const getTargetMs = () => getTargetSeconds(mode, phase) * 1000;

  // Initialize time left when not active
  useEffect(() => {
    if (!isActive && !startTime) {
      setTimeLeft(getTargetSeconds(mode, phase));
    }
  }, [mode, selectedIntervalMinutes, pomoWork, pomoBreak, phase, isActive, startTime]);

  const toggleTimer = () => {
    const now = Date.now();
    if (isActive) {
      // Pausing
      setIsActive(false);
      setPauseStartTime(now);
    } else {
      // Resuming or Starting
      setIsActive(true);
      if (startTime === null) {
        setStartTime(now);
      } else if (pauseStartTime !== null) {
        setAccumulatedPauseTime(prev => prev + (now - pauseStartTime));
        setPauseStartTime(null);
      }
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setStartTime(null);
    setAccumulatedPauseTime(0);
    setPauseStartTime(null);
    setExtraTimeAdded(0);
    setIntervalsSkipped(0);
    setIntervalsCompleted(0);
    setPhase('work');
    setTimeLeft(getTargetSeconds(mode, 'work'));
    setTotalElapsed(0);
  };

  const addTime = (minutes: number) => {
    setExtraTimeAdded(prev => prev + (minutes * 60 * 1000));
  };

  const skipAlert = () => {
    if (!startTime) return;
    setIntervalsSkipped(prev => prev + 1);
    
    if (mode === 'pomodoro') {
      setPhase(prev => prev === 'work' ? 'break' : 'work');
    }
    
    // Reset the "start time" of this specific interval by adjusting extra time
    // We basically want to pretend the interval just started.
    // Instead of complex math, let's just reset the entire timer's start time 
    // to "now", and keep the history of intervals completed.
    const now = Date.now();
    setStartTime(now);
    setAccumulatedPauseTime(0);
    setExtraTimeAdded(0);
  };

  useEffect(() => {
    if (!isActive || !startTime) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const effectiveStartTime = startTime + accumulatedPauseTime;
      // How much time has passed in the CURRENT interval (accounting for extra time added)
      // Actually, since we might change intervals, it's easier to think of "elapsed since interval started"
      const elapsedSinceStart = now - effectiveStartTime;
      setTotalElapsed(Math.floor(elapsedSinceStart / 1000));
      
      const currentTargetMs = getTargetMs();
      
      // Calculate how much time is left in the current cycle
      // If we added time, we have more time left.
      const currentCycleElapsed = elapsedSinceStart - (intervalsCompleted * currentTargetMs) - extraTimeAdded;
      const remainingMs = currentTargetMs - currentCycleElapsed;

      if (remainingMs <= 0) {
        // Interval completed!
        playAlarm(soundPreset, 1.0, extraLoud);
        if (voiceEnabled && voiceMessage) {
          setTimeout(() => speakMessage(voiceMessage), 1500); // Wait for alarm
        }
        
        setIntervalsCompleted(prev => prev + 1);
        setExtraTimeAdded(0); // Reset extra time for next cycle
        
        if (mode === 'pomodoro') {
          setPhase(prev => {
             const next = prev === 'work' ? 'break' : 'work';
             // Adjust startTime so the next interval starts exactly now (or exactly at the boundary)
             // For driftless, we just rely on intervalsCompleted * newTargetMs, but that gets tricky if durations change.
             // Simpler driftless for changing durations: reset startTime to now.
             setStartTime(Date.now());
             setAccumulatedPauseTime(0);
             setIntervalsCompleted(0); // reset local count for new phase
             return next;
          });
        } else {
           // For simple interval, just let intervalsCompleted increment to keep it driftless
           setTimeLeft(getTargetSeconds(mode, phase));
        }
      } else {
        setTimeLeft(Math.max(0, Math.ceil(remainingMs / 1000)));
      }

    }, 100); // 100ms tick for smooth UI and accuracy

    return () => clearInterval(intervalId);
  }, [isActive, startTime, accumulatedPauseTime, extraTimeAdded, intervalsCompleted, mode, phase, soundPreset, voiceEnabled, voiceMessage, extraLoud]);

  return {
    isActive,
    timeLeft,
    totalElapsed,
    intervalsCompleted: intervalsCompleted + intervalsSkipped,
    phase,
    totalDuration: getTargetSeconds(mode, phase),
    toggleTimer,
    resetTimer,
    addTime,
    skipAlert
  };
}

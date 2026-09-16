import { useState, useEffect } from 'react';
import { playAlarm, SoundPreset } from '../utils/audio';

export type TimerMode = 'interval' | 'pomodoro';
export type PomodoroPhase = 'work' | 'break';

export function useAppTimer(
  mode: TimerMode,
  selectedIntervalMinutes: number,
  pomoWork: number,
  pomoBreak: number,
  soundPreset: SoundPreset
) {
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [cycleCount, setCycleCount] = useState(0);

  const getTargetSeconds = (m: TimerMode, p: PomodoroPhase) => {
    if (m === 'interval') return selectedIntervalMinutes * 60;
    return p === 'work' ? pomoWork * 60 : pomoBreak * 60;
  };

  const [timeLeft, setTimeLeft] = useState(getTargetSeconds(mode, phase));

  const toggleTimer = () => {
    if (isActive) {
      setIsActive(false);
      setEndTime(null);
    } else {
      setIsActive(true);
      setEndTime(Date.now() + timeLeft * 1000);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setEndTime(null);
    setPhase('work');
    setTimeLeft(getTargetSeconds(mode, 'work'));
    setCycleCount(0);
  };

  // Keep timeLeft in sync when settings change and timer is paused
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(getTargetSeconds(mode, phase));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedIntervalMinutes, pomoWork, pomoBreak]);

  useEffect(() => {
    if (!isActive || !endTime) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setTimeLeft((prev) => {
        if (prev !== remaining) return remaining;
        return prev;
      });

      if (remaining <= 0) {
        playAlarm(soundPreset);
        
        if (mode === 'interval') {
          setCycleCount(c => c + 1);
          setEndTime(Date.now() + selectedIntervalMinutes * 60 * 1000);
        } else {
          setPhase(prevPhase => {
            const nextPhase = prevPhase === 'work' ? 'break' : 'work';
            if (nextPhase === 'work') setCycleCount(c => c + 1);
            
            const nextDuration = nextPhase === 'work' ? pomoWork : pomoBreak;
            setEndTime(Date.now() + nextDuration * 60 * 1000);
            return nextPhase;
          });
        }
      }
    }, 200);

    return () => clearInterval(intervalId);
  }, [isActive, endTime, mode, selectedIntervalMinutes, pomoWork, pomoBreak, soundPreset]);

  return {
    isActive,
    timeLeft,
    cycleCount,
    phase,
    totalDuration: getTargetSeconds(mode, phase),
    toggleTimer,
    resetTimer
  };
}

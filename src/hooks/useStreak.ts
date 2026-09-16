import { useState, useEffect } from 'react';

export function useStreak() {
  const [streakDays, setStreakDays] = useState(() => {
    return parseInt(localStorage.getItem('streakDays') || '0');
  });
  const [lastSessionDate, setLastSessionDate] = useState(() => {
    return localStorage.getItem('lastSessionDate') || null;
  });
  
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(() => {
    const saved = localStorage.getItem('todayFocusMinutes');
    return saved ? parseInt(saved) : 0;
  });
  
  const [todaySessionsCount, setTodaySessionsCount] = useState(() => {
    const saved = localStorage.getItem('todaySessionsCount');
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem('streakDays', streakDays.toString());
    if (lastSessionDate) {
      localStorage.setItem('lastSessionDate', lastSessionDate);
    }
    localStorage.setItem('todayFocusMinutes', todayFocusMinutes.toString());
    localStorage.setItem('todaySessionsCount', todaySessionsCount.toString());
  }, [streakDays, lastSessionDate, todayFocusMinutes, todaySessionsCount]);

  const checkAndRecordSession = (minutes: number) => {
    const today = new Date().toDateString(); // e.g. "Thu Jul 23 2026"
    
    if (lastSessionDate === today) {
      // Already recorded a session today
      setTodayFocusMinutes(prev => prev + minutes);
      setTodaySessionsCount(prev => prev + 1);
      return;
    }
    
    if (lastSessionDate) {
      const last = new Date(lastSessionDate);
      const current = new Date(today);
      
      // Calculate difference in days
      const diffTime = Math.abs(current.getTime() - last.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        // Consecutive day
        setStreakDays(prev => prev + 1);
      } else if (diffDays > 1) {
        // Streak broken
        setStreakDays(1);
      }
    } else {
      // First session ever
      setStreakDays(1);
    }
    
    setLastSessionDate(today);
    setTodayFocusMinutes(minutes);
    setTodaySessionsCount(1);
  };

  return { streakDays, todayFocusMinutes, todaySessionsCount, checkAndRecordSession };
}

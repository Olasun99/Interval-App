import React from 'react';

interface PomodoroSelectorProps {
  workMinutes: number;
  breakMinutes: number;
  setWorkMinutes: (val: number) => void;
  setBreakMinutes: (val: number) => void;
}

export function PomodoroSelector({ workMinutes, breakMinutes, setWorkMinutes, setBreakMinutes }: PomodoroSelectorProps) {
  return (
    <>
      <div className="mb-4 px-2 shrink-0">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
          Pomodoro Settings
        </h2>
      </div>

      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-md flex flex-col gap-8 border-4 border-transparent flex-1 mb-4">
        {/* Work Duration */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-wide">Focus Time</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600">{workMinutes} MIN</span>
          </div>
          <input 
            type="range" 
            min="5" max="90" step="5" 
            value={workMinutes} 
            onChange={e => setWorkMinutes(Number(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#4f46e5' }}
          />
        </div>

        <div className="h-px bg-slate-100 w-full rounded-full" />

        {/* Break Duration */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm sm:text-base font-bold text-slate-500 uppercase tracking-wide">Break Time</span>
            <span className="text-xl sm:text-2xl font-black text-orange-500">{breakMinutes} MIN</span>
          </div>
          <input 
            type="range" 
            min="1" max="30" step="1" 
            value={breakMinutes} 
            onChange={e => setBreakMinutes(Number(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: '#f97316' }}
          />
        </div>
      </div>
    </>
  );
}

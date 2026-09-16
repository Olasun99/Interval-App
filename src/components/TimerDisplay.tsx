import React from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';

interface TimerDisplayProps {
  timeLeft: number;
  isActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  totalDuration: number;
  intervalLabel: string;
  titleOverride?: string;
  isBreak?: boolean;
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export function TimerDisplay({ timeLeft, isActive, toggleTimer, resetTimer, totalDuration, intervalLabel, titleOverride, isBreak }: TimerDisplayProps) {
  const formattedTime = formatTime(timeLeft);
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) : 0;

  // Circular progress properties
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <>
      <div className="flex-1 min-h-[400px] bg-white rounded-[40px] shadow-2xl shadow-orange-200/50 flex flex-col items-center justify-center relative overflow-hidden border-8 border-white">
        {/* Decorative Background Circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>

        <span className={`text-xs font-black uppercase tracking-[0.4em] mb-4 z-10 ${isBreak ? 'text-indigo-500' : 'text-orange-500'}`}>
          {titleOverride || 'Next Alert In'}
        </span>
        
        <div className="relative flex items-center justify-center w-[320px] h-[320px] z-10">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9" // slate-100
              strokeWidth="12"
            />
            {/* Progress ring */}
            <motion.circle
              cx="160"
              cy="160"
              r={radius}
              fill="transparent"
              stroke={isBreak ? '#4f46e5' : '#f97316'} // indigo-600 : orange-500
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ ease: "linear", duration: 0.5 }}
              style={{
                filter: `drop-shadow(0 0 8px ${isBreak ? 'rgba(79,70,229,0.4)' : 'rgba(249,115,22,0.4)'})`
              }}
            />
          </svg>

          <div className="flex flex-col items-center justify-center relative z-20">
            <motion.span 
              key={formattedTime}
              initial={{ opacity: 0.8, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black tabular-nums leading-none tracking-tighter text-slate-900"
            >
              {formattedTime}
            </motion.span>
            
            <div className="mt-4 flex flex-col items-center">
              <div className={`px-4 py-1.5 lg:px-5 lg:py-1.5 text-white rounded-full font-black text-sm shadow-lg ${isBreak ? 'bg-orange-500 shadow-orange-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
                {intervalLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-6 flex gap-4 shrink-0">
        <button 
          onClick={toggleTimer}
          className={`flex-1 py-4 lg:py-6 rounded-3xl font-black text-xl lg:text-2xl hover:scale-[0.98] active:scale-95 transition-all shadow-xl ${
            isActive ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white shadow-amber-500/30'
          }`}
        >
          {isActive ? 'PAUSE TIMER' : 'START TIMER'}
        </button>
        <button 
          onClick={resetTimer}
          className="w-20 lg:w-24 bg-white border-4 border-slate-900 rounded-3xl flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0"
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-8 h-8 text-slate-900" strokeWidth={2.5} />
        </button>
      </div>
    </>
  );
}

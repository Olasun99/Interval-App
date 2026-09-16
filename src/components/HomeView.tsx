import { Flame, Play, Activity } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';

interface HomeViewProps {
  onQuickStart: (minutes: number) => void;
  streakDays: number;
  todayFocusMinutes: number;
  todaySessionsCount: number;
}

export function HomeView({ onQuickStart, streakDays, todayFocusMinutes, todaySessionsCount }: HomeViewProps) {
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Welcome & Streak */}
        <div className="flex-1 bg-white rounded-[40px] p-8 md:p-10 shadow-xl border-4 border-white flex flex-col justify-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            Good Session.
          </h2>
          <p className="text-slate-500 font-medium mb-8 text-lg">
            Stay focused. Build your routine. Maintain awareness.
          </p>
          
          <div className="inline-flex items-center gap-4 bg-orange-50 px-6 py-4 rounded-3xl self-start">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${streakDays > 0 ? 'bg-orange-500 shadow-lg shadow-orange-500/30' : 'bg-slate-300'}`}>
              <Flame className={`w-6 h-6 ${streakDays > 0 ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div>
              <div className="text-sm font-bold text-orange-600 uppercase tracking-widest">Focus Streak</div>
              <div className="text-2xl font-black text-slate-800">
                {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="w-full md:w-1/3 bg-slate-900 rounded-[40px] p-8 md:p-10 shadow-2xl flex flex-col justify-center text-white border-4 border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-indigo-400" />
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Today</div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-4xl font-black text-white mb-1">{todayFocusMinutes}m</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Focus</div>
            </div>
            <div className="h-px bg-slate-800 w-full" />
            <div>
              <div className="text-4xl font-black text-white mb-1">{todaySessionsCount}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start */}
      <div>
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Quick Start</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[5, 10, 20, 30].map(mins => (
            <button
              key={mins}
              onClick={() => onQuickStart(mins)}
              className="bg-white hover:bg-orange-500 group rounded-[32px] p-6 shadow-md border-2 border-orange-100 hover:border-orange-500 transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 bg-orange-50 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <Play className="w-5 h-5 text-orange-500 group-hover:text-white fill-current ml-0.5" />
              </div>
              <div className="text-xl font-black text-slate-800 group-hover:text-white transition-colors">{mins} Min</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Target, CheckCircle2, X } from 'lucide-react';

interface ObjectiveModalProps {
  onStart: (objective: string) => void;
  onCancel: () => void;
}

export function ObjectiveModal({ onStart, onCancel }: ObjectiveModalProps) {
  const [objective, setObjective] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border-4 border-white animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Set Objective</h2>
          <p className="text-slate-500 font-medium text-sm mb-6">What are you trying to accomplish during this session?</p>
          
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g. Complete literature review"
            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-2xl px-4 py-4 text-slate-800 font-bold outline-none transition-colors mb-6"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onStart(objective);
            }}
          />
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-wider text-xs"
            >
              Cancel
            </button>
            <button 
              onClick={() => onStart(objective)}
              className="flex-1 py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all uppercase tracking-wider text-xs"
            >
              Start Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SummaryModalProps {
  totalTimeMinutes: number;
  alertsCompleted: number;
  objective: string;
  onClose: (status: 'completed' | 'partially_completed' | 'not_completed') => void;
}

export function SummaryModal({ totalTimeMinutes, alertsCompleted, objective, onClose }: SummaryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border-4 border-white animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm border-4 border-white ring-4 ring-green-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Session Complete</h2>
          <p className="text-slate-500 font-medium text-sm mb-8">Awesome work. Here's your summary.</p>
          
          <div className="w-full bg-slate-50 rounded-3xl p-6 mb-8 flex flex-col gap-4 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Duration</span>
              <span className="text-lg font-black text-slate-800">{totalTimeMinutes} Min</span>
            </div>
            <div className="h-px bg-slate-200 w-full" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Alerts</span>
              <span className="text-lg font-black text-orange-500">{alertsCompleted}</span>
            </div>
            {objective && (
              <>
                <div className="h-px bg-slate-200 w-full" />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objective</span>
                  <span className="text-sm font-bold text-slate-700 text-left leading-tight">{objective}</span>
                </div>
              </>
            )}
          </div>

          <div className="w-full space-y-3">
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Did you complete your objective?</div>
            <button onClick={() => onClose('completed')} className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-600 shadow-lg shadow-green-500/30 transition-all">
              Completed
            </button>
            <button onClick={() => onClose('partially_completed')} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all">
              Partially Completed
            </button>
            <button onClick={() => onClose('not_completed')} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
              Not Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

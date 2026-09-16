import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Clock, Target, Calendar, BellRing } from 'lucide-react';
import { SessionHistory } from '../types';

export function HistoryView() {
  const [history, setHistory] = useState<SessionHistory[]>([]);

  useEffect(() => {
    // We don't have a real history storage mechanism implemented in App.tsx yet, 
    // but we can show empty state or dummy data for now
    const saved = localStorage.getItem('timer_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
          <HistoryIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">History</h2>
          <p className="text-slate-500 font-medium">Review your past sessions and objectives.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl p-8 border-4 border-white flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <HistoryIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-sm mb-2">No history yet</p>
            <p className="text-xs text-slate-400">Complete a session to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(session => (
              <div key={session.id} className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-slate-200 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                      session.status === 'completed' ? 'bg-green-100 text-green-600' :
                      session.status === 'partially_completed' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {session.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {session.intent ? (
                    <div className="flex items-start gap-2 text-slate-700 font-bold">
                      <Target className="w-4 h-4 mt-1 text-slate-400 shrink-0" />
                      {session.intent}
                    </div>
                  ) : (
                    <div className="text-slate-400 font-bold italic">No objective set</div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 shrink-0 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Time
                    </span>
                    <span className="font-black text-slate-800">{Math.floor(session.durationSeconds / 60)}m</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <BellRing className="w-3 h-3" /> Alerts
                    </span>
                    <span className="font-black text-orange-500">{session.alertsCompleted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

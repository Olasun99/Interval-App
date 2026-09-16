import React, { useState, useEffect } from 'react';
import { LayoutList, Play, Plus, Clock } from 'lucide-react';
import { Routine } from '../types';

interface RoutinesViewProps {
  onStartRoutine: (routine: Routine) => void;
}

const DEFAULT_ROUTINES: Routine[] = [
  { id: '1', name: 'Pomodoro Classic', description: '25m focus, 5m break', intervalMinutes: 25, soundPreset: 'sharp_ring' },
  { id: '2', name: 'Deep Work Session', description: '90m uninterrupted focus', intervalMinutes: 90, soundPreset: 'bell' },
  { id: '3', name: 'Quick Catchup', description: '15m burst for emails/messages', intervalMinutes: 15, soundPreset: 'digital_beep' },
];

export function RoutinesView({ onStartRoutine }: RoutinesViewProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('timer_routines');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRoutines(parsed.length > 0 ? parsed : DEFAULT_ROUTINES);
      } catch (e) {
        setRoutines(DEFAULT_ROUTINES);
      }
    } else {
      setRoutines(DEFAULT_ROUTINES);
      localStorage.setItem('timer_routines', JSON.stringify(DEFAULT_ROUTINES));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
            <LayoutList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Routines</h2>
            <p className="text-slate-500 font-medium">Quick-start your favorite intervals.</p>
          </div>
        </div>
        
        {/* Placeholder for creating new routines */}
        <button className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors hidden sm:flex">
          <Plus className="w-4 h-4" />
          Create Routine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-8">
        {routines.map(routine => (
          <div key={routine.id} className="bg-white rounded-[32px] shadow-xl p-8 border-4 border-white hover:border-indigo-100 transition-colors flex flex-col h-full group">
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-800 mb-2">{routine.name}</h3>
              <p className="text-slate-500 font-medium mb-6">{routine.description}</p>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {routine.intervalMinutes} min
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onStartRoutine(routine)}
              className="w-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/30 font-black uppercase tracking-widest text-xs py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Routine
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

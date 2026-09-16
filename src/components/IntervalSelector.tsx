import React, { useState, useEffect } from 'react';
import { INTERVALS } from '../types';
import { Bookmark, Clock } from 'lucide-react';

interface IntervalSelectorProps {
  selectedInterval: number; // in minutes
  onSelect: (value: number) => void;
  disabled?: boolean;
}

type TabCategory = 'quick' | 'focus' | 'deep' | 'custom' | 'saved';

export function IntervalSelector({ selectedInterval, onSelect, disabled }: IntervalSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabCategory>('focus');
  
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  
  const [savedIntervals, setSavedIntervals] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('timer_savedIntervals');
    if (saved) {
      try {
        setSavedIntervals(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveToLocalStorage = (intervals: number[]) => {
    setSavedIntervals(intervals);
    localStorage.setItem('timer_savedIntervals', JSON.stringify(intervals));
  };

  const handleCustomSet = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    
    // Convert everything to minutes (decimals are supported by our timer if needed)
    const totalMinutes = (h * 60) + m + (s / 60);
    
    if (totalMinutes > 0) {
      onSelect(totalMinutes);
      setHours('');
      setMinutes('');
      setSeconds('');
    }
  };

  const handleSaveCustom = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    
    const totalMinutes = (h * 60) + m + (s / 60);
    
    if (totalMinutes > 0) {
      if (!savedIntervals.includes(totalMinutes)) {
        saveToLocalStorage([...savedIntervals, totalMinutes]);
      }
      onSelect(totalMinutes);
      setHours('');
      setMinutes('');
      setSeconds('');
      setActiveTab('saved');
    }
  };

  const removeSaved = (val: number, e: React.MouseEvent) => {
    e.stopPropagation();
    saveToLocalStorage(savedIntervals.filter(i => i !== val));
  };

  const renderIntervalGrid = (intervalsToRender: {value: number, label: string}[], emptyMsg?: string) => {
    if (intervalsToRender.length === 0 && emptyMsg) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
          <Bookmark className="w-8 h-8 mb-3 opacity-20" />
          <span className="text-sm font-bold uppercase tracking-widest">{emptyMsg}</span>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-4 overflow-y-auto pb-2 shrink-0">
        {intervalsToRender.map((interval) => {
          const isSelected = selectedInterval === interval.value;
          const num = interval.label.replace(/\D/g, '');
          const unit = interval.label.replace(/\d/g, '').toLowerCase();
          
          let displayUnit = 'Minutes';
          if (unit === 'm') displayUnit = num === '1' ? 'Minute' : 'Minutes';
          if (unit === 'h') displayUnit = num === '1' ? 'Hour' : 'Hours';
          if (unit === 's') displayUnit = num === '1' ? 'Second' : 'Seconds';

          return (
            <button
              key={interval.value}
              disabled={disabled}
              onClick={() => onSelect(interval.value)}
              className={`relative rounded-3xl border-4 flex flex-col items-center justify-center transition-all p-2 sm:p-4 min-h-[100px] ${
                isSelected
                  ? 'bg-indigo-600 border-white shadow-xl scale-[1.02] sm:scale-105'
                  : 'bg-white border-transparent shadow-md hover:border-orange-400 group'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className={`text-2xl sm:text-3xl font-black ${
                isSelected ? 'text-white' : 'group-hover:text-orange-500 text-slate-800'
              }`}>
                {num}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold uppercase mt-1 ${
                isSelected ? 'text-indigo-200' : 'text-slate-400'
              }`}>
                {displayUnit}
              </span>
              
              {activeTab === 'saved' && (
                <div 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-100 rounded-full hover:bg-red-200"
                  onClick={(e) => removeSaved(interval.value, e)}
                >
                  <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const formatCustomLabel = (val: number) => {
    const h = Math.floor(val / 60);
    const m = Math.floor(val % 60);
    const s = Math.round((val % 1) * 60);
    
    if (h > 0 && m === 0 && s === 0) return `${h}h`;
    if (h === 0 && m > 0 && s === 0) return `${m}m`;
    if (h === 0 && m === 0 && s > 0) return `${s}s`;
    
    // Mix
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);
    return parts.join(' ');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 shrink-0 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 p-1 bg-slate-200/50 rounded-full w-max">
          {(['quick', 'focus', 'deep', 'custom', 'saved'] as TabCategory[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {activeTab === 'quick' && renderIntervalGrid(INTERVALS.filter(i => i.value < 10))}
      {activeTab === 'focus' && renderIntervalGrid(INTERVALS.filter(i => i.value >= 10 && i.value <= 45))}
      {activeTab === 'deep' && renderIntervalGrid(INTERVALS.filter(i => i.value > 45))}
      
      {activeTab === 'saved' && renderIntervalGrid(
        savedIntervals.map(val => ({ value: val, label: formatCustomLabel(val) })),
        "No saved intervals"
      )}

      {activeTab === 'custom' && (
        <div className="mt-2 mb-4 shrink-0 flex-1">
           <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-md border-4 border-transparent focus-within:border-orange-400 transition-all flex flex-col gap-6">
              <div className="flex items-center gap-3 text-slate-400">
                <Clock className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Custom Duration</span>
              </div>
              <div className="flex items-center gap-2">
                 <input
                   type="number"
                   min="0"
                   className="flex-1 w-full min-w-0 bg-slate-50 rounded-2xl px-3 py-4 text-center text-xl sm:text-2xl font-black text-slate-800 outline-none placeholder-slate-300 transition-colors focus:bg-orange-50"
                   placeholder="Hr"
                   value={hours}
                   onChange={e => setHours(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleCustomSet()}
                 />
                 <span className="font-black text-slate-300 text-2xl">:</span>
                 <input
                   type="number"
                   min="0"
                   className="flex-1 w-full min-w-0 bg-slate-50 rounded-2xl px-3 py-4 text-center text-xl sm:text-2xl font-black text-slate-800 outline-none placeholder-slate-300 transition-colors focus:bg-orange-50"
                   placeholder="Min"
                   value={minutes}
                   onChange={e => setMinutes(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleCustomSet()}
                 />
                 <span className="font-black text-slate-300 text-2xl">:</span>
                 <input
                   type="number"
                   min="0"
                   className="flex-1 w-full min-w-0 bg-slate-50 rounded-2xl px-3 py-4 text-center text-xl sm:text-2xl font-black text-slate-800 outline-none placeholder-slate-300 transition-colors focus:bg-orange-50"
                   placeholder="Sec"
                   value={seconds}
                   onChange={e => setSeconds(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleCustomSet()}
                 />
              </div>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={handleCustomSet}
                  className="flex-1 bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest px-4 py-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Start Custom
                </button>
                <button 
                  onClick={handleSaveCustom}
                  className="flex-none bg-orange-100 text-orange-600 font-black text-xs uppercase tracking-widest px-4 py-4 rounded-2xl hover:bg-orange-200 transition-colors"
                  title="Save to favorites"
                >
                  Save
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

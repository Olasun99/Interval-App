import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useStreak } from '../hooks/useStreak';

export function AnalyticsView() {
  const { streakDays, todayFocusMinutes, todaySessionsCount } = useStreak();
  
  // Dummy data for visual purposes
  const weeklyData = [
    { day: 'Mon', mins: 45 },
    { day: 'Tue', mins: 120 },
    { day: 'Wed', mins: 30 },
    { day: 'Thu', mins: 90 },
    { day: 'Fri', mins: todayFocusMinutes > 0 ? todayFocusMinutes : 60 },
    { day: 'Sat', mins: 0 },
    { day: 'Sun', mins: 0 },
  ];
  
  const maxMins = Math.max(...weeklyData.map(d => d.mins), 120);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
          <BarChart2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Analytics</h2>
          <p className="text-slate-500 font-medium">Track your productivity trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[32px] shadow-xl p-8 border-4 border-white">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-orange-500" />
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Focus</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{todayFocusMinutes} <span className="text-lg text-slate-400 font-bold">min</span></div>
        </div>
        
        <div className="bg-white rounded-[32px] shadow-xl p-8 border-4 border-white">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Streak</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{streakDays} <span className="text-lg text-slate-400 font-bold">days</span></div>
        </div>

        <div className="bg-white rounded-[32px] shadow-xl p-8 border-4 border-white">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-green-500" />
            <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Sessions Today</div>
          </div>
          <div className="text-4xl font-black text-slate-800">{todaySessionsCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl p-8 border-4 border-white flex-1">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Weekly Overview</h3>
        <div className="flex items-end justify-between h-[200px] gap-2">
          {weeklyData.map((data, i) => {
            const heightPercentage = (data.mins / maxMins) * 100;
            return (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                <div 
                  className="w-full max-w-[40px] bg-slate-100 group-hover:bg-sky-500 rounded-t-xl transition-all relative"
                  style={{ height: `${Math.max(heightPercentage, 2)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded">
                    {data.mins}m
                  </div>
                </div>
                <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{data.day}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

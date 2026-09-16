import React from 'react';
import { Play, Pause, Hand, Minus, Plus, Music, Settings2, Hash } from 'lucide-react';
import { useMetronome } from '../hooks/useMetronome';
import { MetronomeSound } from '../utils/metronomeAudio';

export function MetronomeView() {
  const {
    isPlaying, setIsPlaying,
    bpm, setBpm,
    beatsPerMeasure, setBeatsPerMeasure,
    sound, setSound,
    accentFirstBeat, setAccentFirstBeat,
    volume, setVolume,
    currentVisualBeat,
    handleTapTempo
  } = useMetronome();

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-fuchsia-100 rounded-2xl flex items-center justify-center text-fuchsia-600 shadow-sm">
          <Music className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Metronome</h2>
          <p className="text-slate-500 font-medium">Precision musical timing and practice engine.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        
        {/* Main Metronome Display */}
        <div className="w-full xl:w-2/3 bg-white rounded-[40px] shadow-2xl p-8 border-4 border-white flex flex-col items-center relative overflow-hidden shrink-0">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-fuchsia-50 rounded-full blur-3xl opacity-60"></div>
          
          <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 relative z-10">Tempo (BPM)</div>
          
          <div className="flex items-center justify-center gap-6 mb-10 relative z-10 w-full">
            <button 
              onClick={() => setBpm(Math.max(20, bpm - 1))}
              className="w-14 h-14 bg-slate-50 text-slate-600 hover:text-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>
            
            <input 
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Math.min(400, Math.max(20, parseInt(e.target.value) || 120)))}
              className="text-7xl sm:text-8xl lg:text-[100px] font-black tabular-nums text-slate-900 bg-transparent text-center outline-none w-48 sm:w-64 tracking-tighter"
            />
            
            <button 
              onClick={() => setBpm(Math.min(400, bpm + 1))}
              className="w-14 h-14 bg-slate-50 text-slate-600 hover:text-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Tempo Slider */}
          <input
            type="range"
            min="20"
            max="400"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value))}
            className="w-full max-w-lg mb-12 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 relative z-10"
          />

          {/* Visual Beat Indicator */}
          <div className="flex gap-4 sm:gap-6 mb-12 relative z-10 h-16 sm:h-20 items-center justify-center w-full">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div 
                key={i} 
                className={`transition-all duration-75 rounded-full ${
                  currentVisualBeat === i 
                    ? (i === 0 && accentFirstBeat ? 'w-16 h-16 sm:w-20 sm:h-20 bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.5)]' : 'w-14 h-14 sm:w-16 sm:h-16 bg-slate-700 shadow-lg') 
                    : 'w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 border-2 border-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl border-4 ${
                isPlaying 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20 hover:bg-slate-800' 
                  : 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-fuchsia-500/30 hover:bg-fuchsia-600 hover:border-fuchsia-600'
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {isPlaying ? 'Stop' : 'Start'}
            </button>
            <button
              onClick={handleTapTempo}
              className="flex-none sm:w-32 py-5 bg-white border-4 border-slate-100 text-slate-600 hover:border-fuchsia-200 hover:text-fuchsia-600 rounded-[24px] font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-1 transition-all"
            >
              <Hand className="w-5 h-5" />
              Tap
            </button>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6">
          <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-xl border-4 border-slate-800 flex-1">
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="w-5 h-5 text-fuchsia-400" />
              <h3 className="font-black uppercase tracking-widest text-sm text-slate-300">Settings</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Time Signature
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                      key={num}
                      onClick={() => setBeatsPerMeasure(num)}
                      className={`py-3 rounded-xl font-black text-sm transition-colors ${beatsPerMeasure === num ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {num}/4
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-800 w-full" />

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Sound</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['digital', 'woodblock', 'cowbell', 'soft'] as MetronomeSound[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setSound(s)}
                      className={`py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors ${sound === s ? 'bg-fuchsia-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-px bg-slate-800 w-full" />

              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Accent First Beat</label>
                <button 
                  onClick={() => setAccentFirstBeat(!accentFirstBeat)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${accentFirstBeat ? 'bg-fuchsia-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 bottom-1 w-4 bg-white rounded-full transition-transform ${accentFirstBeat ? 'translate-x-[26px]' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

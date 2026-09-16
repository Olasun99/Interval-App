import { useState, useEffect } from 'react';
import { BellRing, Play, Activity, TimerReset, Focus, Home, LayoutList, History, BarChart2, Settings, ListTodo, Music } from 'lucide-react';
import { TimerDisplay } from './components/TimerDisplay';
import { IntervalSelector } from './components/IntervalSelector';
import { PomodoroSelector } from './components/PomodoroSelector';
import { useDriftlessTimer } from './hooks/useDriftlessTimer';
import { TimerMode } from './hooks/useIntervalTimer';
import { INTERVALS } from './types';
import { SoundPreset, playAlarm, speakMessage, AmbientSound, playAmbient, stopAmbient } from './utils/audio';
import { HomeView } from './components/HomeView';
import { TasksView } from './components/TasksView';
import { RoutinesView } from './components/RoutinesView';
import { AnalyticsView } from './components/AnalyticsView';
import { HistoryView } from './components/HistoryView';
import { MetronomeView } from './components/MetronomeView';
import { ObjectiveModal, SummaryModal } from './components/SessionModals';
import { useStreak } from './hooks/useStreak';

type ViewState = 'home' | 'timer' | 'routines' | 'tasks' | 'history' | 'analytics' | 'settings' | 'metronome';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('timer');
  
  const [mode, setMode] = useState<TimerMode>('interval');
  const [selectedInterval, setSelectedInterval] = useState<number>(INTERVALS[2].value);
  const [pomoWork, setPomoWork] = useState<number>(25);
  const [pomoBreak, setPomoBreak] = useState<number>(5);
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('sharp_ring');
  const [ambientPreset, setAmbientPreset] = useState<AmbientSound>('none');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceMessage, setVoiceMessage] = useState('Interval complete.');
  const [extraLoud, setExtraLoud] = useState(false);

  const { streakDays, todayFocusMinutes, todaySessionsCount, checkAndRecordSession } = useStreak();

  const [objective, setObjective] = useState(() => {
    return localStorage.getItem('timer_objective') || '';
  });
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  // Store summary data before resetting timer
  const [summaryData, setSummaryData] = useState<{ time: number, alerts: number, objective: string } | null>(null);

  const { isActive, timeLeft, totalElapsed, intervalsCompleted, phase, totalDuration, toggleTimer, resetTimer, addTime, skipAlert } = useDriftlessTimer(
    mode, selectedInterval, pomoWork, pomoBreak, soundPreset, voiceMessage, voiceEnabled, extraLoud
  );

  useEffect(() => {
    if (isActive && ambientPreset !== 'none') {
      playAmbient(ambientPreset);
    } else {
      stopAmbient();
    }
    
    return () => stopAmbient();
  }, [isActive, ambientPreset]);

  useEffect(() => {
    localStorage.setItem('timer_objective', objective);
  }, [objective]);

  const handleStartRequest = () => {
    if (isActive) {
      // Pause
      toggleTimer();
    } else {
      // Trying to start/resume
      if (totalElapsed === 0 && !objective) {
        // Only ask objective for fresh sessions
        setShowObjectiveModal(true);
      } else {
        toggleTimer();
      }
    }
  };

  const handleStopRequest = () => {
    if (totalElapsed > 0 || intervalsCompleted > 0) {
      setSummaryData({
        time: Math.floor(totalElapsed / 60),
        alerts: intervalsCompleted,
        objective
      });
      setShowSummaryModal(true);
      if (isActive) toggleTimer(); // Pause in background
    } else {
      resetTimer();
      setObjective('');
    }
  };

  const handleModalStart = (obj: string) => {
    setObjective(obj);
    setShowObjectiveModal(false);
    toggleTimer();
  };

  const handleModalClose = (status: string) => {
    // Record to history in a real app, update streak
    if (summaryData && (summaryData.time > 0 || summaryData.alerts > 0)) {
      checkAndRecordSession(summaryData.time);
      
      const savedHistory = localStorage.getItem('timer_history');
      let historyList = [];
      if (savedHistory) {
        try { historyList = JSON.parse(savedHistory); } catch(e) {}
      }
      
      historyList.unshift({
        id: Date.now().toString(),
        startedAt: Date.now() - (summaryData.time * 60 * 1000),
        endedAt: Date.now(),
        durationSeconds: summaryData.time * 60,
        alertsCompleted: summaryData.alerts,
        routineName: mode === 'pomodoro' ? 'Pomodoro' : 'Interval',
        intent: summaryData.objective,
        status: status
      });
      
      localStorage.setItem('timer_history', JSON.stringify(historyList));
    }
    setShowSummaryModal(false);
    setSummaryData(null);
    setObjective('');
    resetTimer();
  };

  const selectedIntervalOption = INTERVALS.find(i => i.value === selectedInterval);
  
  let intervalLabel = '';
  if (mode === 'pomodoro') {
    intervalLabel = phase === 'work' ? `${pomoWork} MIN FOCUS` : `${pomoBreak} MIN BREAK`;
  } else {
    if (selectedIntervalOption) {
      const num = selectedIntervalOption.label.replace(/\D/g, '');
      const unit = selectedIntervalOption.label.replace(/\d/g, '').toLowerCase();
      if (unit === 'm') intervalLabel = `${num} MINUTE${num === '1' ? '' : 'S'}`;
      else if (unit === 'h') intervalLabel = `${num} HOUR${num === '1' ? '' : 'S'}`;
      else intervalLabel = selectedIntervalOption.label;
    } else {
      const h = Math.floor(selectedInterval / 60);
      const m = Math.floor(selectedInterval % 60);
      const s = Math.round((selectedInterval % 1) * 60);
      const parts = [];
      if (h > 0) parts.push(`${h} HR`);
      if (m > 0) parts.push(`${m} MIN`);
      if (s > 0) parts.push(`${s} SEC`);
      intervalLabel = parts.join(' ') || '0 SEC';
    }
  }

  const titleOverride = mode === 'pomodoro' 
    ? (phase === 'work' ? 'Focus Phase' : 'Break Phase') 
    : 'Next Alert In';

  const NavigationItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button 
      onClick={() => setCurrentView(view)}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 w-full rounded-2xl transition-all ${currentView === view ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
    >
      <Icon className="w-6 h-6 md:w-5 md:h-5" />
      <span className="text-[10px] md:text-sm font-black uppercase tracking-wider hidden sm:block">{label}</span>
    </button>
  );

  return (
    <div className="w-full h-screen flex flex-col md:flex-row bg-orange-50 font-sans overflow-hidden select-none text-slate-800 selection:bg-orange-500/30">
      
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-r border-orange-100 flex md:flex-col justify-between p-4 md:p-6 shrink-0 z-20">
        <div className="flex items-center gap-3 mb-0 md:mb-12">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase hidden md:block">EchoInterval</h1>
        </div>

        <div className="flex md:flex-col gap-2 w-full justify-around md:justify-start">
          <NavigationItem view="home" icon={Home} label="Home" />
          <NavigationItem view="timer" icon={TimerReset} label="Timer" />
          <NavigationItem view="metronome" icon={Music} label="Metronome" />
          <NavigationItem view="routines" icon={LayoutList} label="Routines" />
          <NavigationItem view="tasks" icon={ListTodo} label="Tasks" />
          <NavigationItem view="history" icon={History} label="History" />
          <NavigationItem view="analytics" icon={BarChart2} label="Analytics" />
        </div>

        <div className="hidden md:flex mt-auto pt-6 border-t border-orange-100">
          <NavigationItem view="settings" icon={Settings} label="Settings" />
        </div>
      </nav>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Status */}
        <header className="flex items-center justify-end md:justify-between px-6 md:px-10 py-4 shrink-0">
          <div className="hidden md:block text-sm font-bold text-slate-400 uppercase tracking-widest">
            {currentView}
          </div>
          <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-full border border-orange-100 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              {isActive ? 'Session Active' : 'Idle'}
            </span>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10">
          {currentView === 'timer' && (
            <div className="flex flex-col h-full max-w-6xl mx-auto">
              {/* Mode Toggle */}
              <div className="flex justify-center mb-6 shrink-0">
                <div className="bg-white/60 backdrop-blur-sm p-1.5 rounded-3xl border border-orange-100 flex shadow-sm max-w-sm w-full relative overflow-hidden">
                  <button 
                    onClick={() => { setMode('interval'); resetTimer(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all z-10 ${mode === 'interval' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <TimerReset className="w-4 h-4" />
                    Interval
                  </button>
                  <button 
                    onClick={() => { setMode('pomodoro'); resetTimer(); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all z-10 ${mode === 'pomodoro' ? 'text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Focus className="w-4 h-4" />
                    Pomodoro
                  </button>
                  <div 
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-2xl transition-all duration-300 ease-out shadow-md ${mode === 'interval' ? 'translate-x-0 bg-orange-500' : 'translate-x-[calc(100%+6px)] bg-indigo-600'}`}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col xl:flex-row gap-8">
                {/* Left Column: Active Monitoring */}
                <section className="w-full xl:w-7/12 flex flex-col gap-6">
                  <TimerDisplay 
                    timeLeft={timeLeft}
                    isActive={isActive}
                    toggleTimer={handleStartRequest}
                    resetTimer={handleStopRequest}
                    totalDuration={totalDuration}
                    intervalLabel={intervalLabel}
                    titleOverride={titleOverride}
                    isBreak={mode === 'pomodoro' && phase === 'break'}
                  />
                  
                  {/* Session Controls */}
                  {isActive && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button onClick={() => addTime(1)} className="px-4 py-2 bg-white rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 border border-slate-200">+1 Min</button>
                      <button onClick={() => addTime(5)} className="px-4 py-2 bg-white rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm hover:bg-slate-50 border border-slate-200">+5 Min</button>
                      <button onClick={skipAlert} className="px-4 py-2 bg-indigo-50 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm hover:bg-indigo-100 border border-indigo-100">Skip Next</button>
                    </div>
                  )}

                  {/* Summary Dashboard */}
                  <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-orange-100 flex flex-col gap-6 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                           <Activity className="w-6 h-6 text-indigo-600" />
                         </div>
                         <div>
                           <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Session Time</div>
                           <div className="text-2xl font-black text-slate-800">{Math.floor(totalElapsed / 60)}m {totalElapsed % 60}s</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alerts</div>
                         <div className="text-2xl font-black text-orange-500">{intervalsCompleted}</div>
                      </div>
                    </div>
                    {objective && (
                      <>
                        <div className="h-px bg-slate-100 w-full" />
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Objective</div>
                          <div className="text-sm font-bold text-slate-700">{objective}</div>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                {/* Right Column: Interval Grid */}
                <section className="w-full xl:w-5/12 flex flex-col max-h-[800px]">
                  {mode === 'interval' ? (
                    <IntervalSelector 
                      selectedInterval={selectedInterval}
                      onSelect={(val) => { setSelectedInterval(val); resetTimer(); }}
                    />
                  ) : (
                    <PomodoroSelector 
                      workMinutes={pomoWork}
                      breakMinutes={pomoBreak}
                      setWorkMinutes={setPomoWork}
                      setBreakMinutes={setPomoBreak}
                    />
                  )}
                  
                  {/* Audio Settings Panel */}
                  <div className="mt-4 bg-slate-900 rounded-[32px] p-6 flex flex-col gap-6 text-white shadow-xl shrink-0 border-4 border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer" onClick={() => playAlarm(soundPreset)}>
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Alert Sound</div>
                          <select 
                            value={soundPreset}
                            onChange={(e) => {
                              const val = e.target.value as SoundPreset;
                              setSoundPreset(val);
                              playAlarm(val);
                            }}
                            className="bg-transparent text-white font-black text-lg outline-none cursor-pointer appearance-none"
                          >
                            <option value="sharp_ring" className="bg-slate-900">Sharp Ring (Loud)</option>
                            <option value="loud_bang" className="bg-slate-900">Loud Bang</option>
                            <option value="classic_alarm" className="bg-slate-900">Classic Alarm</option>
                            <option value="digital_beep" className="bg-slate-900">Digital Beep</option>
                            <option value="bell" className="bg-slate-900">Chime / Bell</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-800 w-full" />

                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Ambient Sound</div>
                      <select 
                        value={ambientPreset}
                        onChange={(e) => setAmbientPreset(e.target.value as AmbientSound)}
                        className="bg-transparent text-white font-black text-lg outline-none cursor-pointer appearance-none"
                      >
                        <option value="none" className="bg-slate-900">None</option>
                        <option value="white_noise" className="bg-slate-900">White Noise</option>
                        <option value="brown_noise" className="bg-slate-900">Brown Noise</option>
                        <option value="rain" className="bg-slate-900">Rain</option>
                      </select>
                      <p className="text-xs text-slate-500 font-medium mt-1">Plays only while timer is active.</p>
                    </div>

                    <div className="h-px bg-slate-800 w-full" />

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Extra Loud Mode</div>
                        <button 
                          onClick={() => setExtraLoud(!extraLoud)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${extraLoud ? 'bg-orange-500' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-transform ${extraLoud ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-800 w-full" />

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Voice Announcement</div>
                        <button 
                          onClick={() => setVoiceEnabled(!voiceEnabled)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${voiceEnabled ? 'bg-orange-500' : 'bg-slate-700'}`}
                        >
                          <div className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-transform ${voiceEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                        </button>
                      </div>
                      {voiceEnabled && (
                        <div className="flex items-center gap-2 mt-2">
                           <input 
                             type="text"
                             value={voiceMessage}
                             onChange={(e) => setVoiceMessage(e.target.value)}
                             placeholder="e.g. Check your posture."
                             className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 border border-slate-700"
                           />
                           <button onClick={() => speakMessage(voiceMessage)} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                              <Play className="w-4 h-4 fill-current" />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {currentView === 'home' && (
            <HomeView 
              streakDays={streakDays} 
              todayFocusMinutes={todayFocusMinutes}
              todaySessionsCount={todaySessionsCount}
              onQuickStart={(mins) => {
                setMode('interval');
                setSelectedInterval(mins);
                resetTimer(); // We'll let them click start themselves, or we can auto-start
                setCurrentView('timer');
              }} 
            />
          )}

          {currentView === 'tasks' && (
            <TasksView 
              onStartTaskTimer={(taskTitle) => {
                setObjective(taskTitle);
                resetTimer();
                setCurrentView('timer');
              }}
            />
          )}
          
          {currentView === 'routines' && (
            <RoutinesView 
              onStartRoutine={(routine) => {
                setMode('interval');
                setSelectedInterval(routine.intervalMinutes);
                setSoundPreset(routine.soundPreset as SoundPreset);
                if (routine.voiceMessage) {
                  setVoiceEnabled(true);
                  setVoiceMessage(routine.voiceMessage);
                }
                resetTimer();
                setCurrentView('timer');
              }} 
            />
          )}

          {currentView === 'history' && <HistoryView />}
          
          {currentView === 'metronome' && <MetronomeView />}
          
          {currentView === 'analytics' && <AnalyticsView />}

          {currentView === 'settings' && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-20 animate-in fade-in">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
                <Settings className="w-10 h-10 text-slate-300" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">Settings</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Settings module is coming in the next update.
              </p>
            </div>
          )}
        </div>
      </div>

      {showObjectiveModal && (
        <ObjectiveModal 
          onStart={handleModalStart} 
          onCancel={() => setShowObjectiveModal(false)} 
        />
      )}

      {showSummaryModal && summaryData && (
        <SummaryModal 
          totalTimeMinutes={summaryData.time}
          alertsCompleted={summaryData.alerts}
          objective={summaryData.objective}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

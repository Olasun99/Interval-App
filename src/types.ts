export interface IntervalOption {
  label: string;
  value: number; // in minutes
}

export const INTERVALS: IntervalOption[] = [
  { label: '1m', value: 1 },
  { label: '2m', value: 2 },
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '20m', value: 20 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '3h', value: 180 },
];
export interface Task {
  id: string;
  title: string;
  estimatedMinutes?: number;
  completed: boolean;
  createdAt: number;
}

export interface SessionHistory {
  id: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  alertsCompleted: number;
  routineName: string;
  intent: string;
  status: 'completed' | 'partially_completed' | 'not_completed' | 'abandoned';
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  intervalMinutes: number;
  soundPreset: string;
  voiceMessage?: string;
  totalDurationMinutes?: number; // optional hard stop
}

export type ViewState = 'home' | 'timer' | 'tasks' | 'history' | 'settings' | 'analytics' | 'routines' | 'metronome';

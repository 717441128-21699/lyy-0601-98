export type ViewType = 'today' | 'rest' | 'posture' | 'eye' | 'stretch' | 'trend' | 'settings';

export interface PostureRecord {
  timestamp: number;
  status: 'good' | 'needs_adjustment';
  note?: string;
}

export interface PainRecord {
  timestamp: number;
  area: 'neck' | 'shoulder' | 'back' | 'wrist' | 'eye';
  level: number;
}

export interface DailyRecord {
  date: string;
  sedentaryMinutes: number;
  restCount: number;
  waterIntake: number;
  blinkCount: number;
  postureRecords: PostureRecord[];
  painRecords: PainRecord[];
  eyeExerciseMinutes: number;
  stretchingMinutes: number;
  fatigueScore: number;
  screenDistance: 'too_close' | 'normal' | 'too_far' | null;
}

export interface ReminderSettings {
  workHours: { start: string; end: string };
  pomodoro: { workMinutes: number; restMinutes: number; enabled: boolean };
  sedentary: { thresholdMinutes: number; enabled: boolean };
  water: { intervalMinutes: number; enabled: boolean };
  blink: { intervalMinutes: number; enabled: boolean };
  eyeExercise: { intervalHours: number; enabled: boolean };
  stretching: { intervalHours: number; enabled: boolean };
  abnormalReminder: { enabled: boolean; maxConsecutive: number };
  focusMode: { enabled: boolean; start: string; end: string; muteSound: boolean };
}

export interface AppState {
  currentView: ViewType;
  isWorking: boolean;
  currentSessionStart: number | null;
  consecutiveAbnormalCount: number;
  todayRecord: DailyRecord;
  settings: ReminderSettings;
  historyRecords: DailyRecord[];
}

export interface ExerciseStep {
  id: string;
  name: string;
  description: string;
  duration: number;
  animationType: string;
}

export interface StretchAction {
  id: string;
  name: string;
  category: 'neck' | 'shoulder' | 'wrist' | 'back';
  description: string;
  duration: number;
  steps: string[];
}

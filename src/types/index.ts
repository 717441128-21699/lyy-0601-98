export type ViewType = 'today' | 'rest' | 'posture' | 'eye' | 'stretch' | 'trend' | 'settings';

export type ActivityType = 
  | 'work_start' 
  | 'work_pause' 
  | 'water' 
  | 'posture_good' 
  | 'posture_needs_adjustment'
  | 'rest_start'
  | 'rest_end'
  | 'eye_exercise_start'
  | 'eye_exercise_complete'
  | 'stretching_start'
  | 'stretching_complete'
  | 'pain_record'
  | 'fatigue_record'
  | 'screen_distance_record';

export type ReminderType = 'sedentary' | 'water' | 'blink' | 'eye' | 'stretch' | 'pomodoro';

export interface ActivityRecord {
  id: string;
  type: ActivityType;
  timestamp: number;
  details?: Record<string, unknown>;
  undoable: boolean;
  undone?: boolean;
  groupId?: string;
}

export interface ReminderLog {
  id: string;
  type: ReminderType;
  timestamp: number;
  title: string;
  body: string;
  status: 'shown' | 'suppressed' | 'failed';
  suppressedReason?: 'focus_mode' | 'outside_work_hours' | 'not_working';
}

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
  activityRecords: ActivityRecord[];
  reminderLogs: ReminderLog[];
  abnormalReminderCount: number;
}

export interface PlanAdjustment {
  id: string;
  date: string;
  type: 'pomodoro' | 'sedentary' | 'water' | 'eye' | 'stretch';
  field: 'workMinutes' | 'restMinutes' | 'thresholdMinutes' | 'intervalMinutes' | 'intervalHours';
  currentValue: number;
  suggestedValue: number;
  reason: string;
  status: 'pending' | 'applied' | 'dismissed';
  appliedAt?: number;
  dismissedAt?: number;
  appliedSettings?: Partial<ReminderSettings>;
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
  planAdjustments: PlanAdjustment[];
  lastMinuteTick: number;
  lastNotificationTick: Record<ReminderType, number>;
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

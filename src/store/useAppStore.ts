import { create } from 'zustand';
import { AppState, ViewType, DailyRecord, ReminderSettings, PainRecord, PostureRecord } from '@/types';
import { loadSettings, saveSettings, loadDailyRecords, saveDailyRecords, createEmptyDailyRecord } from '@/utils/storage';
import { getTodayString } from '@/utils/dateUtils';

interface AppStore extends AppState {
  setCurrentView: (view: ViewType) => void;
  startWorking: () => void;
  stopWorking: () => void;
  incrementSedentaryMinutes: () => void;
  incrementRestCount: () => void;
  addWaterIntake: () => void;
  incrementBlinkCount: () => void;
  addPostureRecord: (status: 'good' | 'needs_adjustment') => void;
  addPainRecord: (area: PainRecord['area'], level: number) => void;
  setScreenDistance: (distance: DailyRecord['screenDistance']) => void;
  setFatigueScore: (score: number) => void;
  addEyeExerciseMinutes: (minutes: number) => void;
  addStretchingMinutes: (minutes: number) => void;
  updateSettings: (settings: Partial<ReminderSettings>) => void;
  incrementAbnormalCount: () => void;
  resetAbnormalCount: () => void;
  saveTodayRecord: () => void;
}

const initializeTodayRecord = (): DailyRecord => {
  const todayStr = getTodayString();
  const history = loadDailyRecords();
  const existing = history.find(r => r.date === todayStr);
  if (existing) {
    return existing;
  }
  return createEmptyDailyRecord(todayStr);
};

const initializeHistoryRecords = (): DailyRecord[] => {
  const todayStr = getTodayString();
  const history = loadDailyRecords();
  return history.filter(r => r.date !== todayStr);
};

export const useAppStore = create<AppStore>((set, get) => ({
  currentView: 'today',
  isWorking: false,
  currentSessionStart: null,
  consecutiveAbnormalCount: 0,
  todayRecord: initializeTodayRecord(),
  settings: loadSettings(),
  historyRecords: initializeHistoryRecords(),

  setCurrentView: (view) => set({ currentView: view }),

  startWorking: () => set({ isWorking: true, currentSessionStart: Date.now() }),

  stopWorking: () => set({ isWorking: false, currentSessionStart: null }),

  incrementSedentaryMinutes: () => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      sedentaryMinutes: state.todayRecord.sedentaryMinutes + 1,
    },
  })),

  incrementRestCount: () => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      restCount: state.todayRecord.restCount + 1,
    },
    consecutiveAbnormalCount: 0,
  })),

  addWaterIntake: () => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      waterIntake: state.todayRecord.waterIntake + 1,
    },
  })),

  incrementBlinkCount: () => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      blinkCount: state.todayRecord.blinkCount + 1,
    },
  })),

  addPostureRecord: (status) => set((state) => {
    const record: PostureRecord = { timestamp: Date.now(), status };
    const shouldResetAbnormal = status === 'good';
    return {
      todayRecord: {
        ...state.todayRecord,
        postureRecords: [...state.todayRecord.postureRecords, record],
      },
      consecutiveAbnormalCount: shouldResetAbnormal ? 0 : state.consecutiveAbnormalCount,
    };
  }),

  addPainRecord: (area, level) => set((state) => {
    const record: PainRecord = { timestamp: Date.now(), area, level };
    return {
      todayRecord: {
        ...state.todayRecord,
        painRecords: [...state.todayRecord.painRecords, record],
      },
    };
  }),

  setScreenDistance: (distance) => set((state) => ({
    todayRecord: { ...state.todayRecord, screenDistance: distance },
  })),

  setFatigueScore: (score) => set((state) => ({
    todayRecord: { ...state.todayRecord, fatigueScore: score },
  })),

  addEyeExerciseMinutes: (minutes) => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      eyeExerciseMinutes: state.todayRecord.eyeExerciseMinutes + minutes,
    },
  })),

  addStretchingMinutes: (minutes) => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      stretchingMinutes: state.todayRecord.stretchingMinutes + minutes,
    },
  })),

  updateSettings: (newSettings) => set((state) => {
    const updated = { ...state.settings, ...newSettings };
    saveSettings(updated);
    return { settings: updated };
  }),

  incrementAbnormalCount: () => set((state) => ({
    consecutiveAbnormalCount: state.consecutiveAbnormalCount + 1,
  })),

  resetAbnormalCount: () => set({ consecutiveAbnormalCount: 0 }),

  saveTodayRecord: () => {
    const state = get();
    const todayStr = getTodayString();
    const updatedRecord = { ...state.todayRecord, date: todayStr };
    
    const allRecords = loadDailyRecords();
    const existingIndex = allRecords.findIndex(r => r.date === todayStr);
    let newAllRecords: DailyRecord[];
    if (existingIndex >= 0) {
      newAllRecords = [...allRecords];
      newAllRecords[existingIndex] = updatedRecord;
    } else {
      newAllRecords = [...allRecords, updatedRecord];
    }
    saveDailyRecords(newAllRecords);
    
    const newHistoryRecords = newAllRecords.filter(r => r.date !== todayStr);
    set({ historyRecords: newHistoryRecords });
  },
}));

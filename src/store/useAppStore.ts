import { create } from 'zustand';
import { AppState, ViewType, DailyRecord, ReminderSettings, PainRecord, PostureRecord, ActivityRecord, ReminderLog, ActivityType, ReminderType, PlanAdjustment } from '@/types';
import { loadSettings, saveSettings, loadDailyRecords, saveDailyRecords, createEmptyDailyRecord, loadPlanAdjustments, savePlanAdjustments, getReminderLogsByDateRange } from '@/utils/storage';
import { getTodayString } from '@/utils/dateUtils';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface AppStore extends AppState {
  setCurrentView: (view: ViewType) => void;
  startWorking: () => void;
  stopWorking: () => void;
  incrementSedentaryMinutes: (forceMinute?: number) => void;
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
  addActivity: (type: ActivityType, details?: Record<string, unknown>, undoable?: boolean, groupId?: string) => string;
  undoActivity: (activityId: string) => void;
  addReminderLog: (type: ReminderType, title: string, body: string, status: ReminderLog['status'], suppressedReason?: ReminderLog['suppressedReason']) => void;
  addPlanAdjustment: (adjustment: Omit<PlanAdjustment, 'id' | 'date' | 'status'>) => void;
  applyPlanAdjustment: (adjustmentId: string) => void;
  dismissPlanAdjustment: (adjustmentId: string) => void;
  restoreDismissedAdjustment: (adjustmentId: string) => void;
  generatePlanSuggestions: () => PlanAdjustment[];
  getTodayActivities: () => ActivityRecord[];
  getTodayReminderLogs: () => ReminderLog[];
  getReminderLogsByRange: (daysBack: number) => ReminderLog[];
  savePlanAdjustments: () => void;
  checkNotificationThrottle: (type: ReminderType) => boolean;
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
  planAdjustments: loadPlanAdjustments(),
  lastMinuteTick: Math.floor(Date.now() / 60000),
  lastNotificationTick: {
    sedentary: 0,
    water: 0,
    blink: 0,
    eye: 0,
    stretch: 0,
    pomodoro: 0,
  },

  setCurrentView: (view) => set({ currentView: view }),

  startWorking: () => {
    const now = Date.now();
    set({ isWorking: true, currentSessionStart: now });
    get().addActivity('work_start', { timestamp: now }, false);
  },

  stopWorking: () => {
    const now = Date.now();
    set({ isWorking: false, currentSessionStart: null });
    get().addActivity('work_pause', { timestamp: now }, false);
  },

  incrementSedentaryMinutes: (forceMinute?: number) => set((state) => {
    const currentMinute = forceMinute ?? Math.floor(Date.now() / 60000);
    if (currentMinute <= state.lastMinuteTick) {
      return {};
    }
    return {
      lastMinuteTick: currentMinute,
      todayRecord: {
        ...state.todayRecord,
        sedentaryMinutes: state.todayRecord.sedentaryMinutes + 1,
      },
    };
  }),

  incrementRestCount: () => {
    const state = get();
    set({
      todayRecord: {
        ...state.todayRecord,
        restCount: state.todayRecord.restCount + 1,
      },
      consecutiveAbnormalCount: 0,
    });
    get().addActivity('rest_start', { count: state.todayRecord.restCount + 1 }, false);
  },

  addWaterIntake: () => {
    const state = get();
    const newCount = state.todayRecord.waterIntake + 1;
    set({
      todayRecord: {
        ...state.todayRecord,
        waterIntake: newCount,
      },
    });
    get().addActivity('water', { count: newCount }, true);
  },

  incrementBlinkCount: () => set((state) => ({
    todayRecord: {
      ...state.todayRecord,
      blinkCount: state.todayRecord.blinkCount + 1,
    },
  })),

  addPostureRecord: (status) => {
    const state = get();
    const record: PostureRecord = { timestamp: Date.now(), status };
    const shouldResetAbnormal = status === 'good';
    const activityType = status === 'good' ? 'posture_good' : 'posture_needs_adjustment';
    set({
      todayRecord: {
        ...state.todayRecord,
        postureRecords: [...state.todayRecord.postureRecords, record],
      },
      consecutiveAbnormalCount: shouldResetAbnormal ? 0 : state.consecutiveAbnormalCount,
    });
    get().addActivity(activityType, { status }, true);
  },

  addPainRecord: (area, level) => {
    const state = get();
    const record: PainRecord = { timestamp: Date.now(), area, level };
    set({
      todayRecord: {
        ...state.todayRecord,
        painRecords: [...state.todayRecord.painRecords, record],
      },
    });
    get().addActivity('pain_record', { area, level }, true);
  },

  setScreenDistance: (distance) => {
    const state = get();
    set({
      todayRecord: { ...state.todayRecord, screenDistance: distance },
    });
    if (distance) {
      get().addActivity('screen_distance_record', { distance }, true);
    }
  },

  setFatigueScore: (score) => {
    const state = get();
    set({
      todayRecord: { ...state.todayRecord, fatigueScore: score },
    });
    get().addActivity('fatigue_record', { score }, true);
  },

  addEyeExerciseMinutes: (minutes) => {
    const state = get();
    set({
      todayRecord: {
        ...state.todayRecord,
        eyeExerciseMinutes: state.todayRecord.eyeExerciseMinutes + minutes,
      },
    });
    get().addActivity('eye_exercise_complete', { minutes }, false);
  },

  addStretchingMinutes: (minutes) => {
    const state = get();
    set({
      todayRecord: {
        ...state.todayRecord,
        stretchingMinutes: state.todayRecord.stretchingMinutes + minutes,
      },
    });
    get().addActivity('stretching_complete', { minutes }, false);
  },

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
    const abnormalCount = state.consecutiveAbnormalCount >= state.settings.abnormalReminder.maxConsecutive
      ? state.todayRecord.abnormalReminderCount + 1
      : state.todayRecord.abnormalReminderCount;
    const updatedRecord = { ...state.todayRecord, date: todayStr, abnormalReminderCount: abnormalCount };
    
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

  addActivity: (type, details, undoable = false, groupId) => {
    const recordId = generateId();
    const record: ActivityRecord = {
      id: recordId,
      type,
      timestamp: Date.now(),
      details,
      undoable,
      undone: false,
      groupId,
    };
    set((state) => ({
      todayRecord: {
        ...state.todayRecord,
        activityRecords: [...state.todayRecord.activityRecords, record],
      },
    }));
    return recordId;
  },

  undoActivity: (activityId) => set((state) => {
    const activity = state.todayRecord.activityRecords.find(a => a.id === activityId);
    if (!activity || !activity.undoable || activity.undone) {
      return {};
    }

    let updates: Partial<typeof state.todayRecord> = {};
    const activityIdsToUndo: string[] = [activityId];

    if (activity.groupId) {
      state.todayRecord.activityRecords.forEach(a => {
        if (a.groupId === activity.groupId && a.id !== activityId && !a.undone) {
          activityIdsToUndo.push(a.id);
          if (a.type === 'rest_end') {
            updates.restCount = Math.max(0, state.todayRecord.restCount - 1);
          } else if (a.type === 'eye_exercise_complete') {
            const minutes = (a.details?.minutes as number) || 0;
            updates.eyeExerciseMinutes = Math.max(0, state.todayRecord.eyeExerciseMinutes - minutes);
          } else if (a.type === 'stretching_complete') {
            const minutes = (a.details?.minutes as number) || 0;
            updates.stretchingMinutes = Math.max(0, state.todayRecord.stretchingMinutes - minutes);
          }
        }
      });
    }

    switch (activity.type) {
      case 'water':
        updates.waterIntake = Math.max(0, state.todayRecord.waterIntake - 1);
        break;
      case 'posture_good':
      case 'posture_needs_adjustment':
        updates.postureRecords = state.todayRecord.postureRecords.slice(0, -1);
        break;
      case 'pain_record':
        updates.painRecords = state.todayRecord.painRecords.slice(0, -1);
        break;
      case 'screen_distance_record':
        updates.screenDistance = null;
        break;
      case 'fatigue_record':
        updates.fatigueScore = 0;
        break;
      case 'rest_start':
        if (!activity.groupId) {
          updates.restCount = Math.max(0, state.todayRecord.restCount - 1);
        }
        break;
      case 'eye_exercise_start':
        if (!activity.groupId) {
          const minutes = (activity.details?.minutes as number) || 0;
          updates.eyeExerciseMinutes = Math.max(0, state.todayRecord.eyeExerciseMinutes - minutes);
        }
        break;
      case 'stretching_start':
        if (!activity.groupId) {
          const minutes = (activity.details?.minutes as number) || 0;
          updates.stretchingMinutes = Math.max(0, state.todayRecord.stretchingMinutes - minutes);
        }
        break;
    }

    return {
      todayRecord: {
        ...state.todayRecord,
        ...updates,
        activityRecords: state.todayRecord.activityRecords.map(a =>
          activityIdsToUndo.includes(a.id) ? { ...a, undone: true } : a
        ),
      },
    };
  }),

  addReminderLog: (type, title, body, status, suppressedReason) => set((state) => {
    const log: ReminderLog = {
      id: generateId(),
      type,
      timestamp: Date.now(),
      title,
      body,
      status,
      suppressedReason,
    };
    return {
      todayRecord: {
        ...state.todayRecord,
        reminderLogs: [...state.todayRecord.reminderLogs, log],
      },
    };
  }),

  addPlanAdjustment: (adjustment) => set((state) => {
    const newAdjustment: PlanAdjustment = {
      ...adjustment,
      id: generateId(),
      date: getTodayString(),
      status: 'pending',
    };
    const updated = [...state.planAdjustments, newAdjustment];
    savePlanAdjustments(updated);
    return { planAdjustments: updated };
  }),

  applyPlanAdjustment: (adjustmentId) => set((state) => {
    const adjustment = state.planAdjustments.find(a => a.id === adjustmentId);
    if (!adjustment || adjustment.status !== 'pending') {
      return {};
    }

    let settingsUpdate: Partial<ReminderSettings> = {};
    switch (adjustment.type) {
      case 'pomodoro':
        if (adjustment.field === 'workMinutes') {
          settingsUpdate.pomodoro = {
            ...state.settings.pomodoro,
            workMinutes: adjustment.suggestedValue,
          };
        } else {
          settingsUpdate.pomodoro = {
            ...state.settings.pomodoro,
            restMinutes: adjustment.suggestedValue,
          };
        }
        break;
      case 'sedentary':
        settingsUpdate.sedentary = {
          ...state.settings.sedentary,
          thresholdMinutes: adjustment.suggestedValue,
        };
        break;
      case 'water':
        settingsUpdate.water = {
          ...state.settings.water,
          intervalMinutes: adjustment.suggestedValue,
        };
        break;
      case 'eye':
        settingsUpdate.eyeExercise = {
          ...state.settings.eyeExercise,
          intervalHours: adjustment.suggestedValue,
        };
        break;
      case 'stretch':
        settingsUpdate.stretching = {
          ...state.settings.stretching,
          intervalHours: adjustment.suggestedValue,
        };
        break;
    }

    const updatedSettings = { ...state.settings, ...settingsUpdate };
    saveSettings(updatedSettings);

    const updatedAdjustments = state.planAdjustments.map(a =>
      a.id === adjustmentId
        ? { ...a, status: 'applied' as const, appliedAt: Date.now(), appliedSettings: settingsUpdate }
        : a
    );
    savePlanAdjustments(updatedAdjustments);

    return {
      settings: updatedSettings,
      planAdjustments: updatedAdjustments,
    };
  }),

  dismissPlanAdjustment: (adjustmentId) => set((state) => {
    const updatedAdjustments = state.planAdjustments.map(a =>
      a.id === adjustmentId
        ? { ...a, status: 'dismissed' as const, dismissedAt: Date.now() }
        : a
    );
    savePlanAdjustments(updatedAdjustments);
    return { planAdjustments: updatedAdjustments };
  }),

  restoreDismissedAdjustment: (adjustmentId) => set((state) => {
    const updatedAdjustments = state.planAdjustments.map(a =>
      a.id === adjustmentId
        ? { ...a, status: 'pending' as const, dismissedAt: undefined }
        : a
    );
    savePlanAdjustments(updatedAdjustments);
    return { planAdjustments: updatedAdjustments };
  }),

  generatePlanSuggestions: () => {
    const state = get();
    const newSuggestions: PlanAdjustment[] = [];
    const recentRecords = state.historyRecords.slice(-7);

    if (recentRecords.length === 0) {
      return state.planAdjustments;
    }

    const existingPending = state.planAdjustments.filter(a => a.status === 'pending');
    const hasPending = (type: string, field: string) =>
      existingPending.some(a => a.type === type && a.field === field);

    const avgSedentary = recentRecords.reduce((sum, r) => sum + r.sedentaryMinutes, 0) / recentRecords.length;
    const avgFatigue = recentRecords.reduce((sum, r) => sum + r.fatigueScore, 0) / recentRecords.length;
    const avgWater = recentRecords.reduce((sum, r) => sum + r.waterIntake, 0) / recentRecords.length;
    const avgAbnormal = recentRecords.reduce((sum, r) => sum + (r.abnormalReminderCount || 0), 0) / recentRecords.length;
    const avgEye = recentRecords.reduce((sum, r) => sum + r.eyeExerciseMinutes, 0) / recentRecords.length;
    const avgStretch = recentRecords.reduce((sum, r) => sum + r.stretchingMinutes, 0) / recentRecords.length;

    if (avgSedentary > 180 && !hasPending('sedentary', 'thresholdMinutes')) {
      newSuggestions.push({
        id: generateId(),
        date: getTodayString(),
        type: 'sedentary',
        field: 'thresholdMinutes',
        currentValue: state.settings.sedentary.thresholdMinutes,
        suggestedValue: Math.max(25, state.settings.sedentary.thresholdMinutes - 10),
        reason: `平均每日久坐 ${Math.round(avgSedentary)} 分钟，建议缩短久坐提醒阈值`,
        status: 'pending',
      });
    }

    if (avgAbnormal > 2 && !hasPending('pomodoro', 'workMinutes')) {
      newSuggestions.push({
        id: generateId(),
        date: getTodayString(),
        type: 'pomodoro',
        field: 'workMinutes',
        currentValue: state.settings.pomodoro.workMinutes,
        suggestedValue: Math.max(20, state.settings.pomodoro.workMinutes - 5),
        reason: `本周平均异常提醒 ${avgAbnormal.toFixed(1)} 次，建议缩短番茄钟工作时长`,
        status: 'pending',
      });
    }

    if (avgWater < 5 && !hasPending('water', 'intervalMinutes')) {
      newSuggestions.push({
        id: generateId(),
        date: getTodayString(),
        type: 'water',
        field: 'intervalMinutes',
        currentValue: state.settings.water.intervalMinutes,
        suggestedValue: Math.max(30, state.settings.water.intervalMinutes - 15),
        reason: `平均每日饮水 ${avgWater.toFixed(1)} 杯，建议增加饮水提醒频率`,
        status: 'pending',
      });
    }

    if (avgEye < 10 && !hasPending('eye', 'intervalHours')) {
      newSuggestions.push({
        id: generateId(),
        date: getTodayString(),
        type: 'eye',
        field: 'intervalHours',
        currentValue: state.settings.eyeExercise.intervalHours,
        suggestedValue: Math.max(1, state.settings.eyeExercise.intervalHours - 1),
        reason: `平均每日眼保健操 ${avgEye.toFixed(1)} 分钟，建议增加眼保健操频率`,
        status: 'pending',
      });
    }

    if (avgStretch < 15 && !hasPending('stretch', 'intervalHours')) {
      newSuggestions.push({
        id: generateId(),
        date: getTodayString(),
        type: 'stretch',
        field: 'intervalHours',
        currentValue: state.settings.stretching.intervalHours,
        suggestedValue: Math.max(1, state.settings.stretching.intervalHours - 1),
        reason: `平均每日拉伸 ${avgStretch.toFixed(1)} 分钟，建议增加拉伸频率`,
        status: 'pending',
      });
    }

    if (avgFatigue > 6 && !hasPending('pomodoro', 'restMinutes')) {
      newSuggestions.push({
        id: generateId(),
        date: getTodayString(),
        type: 'pomodoro',
        field: 'restMinutes',
        currentValue: state.settings.pomodoro.restMinutes,
        suggestedValue: Math.min(10, state.settings.pomodoro.restMinutes + 2),
        reason: `平均疲劳评分 ${avgFatigue.toFixed(1)}，建议延长休息时长`,
        status: 'pending',
      });
    }

    const allAdjustments = [...state.planAdjustments, ...newSuggestions];
    savePlanAdjustments(allAdjustments);
    set({ planAdjustments: allAdjustments });
    return allAdjustments;
  },

  getTodayActivities: () => {
    const state = get();
    return state.todayRecord.activityRecords.filter(a => !a.undone).sort((a, b) => b.timestamp - a.timestamp);
  },

  getTodayReminderLogs: () => {
    const state = get();
    return [...state.todayRecord.reminderLogs].sort((a, b) => b.timestamp - a.timestamp);
  },

  getReminderLogsByRange: (daysBack) => {
    const state = get();
    return getReminderLogsByDateRange([...state.historyRecords, state.todayRecord], daysBack);
  },

  savePlanAdjustments: () => {
    const state = get();
    savePlanAdjustments(state.planAdjustments);
  },

  checkNotificationThrottle: (type) => {
    const now = Date.now();
    const state = get();
    const lastTick = state.lastNotificationTick[type] || 0;
    const minInterval = 60 * 1000;

    if (now - lastTick < minInterval) {
      return false;
    }

    set((state) => ({
      lastNotificationTick: {
        ...state.lastNotificationTick,
        [type]: now,
      },
    }));
    return true;
  },
}));

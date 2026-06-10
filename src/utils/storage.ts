import { DailyRecord, ReminderSettings } from '@/types';

const STORAGE_KEYS = {
  DAILY_RECORDS: 'health_manager_daily_records',
  SETTINGS: 'health_manager_settings',
};

export const loadSettings = (): ReminderSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return getDefaultSettings();
};

export const saveSettings = (settings: ReminderSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

export const loadDailyRecords = (): DailyRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_RECORDS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load records:', e);
  }
  return generateMockRecords(false);
};

export const saveDailyRecords = (records: DailyRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records:', e);
  }
};

export const getDefaultSettings = (): ReminderSettings => ({
  workHours: { start: '09:00', end: '18:00' },
  pomodoro: { workMinutes: 25, restMinutes: 5, enabled: true },
  sedentary: { thresholdMinutes: 45, enabled: true },
  water: { intervalMinutes: 60, enabled: true },
  blink: { intervalMinutes: 20, enabled: true },
  eyeExercise: { intervalHours: 2, enabled: true },
  stretching: { intervalHours: 1, enabled: true },
  abnormalReminder: { enabled: true, maxConsecutive: 3 },
  focusMode: { enabled: false, start: '14:00', end: '16:00', muteSound: true },
});

export const createEmptyDailyRecord = (date: string): DailyRecord => ({
  date,
  sedentaryMinutes: 0,
  restCount: 0,
  waterIntake: 0,
  blinkCount: 0,
  postureRecords: [],
  painRecords: [],
  eyeExerciseMinutes: 0,
  stretchingMinutes: 0,
  fatigueScore: 0,
  screenDistance: null,
  activityRecords: [],
  reminderLogs: [],
  abnormalReminderCount: 0,
});

const generateMockRecords = (includeToday: boolean = false): DailyRecord[] => {
  const records: DailyRecord[] = [];
  const today = new Date();
  const startDay = includeToday ? 6 : 1;
  for (let i = startDay; i >= 1; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const abnormalCount = Math.floor(Math.random() * 5);
    records.push({
      date: dateStr,
      sedentaryMinutes: Math.floor(Math.random() * 180) + 120,
      restCount: Math.floor(Math.random() * 8) + 3,
      waterIntake: Math.floor(Math.random() * 5) + 3,
      blinkCount: Math.floor(Math.random() * 50) + 30,
      postureRecords: [],
      painRecords: [],
      eyeExerciseMinutes: Math.floor(Math.random() * 10) + 5,
      stretchingMinutes: Math.floor(Math.random() * 15) + 5,
      fatigueScore: Math.floor(Math.random() * 5) + 3,
      screenDistance: 'normal',
      activityRecords: [],
      reminderLogs: [],
      abnormalReminderCount: abnormalCount,
    });
  }
  return records;
};

export const exportToCSV = (records: DailyRecord[]): string => {
  const headers = ['日期', '久坐时长(分钟)', '休息次数', '饮水量(杯)', '眨眼次数', '眼保健操(分钟)', '拉伸(分钟)', '疲劳评分', '异常提醒次数'];
  const rows = records.map(r => [
    r.date,
    r.sedentaryMinutes,
    r.restCount,
    r.waterIntake,
    r.blinkCount,
    r.eyeExerciseMinutes,
    r.stretchingMinutes,
    r.fatigueScore,
    r.abnormalReminderCount || 0,
  ]);
  
  const reminderHeaders = ['日期', '时间', '提醒类型', '标题', '内容', '状态', '压制原因'];
  const reminderRows: string[][] = [];
  records.forEach(r => {
    r.reminderLogs?.forEach(log => {
      const date = new Date(log.timestamp);
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      reminderRows.push([
        r.date,
        timeStr,
        log.type,
        `"${log.title}"`,
        `"${log.body}"`,
        log.status,
        log.suppressedReason || '',
      ]);
    });
  });
  
  let csvContent = '\ufeff';
  csvContent += '=== 每日健康数据 ===\n';
  csvContent += [headers, ...rows].map(row => row.join(',')).join('\n');
  
  if (reminderRows.length > 0) {
    csvContent += '\n\n=== 提醒记录 ===\n';
    csvContent += [reminderHeaders, ...reminderRows].map(row => row.join(',')).join('\n');
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `健康数据_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  return csvContent;
};

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { isInTimeRange } from '@/utils/dateUtils';

type ReminderType = 'sedentary' | 'water' | 'blink' | 'eye' | 'stretch' | 'pomodoro';

interface ReminderState {
  lastTriggered: Record<ReminderType, number>;
  lastSedentaryUpdate: number;
  workStartTime: number | null;
}

export const useReminder = () => {
  const {
    settings,
    isWorking,
    consecutiveAbnormalCount,
    incrementSedentaryMinutes,
    incrementAbnormalCount,
    resetAbnormalCount,
  } = useAppStore();

  const reminderState = useRef<ReminderState>({
    lastTriggered: {
      sedentary: 0,
      water: 0,
      blink: 0,
      eye: 0,
      stretch: 0,
      pomodoro: 0,
    },
    lastSedentaryUpdate: Date.now(),
    workStartTime: null,
  });

  const showNotification = useCallback(async (title: string, body: string) => {
    if (settings.focusMode.enabled) {
      const isInFocusTime = isInTimeRange(settings.focusMode.start, settings.focusMode.end);
      if (isInFocusTime && settings.focusMode.muteSound) {
        console.log('[专注模式] 通知已压制:', title);
        return;
      }
    }
    
    console.log('[提醒] 显示通知:', title);
    if (window.electronAPI) {
      await window.electronAPI.showNotification(title, body);
    } else {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    }
  }, [settings.focusMode]);

  const shouldTrigger = useCallback((type: ReminderType, intervalMs: number): boolean => {
    const now = Date.now();
    const last = reminderState.current.lastTriggered[type];
    const workStart = reminderState.current.workStartTime;
    
    if (workStart && now - workStart < 5000) {
      return false;
    }
    
    if (last === 0 && workStart) {
      reminderState.current.lastTriggered[type] = now;
      return false;
    }
    
    if (now - last >= intervalMs) {
      reminderState.current.lastTriggered[type] = now;
      return true;
    }
    return false;
  }, []);

  const checkReminders = useCallback(() => {
    if (!isWorking) return;
    if (!isInTimeRange(settings.workHours.start, settings.workHours.end)) return;

    if (settings.sedentary.enabled) {
      const intervalMs = settings.sedentary.thresholdMinutes * 60 * 1000;
      if (shouldTrigger('sedentary', intervalMs)) {
        const isAbnormal = settings.abnormalReminder.enabled &&
          consecutiveAbnormalCount >= settings.abnormalReminder.maxConsecutive;
        const isSevere = consecutiveAbnormalCount >= settings.abnormalReminder.maxConsecutive + 2;
        
        if (isSevere) {
          showNotification(
            '🚨 紧急健康提醒',
            `您已经连续${consecutiveAbnormalCount}次忽略提醒！请立即起身活动，否则可能对健康造成严重损害！`
          );
        } else if (isAbnormal) {
          showNotification(
            '⚠️ 连续久坐警告',
            `您已经连续${consecutiveAbnormalCount}次忽略久坐提醒，请立即起身活动！`
          );
        } else {
          showNotification(
            '久坐提醒',
            `您已连续工作${settings.sedentary.thresholdMinutes}分钟，起身活动一下吧！`
          );
        }
        
        incrementAbnormalCount();
        console.log('[异常计数] 递增为:', consecutiveAbnormalCount + 1);
      }
    }

    if (settings.water.enabled) {
      const intervalMs = settings.water.intervalMinutes * 60 * 1000;
      if (shouldTrigger('water', intervalMs)) {
        showNotification('💧 饮水提醒', '该喝水了，保持身体水分充足！');
      }
    }

    if (settings.blink.enabled) {
      const intervalMs = settings.blink.intervalMinutes * 60 * 1000;
      if (shouldTrigger('blink', intervalMs)) {
        showNotification('👁️ 眨眼提示', '眨眼20次，放松眼睛！');
      }
    }

    if (settings.eyeExercise.enabled) {
      const intervalMs = settings.eyeExercise.intervalHours * 60 * 60 * 1000;
      if (shouldTrigger('eye', intervalMs)) {
        showNotification('👀 护眼提醒', '该做眼保健操了，保护视力！');
      }
    }

    if (settings.stretching.enabled) {
      const intervalMs = settings.stretching.intervalHours * 60 * 60 * 1000;
      if (shouldTrigger('stretch', intervalMs)) {
        showNotification('🧘 拉伸提醒', '拉伸一下颈肩和手腕，缓解疲劳！');
      }
    }
  }, [isWorking, settings, consecutiveAbnormalCount, shouldTrigger, showNotification, incrementAbnormalCount]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    let sedentaryInterval: ReturnType<typeof setInterval> | null = null;
    let reminderInterval: ReturnType<typeof setInterval> | null = null;

    if (isWorking) {
      const now = Date.now();
      reminderState.current.workStartTime = now;
      reminderState.current.lastSedentaryUpdate = now;
      
      console.log('[工作开始] 初始化提醒时间戳');
      
      sedentaryInterval = setInterval(() => {
        const currentTime = Date.now();
        const timeDiff = currentTime - reminderState.current.lastSedentaryUpdate;
        const minutesPassed = Math.floor(timeDiff / 60000);
        
        if (minutesPassed >= 1) {
          for (let i = 0; i < minutesPassed; i++) {
            incrementSedentaryMinutes();
          }
          reminderState.current.lastSedentaryUpdate = currentTime;
          console.log('[久坐计时] 增加', minutesPassed, '分钟');
        }
      }, 5000);

      reminderInterval = setInterval(() => {
        checkReminders();
      }, 15000);
    } else {
      reminderState.current.workStartTime = null;
    }

    return () => {
      if (sedentaryInterval) clearInterval(sedentaryInterval);
      if (reminderInterval) clearInterval(reminderInterval);
    };
  }, [isWorking, checkReminders, incrementSedentaryMinutes]);

  const triggerRestReminder = useCallback(() => {
    showNotification('☕ 休息时间', '番茄时间结束，休息5分钟吧！');
    resetAbnormalCount();
  }, [showNotification, resetAbnormalCount]);

  return { triggerRestReminder };
};

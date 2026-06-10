import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { isInTimeRange } from '@/utils/dateUtils';
import type { ReminderType, ReminderLog } from '@/types';

interface ReminderState {
  lastTriggered: Record<ReminderType, number>;
  lastSedentaryUpdate: number;
  workStartTime: number | null;
  lastMinuteTick: number;
}

export const useReminder = () => {
  const {
    settings,
    isWorking,
    consecutiveAbnormalCount,
    lastMinuteTick,
    incrementSedentaryMinutes,
    incrementAbnormalCount,
    resetAbnormalCount,
    addReminderLog,
    setCurrentView,
    checkNotificationThrottle,
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
    lastMinuteTick: Math.floor(Date.now() / 60000),
  });

  const showNotification = useCallback(async (type: ReminderType, title: string, body: string) => {
    if (!checkNotificationThrottle(type)) {
      console.log('[提醒节流] 同一分钟内已提醒过，跳过:', type);
      return;
    }

    if (settings.focusMode.enabled) {
      const isInFocusTime = isInTimeRange(settings.focusMode.start, settings.focusMode.end);
      if (isInFocusTime && settings.focusMode.muteSound) {
        console.log('[专注模式] 通知已压制:', title);
        addReminderLog(type, title, body, 'suppressed', 'focus_mode');
        return;
      }
    }
    
    if (!isWorking) {
      addReminderLog(type, title, body, 'suppressed', 'not_working');
      return;
    }
    
    console.log('[提醒] 显示通知:', title);
    addReminderLog(type, title, body, 'shown');
    
    if (window.electronAPI) {
      await window.electronAPI.showNotification(title, body);
    } else {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    }
  }, [settings.focusMode, isWorking, addReminderLog, checkNotificationThrottle]);

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
            'sedentary',
            '🚨 紧急健康提醒',
            `您已经连续${consecutiveAbnormalCount}次忽略提醒！请立即起身活动，否则可能对健康造成严重损害！`
          );
        } else if (isAbnormal) {
          showNotification(
            'sedentary',
            '⚠️ 连续久坐警告',
            `您已经连续${consecutiveAbnormalCount}次忽略久坐提醒，请立即起身活动！`
          );
        } else {
          showNotification(
            'sedentary',
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
        showNotification('water', '💧 饮水提醒', '该喝水了，保持身体水分充足！');
      }
    }

    if (settings.blink.enabled) {
      const intervalMs = settings.blink.intervalMinutes * 60 * 1000;
      if (shouldTrigger('blink', intervalMs)) {
        showNotification('blink', '👁️ 眨眼提示', '眨眼20次，放松眼睛！');
      }
    }

    if (settings.eyeExercise.enabled) {
      const intervalMs = settings.eyeExercise.intervalHours * 60 * 60 * 1000;
      if (shouldTrigger('eye', intervalMs)) {
        showNotification('eye', '👀 护眼提醒', '该做眼保健操了，保护视力！');
      }
    }

    if (settings.stretching.enabled) {
      const intervalMs = settings.stretching.intervalHours * 60 * 60 * 1000;
      if (shouldTrigger('stretch', intervalMs)) {
        showNotification('stretch', '🧘 拉伸提醒', '拉伸一下颈肩和手腕，缓解疲劳！');
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
      reminderState.current.lastMinuteTick = Math.floor(now / 60000);
      
      console.log('[工作开始] 初始化提醒时间戳');
      
      sedentaryInterval = setInterval(() => {
        const currentTime = Date.now();
        const currentMinute = Math.floor(currentTime / 60000);
        const lastTick = reminderState.current.lastMinuteTick;
        
        if (currentMinute > lastTick) {
          const minutesPassed = currentMinute - lastTick;
          for (let i = 0; i < minutesPassed; i++) {
            incrementSedentaryMinutes(currentMinute - minutesPassed + 1 + i);
          }
          reminderState.current.lastMinuteTick = currentMinute;
          console.log('[久坐计时] 增加', minutesPassed, '分钟');
        }
      }, 2000);

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
    showNotification('pomodoro', '☕ 休息时间', '番茄时间结束，休息5分钟吧！');
    resetAbnormalCount();
  }, [showNotification, resetAbnormalCount]);

  return { triggerRestReminder };
};

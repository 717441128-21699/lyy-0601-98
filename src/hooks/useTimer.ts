import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface PomodoroState {
  isRunning: boolean;
  isPaused: boolean;
  isWorkPhase: boolean;
  remainingSeconds: number;
  completedCycles: number;
}

export const usePomodoroTimer = () => {
  const { settings, startWorking, stopWorking, incrementRestCount, addStretchingMinutes } = useAppStore();
  
  const [state, setState] = useState<PomodoroState>({
    isRunning: false,
    isPaused: false,
    isWorkPhase: true,
    remainingSeconds: settings.pomodoro.workMinutes * 60,
    completedCycles: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.remainingSeconds <= 1) {
        if (prev.isWorkPhase) {
          incrementRestCount();
          return {
            ...prev,
            isWorkPhase: false,
            remainingSeconds: settings.pomodoro.restMinutes * 60,
          };
        } else {
          addStretchingMinutes(Math.floor(settings.pomodoro.restMinutes / 2));
          return {
            ...prev,
            isWorkPhase: true,
            remainingSeconds: settings.pomodoro.workMinutes * 60,
            completedCycles: prev.completedCycles + 1,
          };
        }
      }
      return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
    });
  }, [settings.pomodoro, incrementRestCount, addStretchingMinutes]);

  const start = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));
    startWorking();
  }, [startWorking]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isRunning: false,
      isPaused: false,
      isWorkPhase: true,
      remainingSeconds: settings.pomodoro.workMinutes * 60,
      completedCycles: 0,
    });
    stopWorking();
  }, [settings.pomodoro.workMinutes, stopWorking]);

  const skipPhase = useCallback(() => {
    if (state.isWorkPhase) {
      incrementRestCount();
      setState(prev => ({
        ...prev,
        isWorkPhase: false,
        remainingSeconds: settings.pomodoro.restMinutes * 60,
      }));
    } else {
      addStretchingMinutes(Math.floor(settings.pomodoro.restMinutes / 2));
      setState(prev => ({
        ...prev,
        isWorkPhase: true,
        remainingSeconds: settings.pomodoro.workMinutes * 60,
        completedCycles: prev.completedCycles + 1,
      }));
    }
  }, [state.isWorkPhase, settings.pomodoro, incrementRestCount, addStretchingMinutes]);

  useEffect(() => {
    if (state.isRunning && !state.isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.isPaused, tick]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      remainingSeconds: prev.isWorkPhase
        ? settings.pomodoro.workMinutes * 60
        : settings.pomodoro.restMinutes * 60,
    }));
  }, [settings.pomodoro.workMinutes, settings.pomodoro.restMinutes]);

  return {
    ...state,
    start,
    pause,
    resume,
    reset,
    skipPhase,
    totalMinutes: state.isWorkPhase ? settings.pomodoro.workMinutes : settings.pomodoro.restMinutes,
  };
};

export const useCountdownTimer = (initialSeconds: number, onComplete?: () => void) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTriggeredComplete = useRef(false);

  const start = useCallback(() => {
    hasTriggeredComplete.current = false;
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    hasTriggeredComplete.current = false;
    setIsActive(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const resetWithNewDuration = useCallback((newDuration: number, autoStart: boolean = false) => {
    hasTriggeredComplete.current = false;
    setSeconds(newDuration);
    setIsActive(autoStart);
  }, []);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive && !hasTriggeredComplete.current) {
      hasTriggeredComplete.current = true;
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeout(() => {
        onComplete?.();
      }, 50);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds, onComplete]);

  return { seconds, isActive, start, pause, reset, resetWithNewDuration };
};

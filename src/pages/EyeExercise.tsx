import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useCountdownTimer } from '@/hooks/useTimer';
import { ProgressRing } from '@/components/ProgressRing';
import { BreathingIndicator } from '@/components/BreathingIndicator';
import { AnimationFigure } from '@/components/AnimationFigure';
import { eyeExerciseSteps } from '@/constants/exercises';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { formatCountdown } from '@/utils/dateUtils';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Eye,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const EyeExercise: React.FC = () => {
  const { settings, updateSettings, addEyeExerciseMinutes, todayRecord } = useAppStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentStep = eyeExerciseSteps[currentStepIndex];
  const totalDuration = eyeExerciseSteps.reduce((sum, s) => sum + s.duration, 0);

  const handleComplete = useCallback(() => {
    if (currentStepIndex < eyeExerciseSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      addEyeExerciseMinutes(Math.ceil(totalDuration / 60));
      setIsStarted(false);
    }
  }, [currentStepIndex, totalDuration, addEyeExerciseMinutes]);

  const timer = useCountdownTimer(currentStep?.duration || 0, handleComplete);

  const progress = ((currentStep.duration - timer.seconds) / currentStep.duration) * 100;
  const overallProgress = ((currentStepIndex * currentStep.duration + (currentStep.duration - timer.seconds)) / totalDuration) * 100;

  const startExercise = () => {
    setIsStarted(true);
    timer.start();
  };

  const pauseExercise = () => {
    timer.pause();
  };

  const resumeExercise = () => {
    timer.start();
  };

  const skipStep = () => {
    if (currentStepIndex < eyeExerciseSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      timer.reset();
    }
  };

  const resetExercise = () => {
    setCurrentStepIndex(0);
    setIsStarted(false);
    timer.reset();
  };

  const getAnimationType = () => {
    switch (currentStep.animationType) {
      case 'eye-roll': return 'eye-blink';
      case 'blink': return 'eye-blink';
      default: return 'eye-blink';
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 mb-1">眼保健操</h2>
        <p className="text-ink-400">保护视力，缓解眼疲劳</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="card lg:col-span-2 text-center animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <span className="text-sm text-primary-500 font-medium">
                {currentStepIndex + 1} / {eyeExerciseSteps.length}
              </span>
              <h3 className="text-xl font-bold text-ink-700">{currentStep.name}</h3>
              <p className="text-sm text-ink-400">{currentStep.description}</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-3 rounded-xl bg-warm-100 hover:bg-warm-200 transition-colors"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          <div className="relative mb-6">
            <AnimationFigure type="eye" action={getAnimationType()} isActive={isStarted && timer.isActive} />
            
            <AnimatePresence>
              {isStarted && (
                <motion.div
                  className="absolute top-4 right-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <BreathingIndicator size={80} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <ProgressRing
              progress={progress}
              size={160}
              strokeWidth={12}
              color="#4ECDC4"
              bgColor="#E8F8F6"
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-ink-700">
                  {formatCountdown(timer.seconds)}
                </p>
                <p className="text-xs text-ink-400">本步骤剩余</p>
              </div>
            </ProgressRing>

            <div className="text-left">
              <p className="text-sm text-ink-400 mb-1">总体进度</p>
              <div className="w-40 h-3 bg-warm-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                  style={{ width: `${overallProgress}%` }}
                  animate={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="text-xs text-ink-500 mt-1">{Math.round(overallProgress)}% 完成</p>
              <p className="text-xs text-ink-400 mt-2">
                今日已做: {todayRecord.eyeExerciseMinutes} 分钟
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isStarted ? (
              <button onClick={startExercise} className="btn-primary flex items-center gap-2">
                <Play size={20} />
                开始眼保健操
              </button>
            ) : timer.isActive ? (
              <>
                <button onClick={pauseExercise} className="btn-secondary flex items-center gap-2">
                  <Pause size={20} />
                  暂停
                </button>
                <button onClick={skipStep} className="btn-secondary flex items-center gap-2">
                  <SkipForward size={20} />
                  跳过
                </button>
              </>
            ) : (
              <>
                <button onClick={resumeExercise} className="btn-primary flex items-center gap-2">
                  <Play size={20} />
                  继续
                </button>
                <button onClick={resetExercise} className="btn-secondary flex items-center gap-2">
                  <RotateCcw size={20} />
                  重新开始
                </button>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-primary-500" />
            全部步骤
          </h3>

          <div className="space-y-2">
            {eyeExerciseSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  index === currentStepIndex
                    ? 'bg-primary-50 border-2 border-primary-400'
                    : index < currentStepIndex
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-warm-100 border border-transparent'
                }`}
                onClick={() => {
                  if (!isStarted) {
                    setCurrentStepIndex(index);
                  }
                }}
                whileHover={!isStarted ? { scale: 1.02 } : {}}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === currentStepIndex
                        ? 'bg-primary-400 text-white'
                        : index < currentStepIndex
                        ? 'bg-green-400 text-white'
                        : 'bg-warm-200 text-ink-500'
                    }`}
                  >
                    {index < currentStepIndex ? '✓' : index + 1}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${index === currentStepIndex ? 'text-primary-600' : 'text-ink-600'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-ink-400">{step.duration}秒</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-warm-100 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-ink-600">眨眼提醒</span>
              <ToggleSwitch
                checked={settings.blink.enabled}
                onChange={(v) => updateSettings({ blink: { ...settings.blink, enabled: v } })}
              />
            </div>
            <label className="block text-sm text-ink-500 mb-2">
              提醒间隔: {settings.blink.intervalMinutes} 分钟
            </label>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={settings.blink.intervalMinutes}
              onChange={(e) => updateSettings({
                blink: { ...settings.blink, intervalMinutes: Number(e.target.value) }
              })}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-400"
            />
          </div>

          <div className="mt-4 p-4 bg-primary-50 rounded-2xl">
            <h4 className="font-medium text-primary-700 mb-2">💡 护眼小贴士</h4>
            <ul className="text-xs text-primary-600 space-y-1">
              <li>• 多眨眼，保持眼睛湿润</li>
              <li>• 遵循20-20-20法则</li>
              <li>• 保持室内光线柔和</li>
              <li>• 定期检查视力</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

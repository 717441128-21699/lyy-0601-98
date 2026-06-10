import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useCountdownTimer } from '@/hooks/useTimer';
import { ProgressRing } from '@/components/ProgressRing';
import { BreathingIndicator } from '@/components/BreathingIndicator';
import { AnimationFigure } from '@/components/AnimationFigure';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { formatCountdown } from '@/utils/dateUtils';
import { stretchActions } from '@/constants/exercises';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Dumbbell,
  ChevronRight,
  ListChecks,
} from 'lucide-react';
import type { StretchAction } from '@/types';

export const Stretching: React.FC = () => {
  const { settings, updateSettings, addStretchingMinutes, todayRecord, addActivity } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'neck' | 'shoulder' | 'wrist' | 'back'>('all');
  const [currentAction, setCurrentAction] = useState<StretchAction | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const stretchGroupIdRef = useRef<string | null>(null);

  const filteredActions = selectedCategory === 'all'
    ? stretchActions
    : stretchActions.filter(a => a.category === selectedCategory);

  const handleComplete = useCallback(() => {
    if (currentAction) {
      setCompletedActions(prev => [...prev, currentAction.id]);
      const minutes = Math.ceil(currentAction.duration / 60);
      addStretchingMinutes(minutes);
      if (stretchGroupIdRef.current) {
        addActivity('stretching_complete', { minutes, action: currentAction.name, category: currentAction.category }, true, stretchGroupIdRef.current);
        stretchGroupIdRef.current = null;
      }
      const currentIndex = filteredActions.findIndex(a => a.id === currentAction.id);
      if (currentIndex < filteredActions.length - 1) {
        const nextAction = filteredActions[currentIndex + 1];
        setCurrentAction(nextAction);
        setTimeout(() => {
          timer.resetWithNewDuration(nextAction.duration, true);
        }, 100);
      } else {
        setIsStarted(false);
      }
    }
  }, [currentAction, filteredActions, addStretchingMinutes, addActivity]);

  const timer = useCountdownTimer(currentAction?.duration || 0, handleComplete);

  React.useEffect(() => {
    if (isStarted && currentAction) {
      timer.resetWithNewDuration(currentAction.duration, timer.isActive);
    }
  }, [currentAction]);

  const progress = currentAction
    ? ((currentAction.duration - timer.seconds) / currentAction.duration) * 100
    : 0;

  const categoryLabels: Record<string, string> = {
    all: '全部',
    neck: '颈部',
    shoulder: '肩部',
    wrist: '手腕',
    back: '背部',
  };

  const getAnimationAction = (action: StretchAction) => {
    switch (action.category) {
      case 'neck': return 'neck-turn';
      case 'shoulder': return 'shoulder-shrug';
      case 'wrist': return 'wrist-roll';
      case 'back': return 'back-stretch';
      default: return 'neck-turn';
    }
  };

  const startStretching = (action: StretchAction) => {
    const groupId = `stretch-${Date.now()}`;
    stretchGroupIdRef.current = groupId;
    addActivity('stretching_start', { action: action.name, category: action.category, duration: action.duration }, true, groupId);
    setCurrentAction(action);
    setIsStarted(true);
    timer.resetWithNewDuration(action.duration, true);
  };

  const pauseStretching = () => {
    timer.pause();
  };

  const resumeStretching = () => {
    timer.start();
  };

  const skipAction = () => {
    if (currentAction) {
      const currentIndex = filteredActions.findIndex(a => a.id === currentAction.id);
      if (currentIndex < filteredActions.length - 1) {
        const nextAction = filteredActions[currentIndex + 1];
        setCurrentAction(nextAction);
        timer.resetWithNewDuration(nextAction.duration, timer.isActive);
      }
    }
  };

  const resetStretching = () => {
    setCurrentAction(null);
    setIsStarted(false);
    setCompletedActions([]);
    timer.reset();
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 mb-1">拉伸动作</h2>
        <p className="text-ink-400">缓解肌肉紧张，预防职业病</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setSelectedCategory(key as typeof selectedCategory);
              setCurrentAction(null);
              setIsStarted(false);
            }}
            className={`tab-button flex-shrink-0 ${selectedCategory === key ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="card lg:col-span-2 animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!currentAction ? (
            <div>
              <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
                <ListChecks size={20} className="text-primary-500" />
                选择拉伸动作
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    onClick={() => startStretching(action)}
                    className="p-4 bg-warm-100 hover:bg-warm-200 rounded-2xl transition-all text-left group"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-ink-700">{action.name}</p>
                        <p className="text-sm text-ink-400">{action.duration}秒</p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-ink-300 group-hover:text-primary-500 transition-colors"
                      />
                    </div>
                    {completedActions.includes(action.id) && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">
                        ✓ 已完成
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                    style={{
                      backgroundColor: currentAction.category === 'neck' ? '#E8F8F6' :
                        currentAction.category === 'shoulder' ? '#FFF0F0' :
                        currentAction.category === 'wrist' ? '#EAEDEF' : '#FDFCFA',
                      color: currentAction.category === 'neck' ? '#3DB8AF' :
                        currentAction.category === 'shoulder' ? '#FF6B6B' :
                        currentAction.category === 'wrist' ? '#2C3E50' : '#75D5C9',
                    }}
                  >
                    {categoryLabels[currentAction.category]}
                  </span>
                  <h3 className="text-xl font-bold text-ink-700">{currentAction.name}</h3>
                  <p className="text-sm text-ink-400">{currentAction.description}</p>
                </div>
              </div>

              <div className="relative mb-6">
                <AnimationFigure
                  type={currentAction.category}
                  action={getAnimationAction(currentAction)}
                  isActive={isStarted && timer.isActive}
                />
                {isStarted && (
                  <div className="absolute top-4 right-4">
                    <BreathingIndicator size={80} />
                  </div>
                )}
              </div>

              <div className="mb-6 p-4 bg-warm-100 rounded-2xl text-left">
                <h4 className="font-medium text-ink-700 mb-2">动作步骤</h4>
                <ol className="space-y-1 text-sm text-ink-500">
                  {currentAction.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary-400 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-center gap-8 mb-6">
                <ProgressRing
                  progress={progress}
                  size={140}
                  strokeWidth={10}
                  color="#FF6B6B"
                  bgColor="#FFF0F0"
                >
                  <div className="text-center">
                    <p className="text-3xl font-bold text-ink-700">
                      {formatCountdown(timer.seconds)}
                    </p>
                    <p className="text-xs text-ink-400">剩余时间</p>
                  </div>
                </ProgressRing>

                <div className="text-left">
                  <p className="text-sm text-ink-400 mb-1">今日拉伸</p>
                  <p className="text-2xl font-bold text-ink-700">
                    {todayRecord.stretchingMinutes} <span className="text-sm font-normal text-ink-400">分钟</span>
                  </p>
                  <p className="text-xs text-ink-400 mt-1">
                    已完成 {completedActions.length} / {filteredActions.length} 个动作
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                {timer.isActive ? (
                  <>
                    <button onClick={pauseStretching} className="btn-secondary flex items-center gap-2">
                      <Pause size={20} />
                      暂停
                    </button>
                    <button onClick={skipAction} className="btn-secondary flex items-center gap-2">
                      <SkipForward size={20} />
                      跳过
                    </button>
                  </>
                ) : isStarted ? (
                  <>
                    <button onClick={resumeStretching} className="btn-primary flex items-center gap-2">
                      <Play size={20} />
                      继续
                    </button>
                    <button onClick={resetStretching} className="btn-secondary flex items-center gap-2">
                      <RotateCcw size={20} />
                      返回列表
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Dumbbell size={20} className="text-accent-500" />
            拉伸提醒设置
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-ink-600">拉伸提醒</span>
                <ToggleSwitch
                  checked={settings.stretching.enabled}
                  onChange={(v) => updateSettings({ stretching: { ...settings.stretching, enabled: v } })}
                />
              </div>
              <label className="block text-sm text-ink-500 mb-2">
                提醒间隔: {settings.stretching.intervalHours} 小时
              </label>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={settings.stretching.intervalHours}
                onChange={(e) => updateSettings({
                  stretching: { ...settings.stretching, intervalHours: Number(e.target.value) }
                })}
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-accent-400"
              />
              <div className="flex justify-between text-xs text-ink-400 mt-1">
                <span>30分钟</span>
                <span>4小时</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-ink-600">眼保健操提醒</span>
                <ToggleSwitch
                  checked={settings.eyeExercise.enabled}
                  onChange={(v) => updateSettings({ eyeExercise: { ...settings.eyeExercise, enabled: v } })}
                />
              </div>
              <label className="block text-sm text-ink-500 mb-2">
                提醒间隔: {settings.eyeExercise.intervalHours} 小时
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={settings.eyeExercise.intervalHours}
                onChange={(e) => updateSettings({
                  eyeExercise: { ...settings.eyeExercise, intervalHours: Number(e.target.value) }
                })}
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-400"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-accent-50 rounded-2xl">
            <h4 className="font-medium text-accent-700 mb-2">💡 健康建议</h4>
            <ul className="text-xs text-accent-600 space-y-1">
              <li>• 每小时至少活动一次</li>
              <li>• 拉伸时保持呼吸平稳</li>
              <li>• 动作要缓慢，避免拉伤</li>
              <li>• 感到疼痛立即停止</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

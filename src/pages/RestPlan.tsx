import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { usePomodoroTimer } from '@/hooks/useTimer';
import { ProgressRing } from '@/components/ProgressRing';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { formatCountdown } from '@/utils/dateUtils';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Coffee,
  Droplets,
  Timer,
  Settings,
} from 'lucide-react';

export const RestPlan: React.FC = () => {
  const { settings, updateSettings, addWaterIntake, todayRecord } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pomodoro' | 'schedule' | 'water'>('pomodoro');

  const pomodoro = usePomodoroTimer();

  const pomodoroProgress = ((pomodoro.totalMinutes * 60 - pomodoro.remainingSeconds) / (pomodoro.totalMinutes * 60)) * 100;

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 mb-1">休息计划</h2>
        <p className="text-ink-400">科学规划休息时间，保持高效工作状态</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'pomodoro', label: '番茄钟', icon: <Timer size={18} /> },
          { id: 'schedule', label: '工作时段', icon: <Clock size={18} /> },
          { id: 'water', label: '饮水提醒', icon: <Droplets size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`tab-button flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pomodoro' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            className="card text-center animate-slide-up"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: pomodoro.isWorkPhase ? '#E8F8F6' : '#FFF0F0' }}
            >
              {pomodoro.isWorkPhase ? (
                <><Timer size={16} className="text-primary-500" /><span className="text-primary-600 font-medium">工作时间</span></>
              ) : (
                <><Coffee size={16} className="text-accent-500" /><span className="text-accent-600 font-medium">休息时间</span></>
              )}
            </div>

            <div className="mb-6">
              <ProgressRing
                progress={pomodoroProgress}
                size={260}
                strokeWidth={16}
                color={pomodoro.isWorkPhase ? '#4ECDC4' : '#FF6B6B'}
                bgColor={pomodoro.isWorkPhase ? '#E8F8F6' : '#FFF0F0'}
              >
                <div className="text-center">
                  <p className="text-5xl font-bold text-ink-700 tracking-wider">
                    {formatCountdown(pomodoro.remainingSeconds)}
                  </p>
                  <p className="text-ink-400 mt-2">
                    已完成 {pomodoro.completedCycles} 个番茄钟
                  </p>
                </div>
              </ProgressRing>
            </div>

            <div className="flex items-center justify-center gap-3">
              {!pomodoro.isRunning ? (
                <button onClick={pomodoro.start} className="btn-primary flex items-center gap-2">
                  <Play size={20} />
                  开始
                </button>
              ) : pomodoro.isPaused ? (
                <button onClick={pomodoro.resume} className="btn-primary flex items-center gap-2">
                  <Play size={20} />
                  继续
                </button>
              ) : (
                <button onClick={pomodoro.pause} className="btn-secondary flex items-center gap-2">
                  <Pause size={20} />
                  暂停
                </button>
              )}
              <button onClick={pomodoro.skipPhase} className="btn-secondary flex items-center gap-2">
                <SkipForward size={20} />
                跳过
              </button>
              <button onClick={pomodoro.reset} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={20} />
                重置
              </button>
            </div>
          </motion.div>

          <motion.div
            className="card animate-slide-up"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-primary-500" />
              番茄钟设置
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-ink-600">启用番茄钟</span>
                  <ToggleSwitch
                    checked={settings.pomodoro.enabled}
                    onChange={(v) => updateSettings({ pomodoro: { ...settings.pomodoro, enabled: v } })}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink-600 mb-2">
                  工作时长: {settings.pomodoro.workMinutes} 分钟
                </label>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={settings.pomodoro.workMinutes}
                  onChange={(e) => updateSettings({
                    pomodoro: { ...settings.pomodoro, workMinutes: Number(e.target.value) }
                  })}
                  className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-400"
                />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>15分钟</span>
                  <span>60分钟</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-ink-600 mb-2">
                  休息时长: {settings.pomodoro.restMinutes} 分钟
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="1"
                  value={settings.pomodoro.restMinutes}
                  onChange={(e) => updateSettings({
                    pomodoro: { ...settings.pomodoro, restMinutes: Number(e.target.value) }
                  })}
                  className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-accent-400"
                />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>3分钟</span>
                  <span>15分钟</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-ink-600">久坐提醒</span>
                  <ToggleSwitch
                    checked={settings.sedentary.enabled}
                    onChange={(v) => updateSettings({ sedentary: { ...settings.sedentary, enabled: v } })}
                  />
                </div>
                <label className="block text-sm text-ink-500 mb-2">
                  提醒阈值: {settings.sedentary.thresholdMinutes} 分钟
                </label>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="5"
                  value={settings.sedentary.thresholdMinutes}
                  onChange={(e) => updateSettings({
                    sedentary: { ...settings.sedentary, thresholdMinutes: Number(e.target.value) }
                  })}
                  className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-400"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-primary-500" />
            工作时段设置
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-ink-600 mb-2">上班时间</label>
              <input
                type="time"
                value={settings.workHours.start}
                onChange={(e) => updateSettings({
                  workHours: { ...settings.workHours, start: e.target.value }
                })}
                className="input-field text-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-ink-600 mb-2">下班时间</label>
              <input
                type="time"
                value={settings.workHours.end}
                onChange={(e) => updateSettings({
                  workHours: { ...settings.workHours, end: e.target.value }
                })}
                className="input-field text-lg"
              />
            </div>
          </div>

          <div className="mt-8 p-6 bg-warm-100 rounded-2xl">
            <h4 className="font-bold text-ink-700 mb-4">今日时间轴</h4>
            <div className="relative h-16 bg-warm-200 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-gradient-to-r from-primary-400 to-primary-300 rounded-full"
                style={{
                  left: `${(parseInt(settings.workHours.start) / 24) * 100}%`,
                  width: `${((parseInt(settings.workHours.end) - parseInt(settings.workHours.start)) / 24) * 100}%`,
                }}
              />
              <div
                className="absolute top-0 w-1 h-full bg-accent-500"
                style={{ left: `${(new Date().getHours() / 24) * 100}%` }}
              >
                <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-accent-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-ink-400">
              {[0, 6, 12, 18, 24].map(hour => (
                <span key={hour}>{String(hour).padStart(2, '0')}:00</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'water' && (
        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-ink-700 flex items-center gap-2">
              <Droplets size={20} className="text-primary-500" />
              饮水管理
            </h3>
            <button onClick={addWaterIntake} className="btn-primary btn-sm flex items-center gap-2">
              <Droplets size={16} />
              记录一杯
            </button>
          </div>

          <div className="grid grid-cols-8 gap-3 mb-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${i < todayRecord.waterIntake ? 'bg-primary-400 shadow-glow' : 'bg-warm-200'}`}
                whileHover={{ scale: 1.05 }}
                animate={i < todayRecord.waterIntake ? { scale: [1, 1.1, 1] } : {}}
                transition={{ delay: i * 0.1 }}
              >
                <Droplets
                  size={24}
                  className={i < todayRecord.waterIntake ? 'text-white' : 'text-ink-300'}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-center text-ink-500 mb-6">
            今日已喝 <span className="text-primary-500 font-bold">{todayRecord.waterIntake}</span> / 8 杯
          </p>

          <div className="p-4 bg-warm-100 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-ink-600">饮水提醒</span>
              <ToggleSwitch
                checked={settings.water.enabled}
                onChange={(v) => updateSettings({ water: { ...settings.water, enabled: v } })}
              />
            </div>
            <label className="block text-sm text-ink-500 mb-2">
              提醒间隔: {settings.water.intervalMinutes} 分钟
            </label>
            <input
              type="range"
              min="30"
              max="120"
              step="10"
              value={settings.water.intervalMinutes}
              onChange={(e) => updateSettings({
                water: { ...settings.water, intervalMinutes: Number(e.target.value) }
              })}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-400"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>30分钟</span>
              <span>120分钟</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

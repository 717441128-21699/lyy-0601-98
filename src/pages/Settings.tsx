import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import {
  Settings as SettingsIcon,
  Bell,
  VolumeX,
  AlertTriangle,
  Clock,
  Eye,
  Droplets,
  Dumbbell,
  Target,
  Moon,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useAppStore();

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 mb-1">提醒设置</h2>
        <p className="text-ink-400">自定义你的健康提醒计划</p>
      </div>

      <div className="space-y-6">
        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary-500" />
            工作时段
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">上班时间</label>
              <input
                type="time"
                value={settings.workHours.start}
                onChange={(e) => updateSettings({
                  workHours: { ...settings.workHours, start: e.target.value }
                })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">下班时间</label>
              <input
                type="time"
                value={settings.workHours.end}
                onChange={(e) => updateSettings({
                  workHours: { ...settings.workHours, end: e.target.value }
                })}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-primary-50 rounded-xl">
            <p className="text-sm text-primary-700">
              💡 提醒将只在工作时段内触发，非工作时段自动暂停
            </p>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Bell size={20} className="text-primary-500" />
            提醒开关
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-warm-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Target size={18} className="text-primary-500" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">番茄钟提醒</p>
                  <p className="text-xs text-ink-400">工作{settings.pomodoro.workMinutes}分钟，休息{settings.pomodoro.restMinutes}分钟</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.pomodoro.enabled}
                onChange={(v) => updateSettings({ pomodoro: { ...settings.pomodoro, enabled: v } })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-warm-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <AlertTriangle size={18} className="text-accent-500" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">久坐提醒</p>
                  <p className="text-xs text-ink-400">每{settings.sedentary.thresholdMinutes}分钟提醒起身活动</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.sedentary.enabled}
                onChange={(v) => updateSettings({ sedentary: { ...settings.sedentary, enabled: v } })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-warm-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Droplets size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">饮水提醒</p>
                  <p className="text-xs text-ink-400">每{settings.water.intervalMinutes}分钟提醒喝水</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.water.enabled}
                onChange={(v) => updateSettings({ water: { ...settings.water, enabled: v } })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-warm-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye size={18} className="text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">眨眼提示</p>
                  <p className="text-xs text-ink-400">每{settings.blink.intervalMinutes}分钟提醒眨眼</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.blink.enabled}
                onChange={(v) => updateSettings({ blink: { ...settings.blink, enabled: v } })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-warm-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye size={18} className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">眼保健操提醒</p>
                  <p className="text-xs text-ink-400">每{settings.eyeExercise.intervalHours}小时提醒做眼保健操</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.eyeExercise.enabled}
                onChange={(v) => updateSettings({ eyeExercise: { ...settings.eyeExercise, enabled: v } })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-warm-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Dumbbell size={18} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">拉伸提醒</p>
                  <p className="text-xs text-ink-400">每{settings.stretching.intervalHours}小时提醒拉伸</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.stretching.enabled}
                onChange={(v) => updateSettings({ stretching: { ...settings.stretching, enabled: v } })}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-accent-500" />
            异常连续提醒
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-700">启用异常提醒</p>
                <p className="text-sm text-ink-400">连续多次忽略提醒时，加强提醒力度</p>
              </div>
              <ToggleSwitch
                checked={settings.abnormalReminder.enabled}
                onChange={(v) => updateSettings({ abnormalReminder: { ...settings.abnormalReminder, enabled: v } })}
              />
            </div>

            {settings.abnormalReminder.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-accent-50 rounded-xl"
              >
                <label className="block text-sm font-medium text-ink-600 mb-2">
                  连续忽略次数阈值: {settings.abnormalReminder.maxConsecutive} 次
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={settings.abnormalReminder.maxConsecutive}
                  onChange={(e) => updateSettings({
                    abnormalReminder: { ...settings.abnormalReminder, maxConsecutive: Number(e.target.value) }
                  })}
                  className="w-full h-2 bg-accent-200 rounded-lg appearance-none cursor-pointer accent-accent-400"
                />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>2次</span>
                  <span>10次</span>
                </div>
                <p className="text-xs text-accent-600 mt-3">
                  ⚠️ 达到阈值后，将发送更强烈的提醒，包括弹窗和声音提示
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Moon size={20} className="text-ink-500" />
            静音专注模式
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-ink-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ink-200 rounded-lg">
                  <VolumeX size={18} className="text-ink-600" />
                </div>
                <div>
                  <p className="font-medium text-ink-700">启用专注模式</p>
                  <p className="text-xs text-ink-400">在指定时段内静音所有提醒</p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.focusMode.enabled}
                onChange={(v) => updateSettings({ focusMode: { ...settings.focusMode, enabled: v } })}
              />
            </div>

            {settings.focusMode.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">开始时间</label>
                  <input
                    type="time"
                    value={settings.focusMode.start}
                    onChange={(e) => updateSettings({
                      focusMode: { ...settings.focusMode, start: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">结束时间</label>
                  <input
                    type="time"
                    value={settings.focusMode.end}
                    onChange={(e) => updateSettings({
                      focusMode: { ...settings.focusMode, end: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                  <div>
                    <p className="font-medium text-ink-700">完全静音</p>
                    <p className="text-xs text-ink-400">静音模式下完全不显示任何通知</p>
                  </div>
                  <ToggleSwitch
                    checked={settings.focusMode.muteSound}
                    onChange={(v) => updateSettings({ focusMode: { ...settings.focusMode, muteSound: v } })}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary-500" />
            提醒间隔设置
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                番茄钟 - 工作时长: {settings.pomodoro.workMinutes} 分钟
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
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                番茄钟 - 休息时长: {settings.pomodoro.restMinutes} 分钟
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
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                久坐提醒阈值: {settings.sedentary.thresholdMinutes} 分钟
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
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-accent-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                饮水提醒间隔: {settings.water.intervalMinutes} 分钟
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
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                眨眼提醒间隔: {settings.blink.intervalMinutes} 分钟
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
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">
                眼保健操间隔: {settings.eyeExercise.intervalHours} 小时
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
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-green-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink-600 mb-2">
                拉伸提醒间隔: {settings.stretching.intervalHours} 小时
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
                className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4">关于</h3>
          <div className="space-y-2 text-sm text-ink-500">
            <p>健康管理助手 v1.0.0</p>
            <p>专为长时间伏案工作的设计师设计</p>
            <p>帮助你管理坐姿、用眼和休息节奏</p>
            <p className="text-ink-400 mt-4">
              数据存储在本地，保护你的隐私安全
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

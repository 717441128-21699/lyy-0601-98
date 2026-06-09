import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useReminder } from '@/hooks/useReminder';
import { StatCard } from '@/components/StatCard';
import { ProgressRing } from '@/components/ProgressRing';
import { formatTime, formatCountdown } from '@/utils/dateUtils';
import {
  Clock,
  Coffee,
  Droplets,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export const TodayStatus: React.FC = () => {
  const {
    todayRecord,
    isWorking,
    currentSessionStart,
    consecutiveAbnormalCount,
    settings,
    startWorking,
    stopWorking,
    addWaterIntake,
    incrementBlinkCount,
    saveTodayRecord,
    setCurrentView,
  } = useAppStore();

  useReminder();

  useEffect(() => {
    const interval = setInterval(() => {
      saveTodayRecord();
    }, 60000);
    return () => clearInterval(interval);
  }, [saveTodayRecord]);

  const sessionDuration = currentSessionStart
    ? Math.floor((Date.now() - currentSessionStart) / 60000)
    : 0;

  const nextRestIn = settings.sedentary.thresholdMinutes - sessionDuration;
  const nextRestProgress = Math.min(100, (sessionDuration / settings.sedentary.thresholdMinutes) * 100);

  const handleQuickAction = (view: 'rest' | 'posture' | 'eye') => {
    setCurrentView(view);
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 mb-1">今日健康状态</h2>
        <p className="text-ink-400">保持良好习惯，守护你的健康</p>
      </div>

      {consecutiveAbnormalCount >= 2 && (
        <motion.div
          className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-2xl flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="text-accent-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-accent-700">连续忽略提醒警告</p>
            <p className="text-sm text-accent-600">
              您已连续 {consecutiveAbnormalCount} 次忽略提醒，请注意休息！
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Clock}
          title="久坐时长"
          value={formatTime(todayRecord.sedentaryMinutes)}
          color="primary"
          delay={0.1}
          subtext={`建议每${settings.sedentary.thresholdMinutes}分钟休息`}
        />
        <StatCard
          icon={Coffee}
          title="休息次数"
          value={todayRecord.restCount}
          unit="次"
          color="accent"
          delay={0.2}
          subtext="每次休息5分钟"
        />
        <StatCard
          icon={Droplets}
          title="今日饮水"
          value={todayRecord.waterIntake}
          unit="杯"
          color="primary"
          delay={0.3}
          subtext="目标每天8杯"
        />
        <StatCard
          icon={Eye}
          title="眨眼次数"
          value={todayRecord.blinkCount}
          unit="次"
          color="ink"
          delay={0.4}
          subtext="每20分钟眨眼提醒"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          className="card lg:col-span-2 animate-slide-up"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-ink-700">
                {isWorking ? '工作进行中' : '准备开始工作'}
              </h3>
              <p className="text-sm text-ink-400">
                {isWorking
                  ? `已连续工作 ${formatTime(sessionDuration)}`
                  : '点击开始按钮启动健康监测'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isWorking ? (
                <button onClick={startWorking} className="btn-primary flex items-center gap-2">
                  <Play size={18} />
                  开始工作
                </button>
              ) : (
                <>
                  <button onClick={stopWorking} className="btn-secondary flex items-center gap-2">
                    <Pause size={18} />
                    暂停
                  </button>
                  <button onClick={() => setCurrentView('rest')} className="btn-accent flex items-center gap-2">
                    <RefreshCw size={18} />
                    休息一下
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-warm-200">
            <div className="flex items-center gap-6">
              <ProgressRing progress={nextRestProgress} size={140} strokeWidth={10}>
                <div className="text-center">
                  <p className="text-3xl font-bold text-ink-700">
                    {formatCountdown(Math.max(0, nextRestIn * 60))}
                  </p>
                  <p className="text-xs text-ink-400">距离下次休息</p>
                </div>
              </ProgressRing>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-primary-500" size={18} />
                  <span className="text-sm text-ink-600">
                    当前状态: <span className="font-medium text-primary-500">{isWorking ? '工作中' : '已暂停'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="text-accent-500" size={18} />
                  <span className="text-sm text-ink-600">
                    今日眼保健操: <span className="font-medium">{todayRecord.eyeExerciseMinutes}分钟</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="text-primary-500" size={18} />
                  <span className="text-sm text-ink-600">
                    今日拉伸: <span className="font-medium">{todayRecord.stretchingMinutes}分钟</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          style={{ animationDelay: '0.6s' }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4">快捷操作</h3>
          <div className="space-y-3">
            <button
              onClick={() => handleQuickAction('rest')}
              className="w-full p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all flex items-center gap-3 group"
            >
              <div className="p-2 bg-primary-400 text-white rounded-lg group-hover:scale-110 transition-transform">
                <Coffee size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-ink-700">开始休息</p>
                <p className="text-xs text-ink-400">5分钟放松时间</p>
              </div>
            </button>

            <button
              onClick={addWaterIntake}
              className="w-full p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all flex items-center gap-3 group"
            >
              <div className="p-2 bg-primary-400 text-white rounded-lg group-hover:scale-110 transition-transform">
                <Droplets size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-ink-700">记录喝水</p>
                <p className="text-xs text-ink-400">当前: {todayRecord.waterIntake}杯</p>
              </div>
            </button>

            <button
              onClick={() => {
                incrementBlinkCount();
                handleQuickAction('eye');
              }}
              className="w-full p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-all flex items-center gap-3 group"
            >
              <div className="p-2 bg-accent-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                <Eye size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-ink-700">做眼保健操</p>
                <p className="text-xs text-ink-400">6个步骤，3分钟完成</p>
              </div>
            </button>

            <button
              onClick={() => handleQuickAction('posture')}
              className="w-full p-4 bg-warm-100 hover:bg-warm-200 rounded-xl transition-all flex items-center gap-3 group"
            >
              <div className="p-2 bg-ink-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                <Activity size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-ink-700">记录姿势</p>
                <p className="text-xs text-ink-400">坐姿、疼痛、疲劳自评</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="card animate-slide-up"
        style={{ animationDelay: '0.7s' }}
      >
        <h3 className="text-lg font-bold text-ink-700 mb-4">今日习惯达成</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '久坐提醒', value: todayRecord.restCount >= 4 ? 100 : (todayRecord.restCount / 4) * 100 },
            { label: '饮水目标', value: Math.min(100, (todayRecord.waterIntake / 8) * 100) },
            { label: '用眼休息', value: todayRecord.eyeExerciseMinutes >= 10 ? 100 : (todayRecord.eyeExerciseMinutes / 10) * 100 },
            { label: '拉伸运动', value: todayRecord.stretchingMinutes >= 15 ? 100 : (todayRecord.stretchingMinutes / 15) * 100 },
          ].map((item, index) => (
            <div key={item.label} className="text-center">
              <ProgressRing
                progress={item.value}
                size={80}
                strokeWidth={6}
                color={item.value >= 100 ? '#4ECDC4' : '#FF6B6B'}
                bgColor={item.value >= 100 ? '#E8F8F6' : '#FFF0F0'}
              >
                <span className="text-sm font-bold text-ink-700">{Math.round(item.value)}%</span>
              </ProgressRing>
              <p className="text-sm text-ink-500 mt-2">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

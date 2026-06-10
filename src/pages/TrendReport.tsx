import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar, Chart } from 'react-chartjs-2';
import { useAppStore } from '@/store/useAppStore';
import { ProgressRing } from '@/components/ProgressRing';
import { exportToCSV } from '@/utils/storage';
import { getLast7Days } from '@/utils/dateUtils';
import type { PlanAdjustment } from '@/types';
import {
  TrendingUp,
  Download,
  Calendar,
  Target,
  Award,
  AlertTriangle,
  BarChart3,
  Check,
  X,
  RefreshCw,
  Zap,
  Brain,
  Heart,
  ChevronRight,
  Clock,
  RotateCcw,
  Settings as SettingsIcon,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const getLast30Days = () => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }
  return days;
};

export const TrendReport: React.FC = () => {
  const {
    historyRecords,
    todayRecord,
    updateSettings,
    settings,
    planAdjustments,
    generatePlanSuggestions,
    applyPlanAdjustment,
    dismissPlanAdjustment,
    restoreDismissedAdjustment,
  } = useAppStore();
  const [activeChart, setActiveChart] = useState<'sedentary' | 'water' | 'exercise'>('sedentary');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [planTab, setPlanTab] = useState<'pending' | 'applied' | 'dismissed'>('pending');

  useEffect(() => {
    generatePlanSuggestions();
  }, [generatePlanSuggestions]);

  const last7Days = getLast7Days();
  const last30Days = getLast30Days();

  const timeRangeDays = timeRange === 'week' ? last7Days : last30Days;
  const daysBack = timeRange === 'week' ? 6 : 29;

  const timeRangeRecords = useMemo(() => {
    return timeRangeDays.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysBack - index));
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return historyRecords.find(r => r.date === dateStr) || {
        date: dateStr,
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
      };
    });
  }, [historyRecords, timeRangeDays, daysBack]);

  const last7Records = useMemo(() => {
    return last7Days.map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return historyRecords.find(r => r.date === dateStr) || {
        date: dateStr,
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
      };
    });
  }, [historyRecords, last7Days]);

  const chartData = useMemo(() => {
    const labels = timeRangeDays;
    const datasets = {
      sedentary: {
        label: '久坐时长(分钟)',
        data: timeRangeRecords.map(r => r.sedentaryMinutes),
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        fill: true,
        tension: 0.4,
      },
      water: {
        label: '饮水量(杯)',
        data: timeRangeRecords.map(r => r.waterIntake),
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        fill: true,
        tension: 0.4,
      },
      exercise: {
        label: '运动时长(分钟)',
        data: timeRangeRecords.map(r => r.eyeExerciseMinutes + r.stretchingMinutes),
        borderColor: '#2C3E50',
        backgroundColor: 'rgba(44, 62, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    };
    return { labels, datasets: [datasets[activeChart]] };
  }, [timeRangeDays, timeRangeRecords, activeChart]);

  const comparisonChartData = useMemo(() => {
    const labels = timeRangeDays;
    const maxRest = Math.max(...timeRangeRecords.map(r => r.restCount), 1);
    const maxAbnormal = Math.max(...timeRangeRecords.map(r => r.abnormalReminderCount || 0), 1);
    const maxFatigue = Math.max(...timeRangeRecords.map(r => r.fatigueScore), 1);
    
    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: '休息次数',
          data: timeRangeRecords.map(r => (r.restCount / maxRest) * 100),
          borderColor: '#4ECDC4',
          backgroundColor: 'rgba(78, 205, 196, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          fill: true,
        },
        {
          type: 'bar' as const,
          label: '异常提醒次数',
          data: timeRangeRecords.map(r => (r.abnormalReminderCount || 0) / maxAbnormal * 100),
          backgroundColor: 'rgba(255, 107, 107, 0.6)',
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: '疲劳评分',
          data: timeRangeRecords.map(r => (r.fatigueScore / maxFatigue) * 100),
          borderColor: '#FFB347',
          backgroundColor: 'rgba(255, 179, 71, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          borderDash: [5, 5],
        },
      ],
    };
  }, [timeRangeDays, timeRangeRecords]);

  const comparisonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: '#2C3E50',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderRadius: 12,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#ABB8C3',
        },
      },
      y: {
        grid: {
          color: '#EAEDEF',
        },
        ticks: {
          color: '#ABB8C3',
          callback: (value: number | string) => `${value}%`,
        },
        min: 0,
        max: 100,
      },
    },
  };

  const habitRates = useMemo(() => {
    const records = timeRangeRecords;
    const avgRestCount = records.reduce((sum, r) => sum + r.restCount, 0) / records.length;
    const avgWater = records.reduce((sum, r) => sum + r.waterIntake, 0) / records.length;
    const avgEye = records.reduce((sum, r) => sum + r.eyeExerciseMinutes, 0) / records.length;
    const avgStretch = records.reduce((sum, r) => sum + r.stretchingMinutes, 0) / records.length;

    return [
      { label: '休息提醒', value: Math.min(100, (avgRestCount / 4) * 100), target: '每日4次', current: `${avgRestCount.toFixed(1)}次` },
      { label: '饮水目标', value: Math.min(100, (avgWater / 8) * 100), target: '每日8杯', current: `${avgWater.toFixed(1)}杯` },
      { label: '眼保健操', value: Math.min(100, (avgEye / 10) * 100), target: '每日10分钟', current: `${avgEye.toFixed(1)}分钟` },
      { label: '拉伸运动', value: Math.min(100, (avgStretch / 15) * 100), target: '每日15分钟', current: `${avgStretch.toFixed(1)}分钟` },
    ];
  }, [timeRangeRecords]);

  const avgFatigue = useMemo(() => {
    const scores = timeRangeRecords.filter(r => r.fatigueScore > 0).map(r => r.fatigueScore);
    return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
  }, [timeRangeRecords]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#2C3E50',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderRadius: 12,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#ABB8C3',
        },
      },
      y: {
        grid: {
          color: '#EAEDEF',
        },
        ticks: {
          color: '#ABB8C3',
        },
      },
    },
  };

  const overallScore = useMemo(() => {
    return Math.round(habitRates.reduce((sum, h) => sum + h.value, 0) / habitRates.length);
  }, [habitRates]);

  const doughnutData = {
    labels: habitRates.map(h => h.label),
    datasets: [
      {
        data: habitRates.map(h => Math.round(h.value)),
        backgroundColor: ['#4ECDC4', '#FF6B6B', '#2C3E50', '#75D5C9'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const suggestions = useMemo(() => {
    const suggestions: { type: 'good' | 'warning' | 'info'; text: string }[] = [];
    
    if (overallScore >= 80) {
      suggestions.push({ type: 'good', text: '🎉 太棒了！你的健康习惯保持得非常好，继续保持！' });
    } else if (overallScore >= 60) {
      suggestions.push({ type: 'info', text: '👍 做得不错，还有提升空间，继续努力！' });
    } else {
      suggestions.push({ type: 'warning', text: '⚠️ 需要注意健康管理了，建议调整作息和习惯。' });
    }

    const lowHabits = habitRates.filter(h => h.value < 60);
    lowHabits.forEach(h => {
      suggestions.push({
        type: 'warning',
        text: `${h.label}达成率偏低，${h.target}，当前仅${h.current}`,
      });
    });

    if (Number(avgFatigue) >= 6) {
      suggestions.push({
        type: 'warning',
        text: `本周平均疲劳度${avgFatigue}，偏高，建议增加休息时间。`,
      });
    }

    return suggestions;
  }, [overallScore, habitRates, avgFatigue]);

  const handleExport = () => {
    exportToCSV([...timeRangeRecords, todayRecord]);
  };

  const handleAutoAdjust = () => {
    const newSettings = { ...settings };
    
    if (habitRates[0].value < 60) {
      newSettings.sedentary = { ...newSettings.sedentary, thresholdMinutes: Math.max(30, settings.sedentary.thresholdMinutes - 5) };
    }
    if (habitRates[1].value < 60) {
      newSettings.water = { ...newSettings.water, intervalMinutes: Math.max(30, settings.water.intervalMinutes - 10) };
    }
    if (habitRates[2].value < 60) {
      newSettings.eyeExercise = { ...newSettings.eyeExercise, intervalHours: Math.max(1, settings.eyeExercise.intervalHours - 0.5) };
    }
    if (habitRates[3].value < 60) {
      newSettings.stretching = { ...newSettings.stretching, intervalHours: Math.max(0.5, settings.stretching.intervalHours - 0.5) };
    }

    updateSettings(newSettings);
  };

  const typeLabels: Record<PlanAdjustment['type'], string> = {
    pomodoro: '番茄钟',
    sedentary: '久坐提醒',
    water: '饮水提醒',
    eye: '眼保健操',
    stretch: '拉伸提醒',
  };

  const fieldLabels: Record<PlanAdjustment['field'], string> = {
    workMinutes: '工作时长',
    restMinutes: '休息时长',
    thresholdMinutes: '提醒阈值',
    intervalMinutes: '提醒间隔',
    intervalHours: '提醒间隔',
  };

  const formatValue = (type: PlanAdjustment['type'], field: PlanAdjustment['field'], value: number) => {
    if (field === 'intervalHours') {
      return `${value}小时`;
    }
    return `${value}分钟`;
  };

  const formatDateTime = (timestamp?: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const filteredAdjustments = useMemo(() => {
    return planAdjustments.filter(a => a.status === planTab);
  }, [planAdjustments, planTab]);

  const tabCounts = useMemo(() => ({
    pending: planAdjustments.filter(a => a.status === 'pending').length,
    applied: planAdjustments.filter(a => a.status === 'applied').length,
    dismissed: planAdjustments.filter(a => a.status === 'dismissed').length,
  }), [planAdjustments]);

  const renderAppliedSettings = (adjustment: PlanAdjustment) => {
    if (!adjustment.appliedSettings) return null;
    const changes: string[] = [];
    
    if (adjustment.appliedSettings.pomodoro) {
      if (adjustment.appliedSettings.pomodoro.workMinutes !== undefined) {
        changes.push(`番茄钟工作时长 ${adjustment.currentValue}分钟 → ${adjustment.suggestedValue}分钟`);
      }
      if (adjustment.appliedSettings.pomodoro.restMinutes !== undefined) {
        changes.push(`番茄钟休息时长 ${adjustment.currentValue}分钟 → ${adjustment.suggestedValue}分钟`);
      }
    }
    if (adjustment.appliedSettings.sedentary) {
      changes.push(`久坐提醒阈值 ${adjustment.currentValue}分钟 → ${adjustment.suggestedValue}分钟`);
    }
    if (adjustment.appliedSettings.water) {
      changes.push(`饮水提醒间隔 ${adjustment.currentValue}分钟 → ${adjustment.suggestedValue}分钟`);
    }
    if (adjustment.appliedSettings.eyeExercise) {
      changes.push(`眼保健操间隔 ${adjustment.currentValue}小时 → ${adjustment.suggestedValue}小时`);
    }
    if (adjustment.appliedSettings.stretching) {
      changes.push(`拉伸提醒间隔 ${adjustment.currentValue}小时 → ${adjustment.suggestedValue}小时`);
    }
    
    return changes;
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink-700 mb-1">趋势报告</h2>
          <p className="text-ink-400">查看你的健康数据趋势和分析</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-warm-100 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'week'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              周视图
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'month'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-ink-500 hover:text-ink-700'
              }`}
            >
              月视图
            </button>
          </div>
          <button onClick={handleAutoAdjust} className="btn-secondary btn-sm flex items-center gap-2">
            <Target size={16} />
            智能调整计划
          </button>
          <button onClick={handleExport} className="btn-primary btn-sm flex items-center gap-2">
            <Download size={16} />
            导出数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-400 mb-1">综合评分</p>
              <p className="text-3xl font-bold gradient-text">{overallScore}分</p>
            </div>
            <div className="p-3 rounded-2xl bg-primary-50">
              <Award className="text-primary-500" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-400 mb-1">{timeRange === 'week' ? '本周' : '本月'}平均久坐</p>
              <p className="text-3xl font-bold text-ink-700">
                {Math.round(timeRangeRecords.reduce((s, r) => s + r.sedentaryMinutes, 0) / timeRangeRecords.length)}
                <span className="text-sm font-normal text-ink-400 ml-1">分钟</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-accent-50">
              <Calendar className="text-accent-500" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-400 mb-1">平均疲劳度</p>
              <p className="text-3xl font-bold text-ink-700">
                {avgFatigue}
                <span className="text-sm font-normal text-ink-400 ml-1">/ 10</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-warm-200">
              <AlertTriangle className="text-ink-500" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-400 mb-1">累计休息次数</p>
              <p className="text-3xl font-bold text-ink-700">
                {timeRangeRecords.reduce((s, r) => s + r.restCount, 0)}
                <span className="text-sm font-normal text-ink-400 ml-1">次</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-primary-50">
              <TrendingUp className="text-primary-500" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div
          className="card lg:col-span-2 animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink-700">{timeRange === 'week' ? '周' : '月'}趋势图</h3>
            <div className="flex gap-2">
              {[
                { id: 'sedentary', label: '久坐' },
                { id: 'water', label: '饮水' },
                { id: 'exercise', label: '运动' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id as typeof activeChart)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeChart === tab.id
                      ? 'bg-primary-400 text-white'
                      : 'bg-warm-100 text-ink-500 hover:bg-warm-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4">习惯占比</h3>
          <div className="relative">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-700">{overallScore}%</p>
                <p className="text-xs text-ink-400">综合达成</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {habitRates.map((habit, i) => (
              <div key={habit.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: ['#4ECDC4', '#FF6B6B', '#2C3E50', '#75D5C9'][i] }}
                />
                <span className="text-xs text-ink-500">{habit.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4">周习惯达成率</h3>
          <div className="grid grid-cols-2 gap-4">
            {habitRates.map((habit, index) => (
              <div key={habit.label} className="text-center">
                <ProgressRing
                  progress={habit.value}
                  size={100}
                  strokeWidth={8}
                  color={habit.value >= 80 ? '#4ECDC4' : habit.value >= 60 ? '#FFB347' : '#FF6B6B'}
                  bgColor={habit.value >= 80 ? '#E8F8F6' : habit.value >= 60 ? '#FFF3E0' : '#FFF0F0'}
                >
                  <span className="text-sm font-bold text-ink-700">{Math.round(habit.value)}%</span>
                </ProgressRing>
                <p className="text-sm font-medium text-ink-600 mt-2">{habit.label}</p>
                <p className="text-xs text-ink-400">{habit.target}</p>
                <p className="text-xs text-primary-500">平均: {habit.current}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4">智能建议</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                className={`p-3 rounded-xl ${
                  suggestion.type === 'good' ? 'bg-green-50 border border-green-200' :
                  suggestion.type === 'warning' ? 'bg-accent-50 border border-accent-200' :
                  'bg-primary-50 border border-primary-200'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <p className={`text-sm ${
                  suggestion.type === 'good' ? 'text-green-700' :
                  suggestion.type === 'warning' ? 'text-accent-700' :
                  'text-primary-700'
                }`}>
                  {suggestion.text}
                </p>
              </motion.div>
            ))}
          </div>

          <button
            onClick={handleAutoAdjust}
            className="w-full btn-primary mt-4"
          >
            根据报告自动调整计划
          </button>
        </motion.div>
      </div>

      <motion.div
        className="card animate-slide-up mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BarChart3 size={20} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink-700">健康关系分析</h3>
              <p className="text-sm text-ink-400">休息规律、异常提醒与疲劳评分的关联</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-primary-400" />
              <span>休息次数</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-accent-400 opacity-60 rounded-sm" />
              <span>异常提醒</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-amber-400" style={{ borderStyle: 'dashed' }} />
              <span>疲劳评分</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <Chart type="bar" data={comparisonChartData} options={comparisonChartOptions} />
        </div>
        <div className="mt-4 p-4 bg-warm-50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-warm-200 rounded-lg flex-shrink-0">
              <Brain size={20} className="text-ink-600" />
            </div>
            <div>
              <p className="font-medium text-ink-700 mb-1">AI 分析洞察</p>
              <p className="text-sm text-ink-500">
                {comparisonChartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0) / comparisonChartData.datasets[0].data.length > 60
                  ? '你的休息规律保持良好，异常提醒次数和疲劳评分都处于较低水平，继续保持！'
                  : comparisonChartData.datasets[1].data.reduce((a: number, b: number) => a + b, 0) > 200
                  ? '异常提醒次数较多，与疲劳评分呈现正相关。建议增加休息频率，避免连续久坐。'
                  : '休息频率和疲劳度有一定关联，建议在感到疲劳前主动休息，效果更好。'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card animate-slide-up"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Zap size={20} className="text-accent-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink-700">计划建议中心</h3>
              <p className="text-sm text-ink-400">基于你的数据自动生成，可手动采纳或忽略</p>
            </div>
          </div>
          <button
            onClick={() => generatePlanSuggestions()}
            className="btn-secondary btn-sm flex items-center gap-2"
          >
            <RefreshCw size={14} />
            刷新建议
          </button>
        </div>

        <div className="flex border-b border-warm-200 mb-4">
          {[
            { id: 'pending', label: '待采纳', count: tabCounts.pending },
            { id: 'applied', label: '已采纳', count: tabCounts.applied },
            { id: 'dismissed', label: '已忽略', count: tabCounts.dismissed },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPlanTab(tab.id as typeof planTab)}
              className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
                planTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  planTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-warm-200 text-ink-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {filteredAdjustments.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-ink-400"
            >
              <Heart size={48} className="mx-auto mb-2 opacity-50" />
              <p>
                {planTab === 'pending' && '当前没有待采纳的计划调整建议'}
                {planTab === 'applied' && '还没有采纳过任何计划调整建议'}
                {planTab === 'dismissed' && '还没有忽略过任何计划调整建议'}
              </p>
              <p className="text-sm">
                {planTab === 'pending' && '继续保持良好的健康习惯！'}
                {planTab === 'applied' && '点击"刷新建议"生成新的调整建议'}
                {planTab === 'dismissed' && '所有建议都已经过你的认真考量'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 max-h-96 overflow-y-auto"
            >
              <AnimatePresence>
                {filteredAdjustments.map((adjustment, index) => (
                  <motion.div
                    key={adjustment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border ${
                      planTab === 'pending'
                        ? 'bg-warm-50 border-warm-200'
                        : planTab === 'applied'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-ink-50 border-ink-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            planTab === 'pending'
                              ? 'bg-warm-200 text-ink-600'
                              : planTab === 'applied'
                              ? 'bg-green-200 text-green-700'
                              : 'bg-ink-200 text-ink-600'
                          }`}>
                            {typeLabels[adjustment.type]}
                          </span>
                          {planTab === 'applied' && adjustment.appliedAt && (
                            <span className="text-xs text-ink-400 flex items-center gap-1">
                              <Clock size={12} />
                              采纳于 {formatDateTime(adjustment.appliedAt)}
                            </span>
                          )}
                          {planTab === 'dismissed' && adjustment.dismissedAt && (
                            <span className="text-xs text-ink-400 flex items-center gap-1">
                              <Clock size={12} />
                              忽略于 {formatDateTime(adjustment.dismissedAt)}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-ink-700">{adjustment.reason}</p>
                        
                        {planTab === 'applied' ? (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <SettingsIcon size={14} className="text-green-600" />
                              <span className="text-sm font-medium text-green-700">已生效的设置变更</span>
                            </div>
                            <div className="space-y-1">
                              {renderAppliedSettings(adjustment)?.map((change, i) => (
                                <div key={i} className="text-sm text-ink-600 flex items-center gap-2">
                                  <Check size={14} className="text-green-500" />
                                  {change}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-ink-500">
                              {fieldLabels[adjustment.field]}: {formatValue(adjustment.type, adjustment.field, adjustment.currentValue)}
                            </span>
                            <ChevronRight size={16} className="text-primary-500" />
                            <span className="text-sm font-medium text-primary-600">
                              建议: {formatValue(adjustment.type, adjustment.field, adjustment.suggestedValue)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {planTab === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => applyPlanAdjustment(adjustment.id)}
                          className="btn-primary btn-sm flex items-center gap-2"
                        >
                          <Check size={14} />
                          采纳建议
                        </button>
                        <button
                          onClick={() => dismissPlanAdjustment(adjustment.id)}
                          className="btn-secondary btn-sm flex items-center gap-2"
                        >
                          <X size={14} />
                          暂时忽略
                        </button>
                      </div>
                    )}

                    {planTab === 'dismissed' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => restoreDismissedAdjustment(adjustment.id)}
                          className="btn-primary btn-sm flex items-center gap-2"
                        >
                          <RotateCcw size={14} />
                          恢复为待采纳
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

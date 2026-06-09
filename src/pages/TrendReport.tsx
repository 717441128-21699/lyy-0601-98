import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
import { Line, Doughnut } from 'react-chartjs-2';
import { useAppStore } from '@/store/useAppStore';
import { ProgressRing } from '@/components/ProgressRing';
import { exportToCSV } from '@/utils/storage';
import { getLast7Days } from '@/utils/dateUtils';
import {
  TrendingUp,
  Download,
  Calendar,
  Target,
  Award,
  AlertTriangle,
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

export const TrendReport: React.FC = () => {
  const { historyRecords, todayRecord, updateSettings, settings } = useAppStore();
  const [activeChart, setActiveChart] = useState<'sedentary' | 'water' | 'exercise'>('sedentary');

  const last7Days = getLast7Days();
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
      };
    });
  }, [historyRecords, last7Days]);

  const chartData = useMemo(() => {
    const labels = last7Days;
    const datasets = {
      sedentary: {
        label: '久坐时长(分钟)',
        data: last7Records.map(r => r.sedentaryMinutes),
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        fill: true,
        tension: 0.4,
      },
      water: {
        label: '饮水量(杯)',
        data: last7Records.map(r => r.waterIntake),
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        fill: true,
        tension: 0.4,
      },
      exercise: {
        label: '运动时长(分钟)',
        data: last7Records.map(r => r.eyeExerciseMinutes + r.stretchingMinutes),
        borderColor: '#2C3E50',
        backgroundColor: 'rgba(44, 62, 80, 0.1)',
        fill: true,
        tension: 0.4,
      },
    };
    return { labels, datasets: [datasets[activeChart]] };
  }, [last7Days, last7Records, activeChart]);

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

  const habitRates = useMemo(() => {
    const weekRecords = last7Records;
    const avgRestCount = weekRecords.reduce((sum, r) => sum + r.restCount, 0) / 7;
    const avgWater = weekRecords.reduce((sum, r) => sum + r.waterIntake, 0) / 7;
    const avgEye = weekRecords.reduce((sum, r) => sum + r.eyeExerciseMinutes, 0) / 7;
    const avgStretch = weekRecords.reduce((sum, r) => sum + r.stretchingMinutes, 0) / 7;

    return [
      { label: '休息提醒', value: Math.min(100, (avgRestCount / 4) * 100), target: '每日4次', current: `${avgRestCount.toFixed(1)}次` },
      { label: '饮水目标', value: Math.min(100, (avgWater / 8) * 100), target: '每日8杯', current: `${avgWater.toFixed(1)}杯` },
      { label: '眼保健操', value: Math.min(100, (avgEye / 10) * 100), target: '每日10分钟', current: `${avgEye.toFixed(1)}分钟` },
      { label: '拉伸运动', value: Math.min(100, (avgStretch / 15) * 100), target: '每日15分钟', current: `${avgStretch.toFixed(1)}分钟` },
    ];
  }, [last7Records]);

  const overallScore = useMemo(() => {
    return Math.round(habitRates.reduce((sum, h) => sum + h.value, 0) / habitRates.length);
  }, [habitRates]);

  const avgFatigue = useMemo(() => {
    const scores = last7Records.filter(r => r.fatigueScore > 0).map(r => r.fatigueScore);
    return scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
  }, [last7Records]);

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
    exportToCSV([...last7Records, todayRecord]);
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
              <p className="text-sm text-ink-400 mb-1">本周平均久坐</p>
              <p className="text-3xl font-bold text-ink-700">
                {Math.round(last7Records.reduce((s, r) => s + r.sedentaryMinutes, 0) / 7)}
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
                {last7Records.reduce((s, r) => s + r.restCount, 0)}
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
            <h3 className="text-lg font-bold text-ink-700">周趋势图</h3>
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
    </motion.div>
  );
};

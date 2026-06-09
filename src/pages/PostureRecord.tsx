import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { painAreaLabels, screenDistanceLabels } from '@/constants/exercises';
import {
  UserCheck,
  AlertCircle,
  Monitor,
  Frown,
  Meh,
  Smile,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { PainRecord } from '@/types';

export const PostureRecord: React.FC = () => {
  const {
    todayRecord,
    addPostureRecord,
    addPainRecord,
    setScreenDistance,
    setFatigueScore,
    resetAbnormalCount,
  } = useAppStore();

  const [selectedArea, setSelectedArea] = useState<PainRecord['area'] | null>(null);
  const [painLevel, setPainLevel] = useState(5);
  const [fatigueLevel, setFatigueLevel] = useState(5);

  const handlePostureRecord = (status: 'good' | 'needs_adjustment') => {
    addPostureRecord(status);
    if (status === 'good') {
      resetAbnormalCount();
    }
  };

  const handlePainSubmit = () => {
    if (selectedArea) {
      addPainRecord(selectedArea, painLevel);
      setSelectedArea(null);
      setPainLevel(5);
    }
  };

  const handleFatigueSubmit = () => {
    setFatigueScore(fatigueLevel);
  };

  const painEmojis = ['😊', '🙂', '😐', '😕', '😣', '😖', '😫', '😩', '😭', '💀'];

  const getPainColor = (level: number) => {
    if (level <= 3) return 'from-green-400 to-green-500';
    if (level <= 6) return 'from-yellow-400 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  const goodPostureCount = todayRecord.postureRecords.filter(r => r.status === 'good').length;
  const badPostureCount = todayRecord.postureRecords.filter(r => r.status === 'needs_adjustment').length;

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 animate-fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-700 mb-1">姿势记录</h2>
        <p className="text-ink-400">关注你的坐姿和身体状态，及时调整</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <UserCheck size={20} className="text-primary-500" />
            当前坐姿记录
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handlePostureRecord('good')}
              className="p-6 bg-primary-50 hover:bg-primary-100 rounded-2xl transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-4 bg-primary-400 text-white rounded-full group-hover:scale-110 transition-transform">
                <CheckCircle2 size={32} />
              </div>
              <span className="font-medium text-ink-700">坐姿正确</span>
              <span className="text-sm text-ink-400">已记录 {goodPostureCount} 次</span>
            </button>

            <button
              onClick={() => handlePostureRecord('needs_adjustment')}
              className="p-6 bg-accent-50 hover:bg-accent-100 rounded-2xl transition-all flex flex-col items-center gap-3 group"
            >
              <div className="p-4 bg-accent-500 text-white rounded-full group-hover:scale-110 transition-transform">
                <XCircle size={32} />
              </div>
              <span className="font-medium text-ink-700">需要调整</span>
              <span className="text-sm text-ink-400">已记录 {badPostureCount} 次</span>
            </button>
          </div>

          <div className="p-4 bg-warm-100 rounded-2xl">
            <h4 className="font-medium text-ink-700 mb-3">正确坐姿要点</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>双脚平放地面，膝盖与臀部同高</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>背部挺直，腰部有支撑</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>屏幕顶部与眼睛平齐，距离50-70cm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <span>手臂自然下垂，肘部呈90度</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-accent-500" />
            疼痛程度记录
          </h3>

          <div className="mb-4">
            <p className="text-sm text-ink-500 mb-3">选择疼痛部位</p>
            <div className="grid grid-cols-3 gap-2">
              {(['neck', 'shoulder', 'back', 'wrist', 'eye'] as const).map(area => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`p-3 rounded-xl transition-all text-sm font-medium ${
                    selectedArea === area
                      ? 'bg-accent-500 text-white shadow-glow'
                      : 'bg-warm-100 text-ink-600 hover:bg-warm-200'
                  }`}
                >
                  {painAreaLabels[area]}
                </button>
              ))}
            </div>
          </div>

          {selectedArea && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink-500">疼痛程度</span>
                  <span className="text-4xl">{painEmojis[painLevel - 1]}</span>
                </div>
                <div className="relative h-3 bg-warm-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute h-full rounded-full bg-gradient-to-r ${getPainColor(painLevel)}`}
                    style={{ width: `${(painLevel / 10) * 100}%` }}
                    animate={{ width: `${(painLevel / 10) * 100}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full h-3 opacity-0 absolute -mt-3 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>1 轻微</span>
                  <span>5 中度</span>
                  <span>10 剧烈</span>
                </div>
              </div>

              <button
                onClick={handlePainSubmit}
                className="w-full btn-accent"
              >
                记录疼痛
              </button>
            </motion.div>
          )}

          {todayRecord.painRecords.length > 0 && (
            <div className="mt-6 pt-4 border-t border-warm-200">
              <p className="text-sm text-ink-500 mb-3">今日疼痛记录</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {todayRecord.painRecords.slice().reverse().slice(0, 5).map((record, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-warm-100 rounded-lg">
                    <span className="text-sm text-ink-600">{painAreaLabels[record.area]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-400">
                        {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-accent-100 text-accent-600 rounded-full">
                        {record.level}级
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-primary-500" />
            屏幕距离自评
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['too_close', 'normal', 'too_far'] as const).map(distance => (
              <button
                key={distance}
                onClick={() => setScreenDistance(distance)}
                className={`p-4 rounded-2xl transition-all flex flex-col items-center gap-2 ${
                  todayRecord.screenDistance === distance
                    ? 'bg-primary-400 text-white shadow-glow'
                    : 'bg-warm-100 text-ink-600 hover:bg-warm-200'
                }`}
              >
                <Monitor
                  size={28}
                  className={todayRecord.screenDistance === distance ? 'text-white' : ''}
                />
                <span className="text-sm font-medium text-center">
                  {screenDistanceLabels[distance].split('（')[0]}
                </span>
                <span className="text-xs opacity-75">
                  {screenDistanceLabels[distance].match(/\(([^)]+)\)/)?.[1]}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-primary-50 rounded-2xl">
            <p className="text-sm text-primary-700">
              💡 <strong>20-20-20法则：</strong>每用眼20分钟，看20英尺（约6米）外的物体20秒。
            </p>
          </div>
        </motion.div>

        <motion.div
          className="card animate-slide-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-ink-700 mb-4 flex items-center gap-2">
            <Frown size={20} className="text-accent-500" />
            疲劳度自评
          </h3>

          <div className="text-center mb-6">
            <div className="text-7xl mb-2">
              {fatigueLevel <= 3 ? <Smile className="inline text-green-500" size={72} /> :
               fatigueLevel <= 6 ? <Meh className="inline text-yellow-500" size={72} /> :
               <Frown className="inline text-accent-500" size={72} />}
            </div>
            <p className="text-ink-500">
              {fatigueLevel <= 3 ? '状态很好，继续保持！' :
               fatigueLevel <= 6 ? '有些疲劳，注意休息' :
               '非常疲劳，建议立即休息'}
            </p>
          </div>

          <div className="mb-4">
            <input
              type="range"
              min="1"
              max="10"
              value={fatigueLevel}
              onChange={(e) => setFatigueLevel(Number(e.target.value))}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-primary-400"
            />
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>1 精力充沛</span>
              <span>5 中度疲劳</span>
              <span>10 极度疲劳</span>
            </div>
          </div>

          <button
            onClick={handleFatigueSubmit}
            className="w-full btn-primary"
          >
            记录疲劳度 {todayRecord.fatigueScore > 0 && `(当前: ${todayRecord.fatigueScore})`}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

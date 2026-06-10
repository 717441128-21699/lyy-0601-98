import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Coffee,
  Droplets,
  CheckCircle2,
  AlertCircle,
  Eye,
  Dumbbell,
  Stethoscope,
  Ruler,
  Battery,
  Undo2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ActivityRecord } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface TimelineProps {
  activities: ActivityRecord[];
  onUndo: (activityId: string) => void;
}

const activityConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  work_start: { icon: Briefcase, label: '开始工作', color: 'text-primary-500 bg-primary-50' },
  work_pause: { icon: Coffee, label: '暂停工作', color: 'text-accent-500 bg-accent-50' },
  water: { icon: Droplets, label: '记录喝水', color: 'text-blue-500 bg-blue-50' },
  posture_good: { icon: CheckCircle2, label: '坐姿正确', color: 'text-green-500 bg-green-50' },
  posture_needs_adjustment: { icon: AlertCircle, label: '坐姿需调整', color: 'text-amber-500 bg-amber-50' },
  rest_start: { icon: Coffee, label: '开始休息', color: 'text-accent-500 bg-accent-50' },
  eye_exercise_start: { icon: Eye, label: '开始眼保健操', color: 'text-indigo-500 bg-indigo-50' },
  eye_exercise_complete: { icon: Eye, label: '完成眼保健操', color: 'text-indigo-500 bg-indigo-50' },
  stretching_start: { icon: Dumbbell, label: '开始拉伸', color: 'text-purple-500 bg-purple-50' },
  stretching_complete: { icon: Dumbbell, label: '完成拉伸', color: 'text-purple-500 bg-purple-50' },
  pain_record: { icon: Stethoscope, label: '记录疼痛', color: 'text-red-500 bg-red-50' },
  screen_distance_record: { icon: Ruler, label: '屏幕距离自评', color: 'text-teal-500 bg-teal-50' },
  fatigue_record: { icon: Battery, label: '疲劳度自评', color: 'text-orange-500 bg-orange-50' },
};

export const Timeline: React.FC<TimelineProps> = ({ activities, onUndo }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const displayedActivities = showAll ? activities : activities.slice(0, 10);
  const hasMore = activities.length > 10;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-ink-400">
        <Clock size={48} className="mx-auto mb-2 opacity-50" />
        <p>暂无活动记录</p>
        <p className="text-sm">点击开始工作后，这里会显示你的活动时间线</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {displayedActivities.map((activity, index) => {
          const config = activityConfig[activity.type] || {
            icon: Clock,
            label: activity.type,
            color: 'text-ink-500 bg-ink-50',
          };
          const Icon = config.icon;
          const isExpanded = expandedId === activity.id;
          const isFirst = index === 0;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ delay: index * 0.03 }}
              className="relative"
            >
              {!isFirst && (
                <div className="absolute left-6 top-0 w-0.5 h-6 bg-warm-200 -translate-y-full" />
              )}
              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-full ${config.color} flex-shrink-0 relative z-10`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`flex items-center justify-between p-3 bg-white rounded-xl border border-warm-100 cursor-pointer hover:border-primary-200 transition-colors ${
                      isExpanded ? 'border-primary-300' : ''
                    }`}
                    onClick={() => toggleExpand(activity.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div>
                        <p className="font-medium text-ink-700">{config.label}</p>
                        <p className="text-xs text-ink-400">{formatTime(activity.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.undoable && !activity.undone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUndo(activity.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-warm-100 text-ink-400 hover:text-accent-500 transition-colors"
                          title="撤销"
                        >
                          <Undo2 size={14} />
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && activity.details && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 bg-warm-50 rounded-xl text-sm">
                          <h4 className="font-medium text-ink-600 mb-2">详情</h4>
                          <div className="space-y-1">
                            {Object.entries(activity.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-ink-500">{key}:</span>
                                <span className="text-ink-700 font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-center text-primary-500 hover:text-primary-600 text-sm font-medium"
        >
          {showAll ? '收起' : `查看全部 ${activities.length} 条记录`}
        </button>
      )}
    </div>
  );
};

const Clock = ({ size, className }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

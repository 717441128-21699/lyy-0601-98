import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Eye,
  Droplets,
  Dumbbell,
  Target,
  User,
  Ban,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import type { ReminderLog, ReminderType } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface ReminderHistoryProps {
  logs: ReminderLog[];
}

const typeConfig: Record<ReminderType, { icon: React.ElementType; label: string; color: string }> = {
  sedentary: { icon: User, label: '久坐提醒', color: 'bg-orange-100 text-orange-500' },
  water: { icon: Droplets, label: '饮水提醒', color: 'bg-blue-100 text-blue-500' },
  blink: { icon: Eye, label: '眨眼提示', color: 'bg-cyan-100 text-cyan-500' },
  eye: { icon: Eye, label: '眼保健操', color: 'bg-indigo-100 text-indigo-500' },
  stretch: { icon: Dumbbell, label: '拉伸提醒', color: 'bg-purple-100 text-purple-500' },
  pomodoro: { icon: Target, label: '番茄钟', color: 'bg-primary-100 text-primary-500' },
};

const statusConfig = {
  shown: { icon: CheckCircle, label: '已弹出', color: 'text-green-500' },
  suppressed: { icon: Ban, label: '已压制', color: 'text-amber-500' },
  failed: { icon: XCircle, label: '失败', color: 'text-red-500' },
};

const allTypes: (ReminderType | 'all')[] = ['all', 'sedentary', 'water', 'blink', 'eye', 'stretch', 'pomodoro'];
const allStatuses: ('all' | 'shown' | 'suppressed' | 'failed')[] = ['all', 'shown', 'suppressed', 'failed'];

export const ReminderHistory: React.FC<ReminderHistoryProps> = ({ logs }) => {
  const [typeFilter, setTypeFilter] = useState<ReminderType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'shown' | 'suppressed' | 'failed'>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (typeFilter !== 'all' && log.type !== typeFilter) return false;
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      return true;
    });
  }, [logs, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    const shown = logs.filter(l => l.status === 'shown').length;
    const suppressed = logs.filter(l => l.status === 'suppressed').length;
    const focusSuppressed = logs.filter(l => l.suppressedReason === 'focus_mode').length;
    return { shown, suppressed, focusSuppressed, total: logs.length };
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-ink-400">
        <Bell size={48} className="mx-auto mb-2 opacity-50" />
        <p>暂无提醒记录</p>
        <p className="text-sm">开始工作后，这里会显示你的提醒历史</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-ink-50 rounded-xl text-center">
          <p className="text-2xl font-bold text-ink-700">{stats.total}</p>
          <p className="text-xs text-ink-500">总提醒数</p>
        </div>
        <div className="p-3 bg-green-50 rounded-xl text-center">
          <p className="text-2xl font-bold text-green-600">{stats.shown}</p>
          <p className="text-xs text-green-600">已弹出</p>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.suppressed}</p>
          <p className="text-xs text-amber-600">已压制</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-xl text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.focusSuppressed}</p>
          <p className="text-xs text-purple-600">专注模式压制</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-ink-400" />
          <span className="text-sm text-ink-500">类型:</span>
          <div className="flex flex-wrap gap-1">
            {allTypes.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-warm-100 text-ink-600 hover:bg-warm-200'
                }`}
              >
                {type === 'all' ? '全部' : typeConfig[type].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-ink-500">状态:</span>
        <div className="flex flex-wrap gap-1">
          {allStatuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                statusFilter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-warm-100 text-ink-600 hover:bg-warm-200'
              }`}
            >
              {status === 'all' ? '全部' : statusConfig[status].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <p className="text-center text-ink-400 py-4">没有符合条件的记录</p>
        ) : (
          filteredLogs.map((log, index) => {
            const typeInfo = typeConfig[log.type];
            const statusInfo = statusConfig[log.status];
            const TypeIcon = typeInfo.icon;
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  log.status === 'suppressed'
                    ? 'bg-amber-50 border-amber-100'
                    : log.status === 'failed'
                    ? 'bg-red-50 border-red-100'
                    : 'bg-white border-warm-100'
                }`}
              >
                <div className={`p-2 rounded-full ${typeInfo.color}`}>
                  <TypeIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-700 truncate">{log.title}</p>
                    <StatusIcon size={14} className={statusInfo.color} />
                  </div>
                  <p className="text-xs text-ink-400 truncate">{log.body}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-ink-400">{formatTime(log.timestamp)}</span>
                    <span className="text-xs text-ink-300">•</span>
                    <span className={`text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                    {log.suppressedReason && (
                      <>
                        <span className="text-xs text-ink-300">•</span>
                        <span className="text-xs text-amber-500">
                          {log.suppressedReason === 'focus_mode' ? '专注模式' :
                           log.suppressedReason === 'outside_work_hours' ? '非工作时段' : '未工作'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

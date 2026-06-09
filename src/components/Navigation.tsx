import React from 'react';
import { motion } from 'framer-motion';
import { ViewType } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import {
  LayoutDashboard,
  Clock,
  PersonStanding,
  Eye,
  Dumbbell,
  TrendingUp,
  Settings,
} from 'lucide-react';

const navItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'today', label: '今日状态', icon: <LayoutDashboard size={18} /> },
  { id: 'rest', label: '休息计划', icon: <Clock size={18} /> },
  { id: 'posture', label: '姿势记录', icon: <PersonStanding size={18} /> },
  { id: 'eye', label: '眼保健操', icon: <Eye size={18} /> },
  { id: 'stretch', label: '拉伸动作', icon: <Dumbbell size={18} /> },
  { id: 'trend', label: '趋势报告', icon: <TrendingUp size={18} /> },
  { id: 'settings', label: '提醒设置', icon: <Settings size={18} /> },
];

export const Navigation: React.FC = () => {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink-700">健康管理助手</h1>
              <p className="text-xs text-ink-400">关爱设计师的每一天</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`tab-button flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${currentView === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {currentView === item.id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

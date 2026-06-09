import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'accent' | 'ink';
  delay?: number;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  unit,
  color = 'primary',
  delay = 0,
  subtext,
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-500',
    accent: 'bg-accent-50 text-accent-500',
    ink: 'bg-ink-100 text-ink-500',
  };

  return (
    <motion.div
      className="card animate-slide-up"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-400 font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-ink-700">{value}</span>
            {unit && <span className="text-sm text-ink-400">{unit}</span>}
          </div>
          {subtext && <p className="text-xs text-ink-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

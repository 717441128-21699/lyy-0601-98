import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { TodayStatus } from '@/pages/TodayStatus';
import { RestPlan } from '@/pages/RestPlan';
import { PostureRecord } from '@/pages/PostureRecord';
import { EyeExercise } from '@/pages/EyeExercise';
import { Stretching } from '@/pages/Stretching';
import { TrendReport } from '@/pages/TrendReport';
import { Settings } from '@/pages/Settings';
import { useAppStore } from '@/store/useAppStore';
import { useReminder } from '@/hooks/useReminder';

export default function App() {
  const { currentView, saveTodayRecord } = useAppStore();
  useReminder();

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveTodayRecord();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveTodayRecord]);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveTodayRecord();
    }, 60000);
    return () => clearInterval(saveInterval);
  }, [saveTodayRecord]);

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return <TodayStatus />;
      case 'rest':
        return <RestPlan />;
      case 'posture':
        return <PostureRecord />;
      case 'eye':
        return <EyeExercise />;
      case 'stretch':
        return <Stretching />;
      case 'trend':
        return <TrendReport />;
      case 'settings':
        return <Settings />;
      default:
        return <TodayStatus />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 to-warm-200">
      <Navigation />
      <main className="pb-8">
        {renderView()}
      </main>
    </div>
  );
}

export const getTodayString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}小时${mins}分钟`;
  }
  return `${mins}分钟`;
};

export const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const getLast7Days = (): string[] => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(`${date.getMonth() + 1}/${date.getDate()}`);
  }
  return days;
};

export const formatDuration = (startTimestamp: number, endTimestamp: number): string => {
  const diffMs = endTimestamp - startTimestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const remainingSeconds = diffSeconds % 60;
  
  if (diffMinutes > 60) {
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}小时${mins}分钟`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

export const formatTimeOfDay = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const isInTimeRange = (start: string, end: string): boolean => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

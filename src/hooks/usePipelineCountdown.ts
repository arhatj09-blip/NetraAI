import { useState, useEffect } from 'react';

export const usePipelineCountdown = (initialSeconds: number = 522) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [lastSync, setLastSync] = useState('11:45 PM');
  const [nextSync, setNextSync] = useState('12:00 AM');
  const [recordsCount, setRecordsCount] = useState(274392);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger refresh simulation
          setIsRefreshing(true);
          setTimeout(() => {
            const now = new Date();
            const lastStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            now.setMinutes(now.getMinutes() + 15);
            const nextStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastSync(lastStr);
            setNextSync(nextStr);
            setRecordsCount((c) => c + Math.floor(Math.random() * 300) + 150);
            setIsRefreshing(false);
          }, 2000);
          return 900; // Reset to 15 minutes (900s)
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate SVG stroke offset for 900s cycle
  // Total circumference for r=88 is 2 * PI * 88 = ~552.92
  const totalCircumference = 552.92;
  const progressRatio = secondsLeft / 900;
  const strokeDashoffset = totalCircumference * (1 - progressRatio);

  return {
    secondsLeft,
    formattedTime,
    lastSync,
    nextSync,
    recordsCount,
    isRefreshing,
    strokeDashoffset,
    totalCircumference,
  };
};

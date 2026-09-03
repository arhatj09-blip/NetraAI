import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface PipelineStatus {
  last_ingestion: string;
  next_refresh: string;
  records_processed: number;
}

export const usePipelineCountdown = (initialSeconds: number = 522) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [lastSync, setLastSync] = useState('11:45 PM');
  const [nextSync, setNextSync] = useState('12:00 AM');
  const [recordsCount, setRecordsCount] = useState(274392);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const applyPipelineStatus = (status: PipelineStatus) => {
      const nextRefresh = new Date(status.next_refresh).getTime();
      const secondsUntilRefresh = Math.max(0, Math.ceil((nextRefresh - Date.now()) / 1000));
      const lastIngestion = new Date(status.last_ingestion);

      if (!isMounted || Number.isNaN(nextRefresh) || Number.isNaN(lastIngestion.getTime())) return;

      setSecondsLeft(secondsUntilRefresh);
      setLastSync(lastIngestion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setNextSync(new Date(nextRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setRecordsCount(status.records_processed);
      setIsRefreshing(false);
    };

    const fetchPipelineStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/pipeline/status`);
        if (!response.ok) return;
        applyPipelineStatus(await response.json() as PipelineStatus);
      } catch {
        // Keep the local countdown running when the backend is unavailable.
      }
    };

    void fetchPipelineStatus();
    const statusPoller = window.setInterval(() => void fetchPipelineStatus(), 15000);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRefreshing(true);
          void fetchPipelineStatus();
          return 1;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
      clearInterval(statusPoller);
    };
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

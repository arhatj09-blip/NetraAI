import React, { useState } from 'react';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { isValidDateRange, getDateRangeDisplay } from '../../utils/dateRangeUtils';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onApply: (startDate: string, endDate: string) => void;
  disabled?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onApply,
  disabled = false,
}) => {
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [isApplying, setIsApplying] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleApply = () => {
    setValidationError(null);

    if (!tempStartDate || !tempEndDate) {
      setValidationError('Both dates are required');
      return;
    }

    if (!isValidDateRange(tempStartDate, tempEndDate)) {
      setValidationError('Start date must be before or equal to end date');
      return;
    }

    setIsApplying(true);
    setTimeout(() => {
      onApply(tempStartDate, tempEndDate);
      setIsApplying(false);
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Date Range Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
          Analysis Period
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex flex-col">
              <label className="text-[9px] font-bold text-slate-400 uppercase">From</label>
              <input
                type="date"
                value={tempStartDate}
                onChange={(e) => {
                  setTempStartDate(e.target.value);
                  setValidationError(null);
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled || isApplying}
                className="bg-transparent text-xs text-slate-900 dark:text-white mono outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 flex-shrink-0"></div>

          <div className="flex flex-col">
            <label className="text-[9px] font-bold text-slate-400 uppercase">To</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={(e) => {
                setTempEndDate(e.target.value);
                setValidationError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={disabled || isApplying}
              className="bg-transparent text-xs text-slate-900 dark:text-white mono outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <button
          onClick={handleApply}
          disabled={disabled || isApplying}
          className="flex-shrink-0 p-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isApplying ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Apply</span>
        </button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 px-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">{validationError}</span>
        </div>
      )}

      {/* Display Active Range Info */}
      <div className="text-xs text-slate-500 dark:text-slate-400 px-4">
        Active Period: <span className="font-semibold text-slate-700 dark:text-slate-300">{getDateRangeDisplay(startDate, endDate)}</span>
      </div>
    </div>
  );
};

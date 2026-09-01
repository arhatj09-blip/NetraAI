/**
 * Utility functions for date range filtering and validation
 */

export interface DateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}

/**
 * Validate that startDate <= endDate
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end;
};

/**
 * Format date string from YYYY-MM-DD to display format
 */
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateStr: string): Date => {
  return new Date(dateStr);
};

/**
 * Check if a record's timestamp falls within the date range
 * This is a helper for when we have timestamp data
 */
export const isWithinDateRange = (
  recordTimestamp: string | number | Date,
  startDate: string,
  endDate: string
): boolean => {
  const recordDate = new Date(recordTimestamp);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set end date to end of day
  end.setHours(23, 59, 59, 999);
  
  return recordDate >= start && recordDate <= end;
};

/**
 * Get date range display string
 */
export const getDateRangeDisplay = (startDate: string, endDate: string): string => {
  const start = formatDateDisplay(startDate);
  const end = formatDateDisplay(endDate);
  return `${start} → ${end}`;
};

/**
 * Calculate number of days in range
 */
export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // inclusive
};

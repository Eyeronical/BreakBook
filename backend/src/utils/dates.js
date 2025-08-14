function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isPublicHoliday(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const holidays = [
    `${year}-01-01`,
    `${year}-01-26`,
    `${year}-08-15`,
    `${year}-10-02`,
    `${year}-12-25`
  ];
  
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return holidays.includes(dateStr);
}

function countWorkingDays(startDate, endDate) {
  if (startDate > endDate) {
    throw new Error('Start date cannot be after end date');
  }

  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (!isWeekend(current) && !isPublicHoliday(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

function monthsElapsedForAccrual(joiningDate, asOfDate = new Date()) {
  const start = new Date(joiningDate);
  const end = new Date(asOfDate);
  
  if (start > end) {
    return 0;
  }
  
  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();
  
  if (end.getDate() < start.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
}

function computeAccrued(annualQuota, monthsWorked) {
  if (annualQuota < 0 || monthsWorked < 0) {
    return 0;
  }
  
  return Math.floor((annualQuota / 12) * monthsWorked);
}

function getDateBounds(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

function dateRangesOverlap(start1, end1, start2, end2) {
  return start1 <= end2 && start2 <= end1;
}

function addWorkingDays(startDate, workingDays) {
  const result = new Date(startDate);
  let daysAdded = 0;
  
  while (daysAdded < workingDays) {
    result.setDate(result.getDate() + 1);
    if (!isWeekend(result) && !isPublicHoliday(result)) {
      daysAdded++;
    }
  }
  
  return result;
}

function getWorkingDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return countWorkingDays(firstDay, lastDay);
}

function formatDateForDisplay(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
}

function isValidDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }
  
  return start <= end;
}

module.exports = { 
  isWeekend, 
  isPublicHoliday,
  countWorkingDays, 
  monthsElapsedForAccrual, 
  computeAccrued,
  getDateBounds,
  dateRangesOverlap,
  addWorkingDays,
  getWorkingDaysInMonth,
  formatDateForDisplay,
  isValidDateRange
};

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function countWorkingDays(start, end) {
  let count = 0;
  let current = new Date(start);
  while (current <= end) {
    if (!isWeekend(current)) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function monthsElapsedForAccrual(joiningDate, asOfDate) {
  const start = new Date(Math.max(joiningDate, new Date(asOfDate.getFullYear(), 0, 1)));
  let months = (asOfDate.getFullYear() - start.getFullYear()) * 12;
  months += asOfDate.getMonth() - start.getMonth() + 1;
  return Math.max(0, months);
}

function computeAccrued(annualQuota, months) {
  return (annualQuota / 12) * months;
}

module.exports = { isWeekend, countWorkingDays, monthsElapsedForAccrual, computeAccrued };

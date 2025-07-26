// utils/dateFormatter.js
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (date, type = 'full') => {
  if (!date) return '';

  switch (type) {
    case 'relative':
      if(dayjs(date).fromNow() === 'a few seconds ago'){
        return 'just now'
      }
      return dayjs(date).fromNow();
    case 'time':
      return dayjs(date).format('h:mm A');
    case 'date':
      return dayjs(date).format('MMMM D, YYYY');
    case 'full':
    default:
      return dayjs(date).format('MMMM D, YYYY h:mm A');
  }
};

export function getDateDifferenceFormatted(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const diffTime = end - start;
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let parts = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);
  if (days > 0 || (years === 0 && months === 0)) parts.push(`${days} day${days > 1 ? 's' : ''}`);

  return parts.join(', ');
}

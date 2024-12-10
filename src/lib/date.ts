export const getRelativeTimeFromNowString = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  let value;
  let unit: Intl.RelativeTimeFormatUnit;

  if (diffInYears > 0) {
    value = diffInYears;
    unit = 'year';
  } else if (diffInMonths > 0) {
    value = diffInMonths;
    unit = 'month';
  } else if (diffInDays > 0) {
    value = diffInDays;
    unit = 'day';
  } else if (diffInHours > 0) {
    value = diffInHours;
    unit = 'hour';
  } else if (diffInMinutes > 0) {
    value = diffInMinutes;
    unit = 'minute';
  } else {
    value = diffInSeconds;
    unit = 'second';
  }

  const rtf = new Intl.RelativeTimeFormat();
  return rtf.format(-value, unit);
}

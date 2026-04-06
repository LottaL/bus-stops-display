export const getTimeAndDate = (date: Date, locale: string) => {
  const day = date.toLocaleDateString(locale, { weekday: 'long' });
  const dateStr = `${day}, ${date.getDate()} ${date.toLocaleDateString(locale, { month: 'long' })}\n\n`;

  const time = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    hour12: false,
    minute: 'numeric',
  });

  return {
    date: dateStr,
    time,
  };
};

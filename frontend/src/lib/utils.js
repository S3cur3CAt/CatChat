export function formatMessageTime(date) {
  console.log('Formatting date:', date, 'Type:', typeof date);
  const parsedDate = new Date(date);
  console.log('Parsed date:', parsedDate, 'Is valid:', !isNaN(parsedDate.getTime()));

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

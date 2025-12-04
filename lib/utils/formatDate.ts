export function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    const pad = (num: number): string => num.toString().padStart(2, "0");

    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear();
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());

    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  } catch {
    return "Invalid date";
  }
}

//used for formating Date object
export function formatDate(date: Date) {
  const rawDate = new Date(date);
  const year = rawDate.getFullYear();
  const month = rawDate.getMonth() + 1;
  const day = rawDate.getDate();
  // if greater than
  const hour =
    rawDate.getHours() > 12 ? rawDate.getHours() - 12 : rawDate.getHours();
  // am/pm
  const ampm = hour >= 12 ? "AM" : "PM";
  const minute = rawDate.getMinutes().toString().padStart(2, "0");
  return `${day}-${month}-${year} ${hour}:${minute} ${ampm}`;
  //in the format of day-month-year hour:minute PM/AM
}

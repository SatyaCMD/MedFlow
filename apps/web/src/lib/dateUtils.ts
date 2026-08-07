export function isTodayDate(dateStr?: string): boolean {
  if (!dateStr) return true;
  const clean = dateStr.trim().toLowerCase();
  if (clean === 'today') return true;

  try {
    const today = new Date();
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return true;

    return (
      today.getDate() === target.getDate() &&
      today.getMonth() === target.getMonth() &&
      today.getFullYear() === target.getFullYear()
    );
  } catch {
    return true;
  }
}

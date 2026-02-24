const toValidDate = (value: string): Date | null => {
  const raw = String(value || '').trim();
  if (!raw) return null;

  // 2026 M02 24 / 2026 M2 24
  const mDate = raw.match(/^(\d{4})\s*M\s*(\d{1,2})\s*(\d{1,2})$/i);
  if (mDate) {
    const year = Number(mDate[1]);
    const month = Number(mDate[2]);
    const day = Number(mDate[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // 2026-02-24 / 2026.02.24 / 2026/02/24
  const ymd = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]);
    const day = Number(ymd[3]);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatBlogDate = (value: string, uppercase = false) => {
  const parsed = toValidDate(value);
  if (!parsed) return String(value || '');
  const formatted = parsed.toLocaleDateString('az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return uppercase ? formatted.toUpperCase() : formatted;
};

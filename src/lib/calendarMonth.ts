export type YearMonth = { year: number; month: number };

export function addMonths(year: number, month: number, delta: number): YearMonth {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function isAfter(a: YearMonth, b: YearMonth): boolean {
  return a.year > b.year || (a.year === b.year && a.month > b.month);
}

// 未来の月への遷移は許可しない。不正な値・未来の月が渡されたら今日の年月にフォールバックする。
export function clampToTodayOrEarlier(
  candidate: { year?: number; month?: number },
  today: YearMonth,
): YearMonth {
  const { year, month } = candidate;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    (month as number) < 1 ||
    (month as number) > 12
  ) {
    return today;
  }
  const parsed = { year: year as number, month: month as number };
  return isAfter(parsed, today) ? today : parsed;
}

// カレンダーグリッドの日付セル（月曜始まり）。null は空白セル。
export function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month - 1, 1).getDay(); // Sun=0..Sat=6
  const leadingBlanks = (firstWeekday + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

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

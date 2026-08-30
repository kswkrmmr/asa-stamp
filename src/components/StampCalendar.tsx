import Link from "next/link";
import { StampMark } from "./StampMark";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

export function StampCalendar({
  year,
  month,
  stampedDates,
  today,
  prevHref,
  nextHref,
}: {
  year: number;
  month: number; // 1-12
  stampedDates: Set<string>;
  today: string; // "YYYY-MM-DD"
  prevHref: string;
  nextHref: string | null;
}) {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const firstWeekday = new Date(year, month - 1, 1).getDay(); // Sun=0..Sat=6
  const leadingBlanks = (firstWeekday + 6) % 7; // Mon=0..Sun=6
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="rounded-lg border border-paper-line bg-white/60 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={prevHref}
          aria-label="前の月"
          className="rounded px-2 py-1 text-ink-soft transition-colors hover:bg-paper-line/60"
        >
          ＜
        </Link>
        <p className="font-heading text-xl text-ink">
          {year}年{month}月
        </p>
        {nextHref ? (
          <Link
            href={nextHref}
            aria-label="次の月"
            className="rounded px-2 py-1 text-ink-soft transition-colors hover:bg-paper-line/60"
          >
            ＞
          </Link>
        ) : (
          <span aria-hidden="true" className="px-2 py-1 text-paper-line">
            ＞
          </span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-1 font-medium">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} />;
          }
          const dateStr = `${year}-${pad(month)}-${pad(day)}`;
          const stamped = stampedDates.has(dateStr);
          const isToday = dateStr === today;
          return (
            <div
              key={i}
              className={`relative flex aspect-square items-center justify-center rounded border bg-white/40 ${
                isToday ? "border-stamp" : "border-paper-line"
              }`}
            >
              <span className="absolute top-1 left-1 text-[10px] text-ink-soft">
                {day}
              </span>
              {stamped && <StampMark size="sm" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

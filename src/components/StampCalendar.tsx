import { StampMark } from "./StampMark";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

export function StampCalendar({
  year,
  month,
  stampedDates,
  today,
}: {
  year: number;
  month: number; // 1-12
  stampedDates: Set<string>;
  today: string; // "YYYY-MM-DD"
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
      <p className="mb-4 text-center font-heading text-xl text-ink">
        {year}年{month}月
      </p>
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

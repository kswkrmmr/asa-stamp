"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleStamp } from "@/app/admin/actions";
import { buildCalendarCells } from "@/lib/calendarMonth";
import { StampMark } from "@/components/StampMark";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

export function AdminStampCalendar({
  token,
  userId,
  year,
  month,
  initialStampedDates,
  today,
  prevHref,
  nextHref,
}: {
  token: string;
  userId: string;
  year: number;
  month: number; // 1-12
  initialStampedDates: string[];
  today: string; // "YYYY-MM-DD"
  prevHref: string;
  nextHref: string | null;
}) {
  const [stampedDates, setStampedDates] = useState(
    () => new Set(initialStampedDates),
  );
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pad = (n: number) => n.toString().padStart(2, "0");
  const cells = buildCalendarCells(year, month);

  function handleToggle(dateStr: string) {
    setError(null);
    setPendingDate(dateStr);
    startTransition(async () => {
      const result = await toggleStamp(token, userId, dateStr);
      setPendingDate(null);
      if (result.status === "error") {
        setError(result.error);
        return;
      }
      setStampedDates((prev) => {
        const next = new Set(prev);
        if (result.stamped) {
          next.add(dateStr);
        } else {
          next.delete(dateStr);
        }
        return next;
      });
    });
  }

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
      <p className="mb-2 text-xs text-ink-soft">
        日付をクリックでスタンプの追加/削除を切り替えられます（今日以前のみ）。
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
          const isFuture = dateStr > today;
          return (
            <button
              key={i}
              type="button"
              disabled={isFuture || isPending}
              onClick={() => handleToggle(dateStr)}
              aria-pressed={stamped}
              className={`relative flex aspect-square items-center justify-center rounded border bg-white/40 transition-colors ${
                isToday ? "border-stamp" : "border-paper-line"
              } ${isFuture ? "opacity-40" : "hover:bg-paper-line/60"} ${
                pendingDate === dateStr ? "opacity-60" : ""
              }`}
            >
              <span className="absolute top-1 left-1 text-[10px] text-ink-soft">
                {day}
              </span>
              {stamped && <StampMark size="sm" />}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-stamp-dark">
          {error}
        </p>
      )}
    </div>
  );
}

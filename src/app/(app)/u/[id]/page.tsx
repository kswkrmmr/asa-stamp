import { notFound } from "next/navigation";
import { db } from "@/prisma/db";
import { StampButton } from "@/components/StampButton";
import { StampCalendar } from "@/components/StampCalendar";
import { addMonths, clampToTodayOrEarlier } from "@/lib/calendarMonth";
import {
  formatStampWindow,
  getJstTodayString,
  getJstYearMonth,
  getStampWindow,
  isWithinStampWindowNow,
} from "@/lib/stampWindow";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UserPage({
  params,
  searchParams,
}: PageProps<"/u/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await db.orm.public.User.first({ id });

  if (!user) {
    notFound();
  }

  const todayYearMonth = getJstYearMonth();
  const { year, month } = clampToTodayOrEarlier(
    {
      year: Number(firstParam(sp.year)),
      month: Number(firstParam(sp.month)),
    },
    todayYearMonth,
  );

  const pad = (n: number) => n.toString().padStart(2, "0");
  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;

  const [stamps, window] = await Promise.all([
    db.orm.public.Stamp.where({ userId: id })
      .where((s) => s.stampedOn.gte(monthStart))
      .where((s) => s.stampedOn.lte(monthEnd))
      .select("stampedOn")
      .all(),
    getStampWindow(),
  ]);

  const stampedDates = new Set(stamps.map((s) => s.stampedOn));
  const today = getJstTodayString();
  const alreadyStampedToday = stampedDates.has(today);
  const canStampNow = isWithinStampWindowNow(window);

  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const isCurrentMonth =
    year === todayYearMonth.year && month === todayYearMonth.month;
  const prevHref = `/u/${id}?year=${prev.year}&month=${prev.month}`;
  const nextHref = isCurrentMonth
    ? null
    : `/u/${id}?year=${next.year}&month=${next.month}`;

  return (
    <div>
      <h1 className="font-heading text-3xl text-ink">
        {user.name} さんのスタンプカード
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        登録日: {dateFormatter.format(new Date(user.createdAt))}
      </p>

      <div className="mt-6">
        <StampButton
          userId={user.id}
          alreadyStampedToday={alreadyStampedToday}
          canStampNow={canStampNow}
          windowLabel={formatStampWindow(window)}
        />
      </div>

      <div className="mt-8 max-w-sm">
        <StampCalendar
          year={year}
          month={month}
          stampedDates={stampedDates}
          today={today}
          prevHref={prevHref}
          nextHref={nextHref}
        />
      </div>
    </div>
  );
}

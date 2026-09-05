import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/prisma/db";
import { isValidAdminToken } from "@/lib/adminAuth";
import { addMonths, clampToTodayOrEarlier } from "@/lib/calendarMonth";
import { getJstTodayString, getJstYearMonth } from "@/lib/stampWindow";
import { AdminStampCalendar } from "@/components/admin/AdminStampCalendar";
import { RenameUserForm } from "@/components/admin/RenameUserForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUserStampsPage({
  params,
  searchParams,
}: PageProps<"/admin/[token]/u/[userId]">) {
  const { token, userId } = await params;
  const sp = await searchParams;

  if (!isValidAdminToken(token)) {
    notFound();
  }

  const user = await db.orm.public.User.first({ id: userId });
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

  const stamps = await db.orm.public.Stamp.where({ userId })
    .where((s) => s.stampedOn.gte(monthStart))
    .where((s) => s.stampedOn.lte(monthEnd))
    .select("stampedOn")
    .all();

  const today = getJstTodayString();
  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const isCurrentMonth =
    year === todayYearMonth.year && month === todayYearMonth.month;
  const prevHref = `/admin/${token}/u/${userId}?year=${prev.year}&month=${prev.month}`;
  const nextHref = isCurrentMonth
    ? null
    : `/admin/${token}/u/${userId}?year=${next.year}&month=${next.month}`;

  return (
    <div className="min-h-screen bg-paper p-6 text-ink sm:p-10">
      <Link
        href={`/admin/${token}`}
        className="text-sm text-ink-soft underline decoration-dotted hover:text-ink"
      >
        ＜ 参加者一覧に戻る
      </Link>
      <h1 className="mt-2 font-heading text-3xl">{user.name} さん</h1>

      <section className="mt-8 max-w-md">
        <h2 className="font-heading text-2xl">名前の変更</h2>
        <p className="mt-1 text-sm text-ink-soft">
          誤字の修正や改名に使えます。スタンプはそのまま残ります。
        </p>
        <RenameUserForm token={token} userId={userId} currentName={user.name} />
      </section>

      <section className="mt-10 max-w-sm">
        <h2 className="font-heading text-2xl">スタンプ修正</h2>
        <p className="mt-1 mb-3 text-sm text-ink-soft">
          押し忘れ・誤って消えてしまった分などの手直し用です。
        </p>
        <AdminStampCalendar
          token={token}
          userId={userId}
          year={year}
          month={month}
          initialStampedDates={stamps.map((s) => s.stampedOn)}
          today={today}
          prevHref={prevHref}
          nextHref={nextHref}
        />
      </section>
    </div>
  );
}

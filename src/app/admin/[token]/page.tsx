import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/prisma/db";
import { isValidAdminToken } from "@/lib/adminAuth";
import { getStampWindow } from "@/lib/stampWindow";
import { DeleteUserButton } from "@/components/admin/DeleteUserButton";
import { StampWindowForm } from "@/components/admin/StampWindowForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function AdminPage({
  params,
}: PageProps<"/admin/[token]">) {
  const { token } = await params;

  if (!isValidAdminToken(token)) {
    notFound();
  }

  const [users, window] = await Promise.all([
    db.orm.public.User.select("id", "name", "createdAt")
      .orderBy((u) => u.createdAt.asc())
      .all(),
    getStampWindow(),
  ]);

  return (
    <div className="min-h-screen bg-paper p-6 text-ink sm:p-10">
      <h1 className="font-heading text-3xl">管理者ページ</h1>
      <p className="mt-1 text-sm text-ink-soft">
        このページのURLは他の人に共有しないでください。
      </p>

      <section className="mt-8 max-w-md">
        <h2 className="font-heading text-2xl">スタンプ可能時間帯</h2>
        <StampWindowForm token={token} window={window} />
      </section>

      <section className="mt-10 max-w-md">
        <h2 className="font-heading text-2xl">参加者一覧（{users.length}人）</h2>
        {users.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            まだ誰も登録していません。
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded border border-paper-line bg-white/60 px-4 py-2"
              >
                <div>
                  <Link
                    href={`/admin/${token}/u/${user.id}`}
                    className="underline decoration-dotted hover:text-stamp-dark"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    登録日: {dateFormatter.format(new Date(user.createdAt))}
                  </p>
                </div>
                <DeleteUserButton
                  token={token}
                  userId={user.id}
                  userName={user.name}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

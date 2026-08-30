import { notFound } from "next/navigation";
import { db } from "@/prisma/db";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function UserPage({ params }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const user = await db.orm.public.User.first({ id });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <h1 className="font-heading text-3xl text-ink">
        {user.name} さんのスタンプカード
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        登録日: {dateFormatter.format(new Date(user.createdAt))}
      </p>
      <p className="mt-6 rounded border border-dashed border-paper-line bg-white/50 p-6 text-ink-soft">
        カレンダーとスタンプ機能は次のステップで実装します。
      </p>
    </div>
  );
}

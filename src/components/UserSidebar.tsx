import { db } from "@/prisma/db";
import { getJstTodayString } from "@/lib/stampWindow";
import { RegisterForm } from "./RegisterForm";
import { UserList } from "./UserList";

export async function UserSidebar() {
  const [users, todayStamps] = await Promise.all([
    db.orm.public.User.select("id", "name", "createdAt")
      .orderBy((u) => u.createdAt.asc())
      .all(),
    db.orm.public.Stamp.where({ stampedOn: getJstTodayString() })
      .select("userId")
      .all(),
  ]);

  return (
    <aside className="w-full shrink-0 border-b border-paper-line bg-[#efe4c9] p-4 sm:w-64 sm:border-b-0 sm:border-r sm:p-6">
      <RegisterForm />

      <h2 className="mt-6 border-t border-paper-line pt-4 font-heading text-2xl text-ink">
        参加者
      </h2>
      <UserList
        users={users}
        stampedTodayUserIds={todayStamps.map((s) => s.userId)}
      />
    </aside>
  );
}

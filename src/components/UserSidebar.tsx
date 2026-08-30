import Link from "next/link";
import { db } from "@/prisma/db";
import { RegisterForm } from "./RegisterForm";

export async function UserSidebar() {
  const users = await db.orm.public.User.select("id", "name", "createdAt")
    .orderBy((u) => u.createdAt.asc())
    .all();

  return (
    <aside className="w-full shrink-0 border-b border-paper-line bg-[#efe4c9] p-4 sm:w-64 sm:border-b-0 sm:border-r sm:p-6">
      <h2 className="font-heading text-2xl text-ink">参加者</h2>
      {users.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          まだ誰も登録していません。
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/u/${user.id}`}
                className="block rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-line/60"
              >
                {user.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <RegisterForm />
    </aside>
  );
}

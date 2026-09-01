"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type User = {
  id: string;
  name: string;
  createdAt: string;
};

type SortKey = "createdAt" | "name";
type SortDir = "asc" | "desc";
type TodayFilter = "all" | "stamped" | "not-stamped";

const collator = new Intl.Collator("ja");

export function UserList({
  users,
  stampedTodayUserIds,
}: {
  users: User[];
  stampedTodayUserIds: string[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [todayFilter, setTodayFilter] = useState<TodayFilter>("all");

  const stampedToday = useMemo(
    () => new Set(stampedTodayUserIds),
    [stampedTodayUserIds],
  );

  const visibleUsers = useMemo(() => {
    const filtered = users.filter((user) => {
      if (search && !user.name.includes(search)) return false;
      if (todayFilter === "stamped" && !stampedToday.has(user.id))
        return false;
      if (todayFilter === "not-stamped" && stampedToday.has(user.id))
        return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const cmp =
        sortKey === "name"
          ? collator.compare(a.name, b.name)
          : a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [users, search, todayFilter, stampedToday, sortKey, sortDir]);

  return (
    <div>
      <div className="mt-3 flex items-center gap-1">
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="flex-1 rounded border border-paper-line bg-white/70 px-2 py-1 text-sm text-ink outline-none focus:border-stamp"
        >
          <option value="createdAt">登録日順</option>
          <option value="name">名前順</option>
        </select>
        <button
          type="button"
          onClick={() =>
            setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))
          }
          aria-label={sortDir === "asc" ? "昇順" : "降順"}
          title={sortDir === "asc" ? "昇順" : "降順"}
          className="rounded border border-paper-line bg-white/70 px-2 py-1 text-sm text-ink transition-colors hover:bg-paper-line/60"
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="名前で検索"
        className="mt-2 w-full rounded border border-paper-line bg-white/70 px-3 py-1.5 text-sm text-ink outline-none focus:border-stamp"
      />

      <div className="mt-2 flex gap-1 text-sm">
        {(
          [
            { value: "all", label: "すべて" },
            { value: "stamped", label: "済み" },
            { value: "not-stamped", label: "未" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setTodayFilter(option.value)}
            aria-pressed={todayFilter === option.value}
            className={`flex-1 rounded border px-2 py-1 transition-colors ${
              todayFilter === option.value
                ? "border-stamp bg-stamp text-paper"
                : "border-paper-line bg-white/70 text-ink hover:bg-paper-line/60"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleUsers.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          {users.length === 0
            ? "まだ誰も登録していません。"
            : "該当する参加者がいません。"}
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {visibleUsers.map((user) => (
            <li key={user.id}>
              <Link
                href={`/u/${user.id}`}
                className="flex items-center justify-between rounded px-2 py-1.5 text-ink transition-colors hover:bg-paper-line/60"
              >
                <span>{user.name}</span>
                {stampedToday.has(user.id) && (
                  <span
                    aria-label="今日スタンプ済み"
                    title="今日スタンプ済み"
                    className="text-stamp"
                  >
                    ●
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

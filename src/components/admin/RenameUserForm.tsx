"use client";

import { useActionState } from "react";
import { renameUser, type AdminActionState } from "@/app/admin/actions";
import { MAX_NAME_LENGTH } from "@/lib/userName";

const initialState: AdminActionState = { status: "idle", error: null };

export function RenameUserForm({
  token,
  userId,
  currentName,
}: {
  token: string;
  userId: string;
  currentName: string;
}) {
  const renameUserForUser = renameUser.bind(null, token, userId);
  const [state, formAction, pending] = useActionState(
    renameUserForUser,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
      <label htmlFor="name" className="flex flex-col text-sm text-ink-soft">
        名前
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={MAX_NAME_LENGTH}
          defaultValue={currentName}
          key={currentName}
          className="mt-1 w-56 rounded border border-paper-line bg-white/70 px-3 py-2 text-ink outline-none focus:border-stamp"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-stamp px-4 py-2 text-paper transition-colors hover:bg-stamp-dark disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存する"}
      </button>
      {state.status === "success" && (
        <p className="text-sm text-ink-soft">保存しました</p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-stamp-dark">
          {state.error}
        </p>
      )}
    </form>
  );
}

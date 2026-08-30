"use client";

import { useActionState } from "react";
import { deleteUser, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = { status: "idle", error: null };

export function DeleteUserButton({
  token,
  userId,
  userName,
}: {
  token: string;
  userId: string;
  userName: string;
}) {
  const deleteUserForUser = deleteUser.bind(null, token, userId);
  const [state, formAction, pending] = useActionState(
    deleteUserForUser,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `${userName} さんのスタンプカードを削除します。元に戻せませんがよろしいですか？`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="text-sm text-stamp-dark underline decoration-dotted hover:text-stamp disabled:opacity-50"
      >
        {pending ? "削除中…" : "削除"}
      </button>
      {state.status === "error" && (
        <p role="alert" className="mt-1 text-xs text-stamp-dark">
          {state.error}
        </p>
      )}
    </form>
  );
}

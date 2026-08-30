"use client";

import { useActionState } from "react";
import { updateStampWindow, type AdminActionState } from "@/app/admin/actions";
import type { StampWindow } from "@/lib/stampWindow";

const initialState: AdminActionState = { status: "idle", error: null };

export function StampWindowForm({
  token,
  window,
}: {
  token: string;
  window: StampWindow;
}) {
  const updateStampWindowForToken = updateStampWindow.bind(null, token);
  const [state, formAction, pending] = useActionState(
    updateStampWindowForToken,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-3 flex flex-wrap items-end gap-4"
    >
      <label className="flex flex-col text-sm text-ink-soft">
        開始
        <span className="mt-1 flex items-center gap-1">
          <input
            type="number"
            name="startHour"
            min={0}
            max={23}
            defaultValue={window.startHour}
            className="w-16 rounded border border-paper-line px-2 py-1 text-ink"
          />
          :
          <input
            type="number"
            name="startMinute"
            min={0}
            max={59}
            defaultValue={window.startMinute}
            className="w-16 rounded border border-paper-line px-2 py-1 text-ink"
          />
        </span>
      </label>
      <label className="flex flex-col text-sm text-ink-soft">
        終了
        <span className="mt-1 flex items-center gap-1">
          <input
            type="number"
            name="endHour"
            min={0}
            max={23}
            defaultValue={window.endHour}
            className="w-16 rounded border border-paper-line px-2 py-1 text-ink"
          />
          :
          <input
            type="number"
            name="endMinute"
            min={0}
            max={59}
            defaultValue={window.endMinute}
            className="w-16 rounded border border-paper-line px-2 py-1 text-ink"
          />
        </span>
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

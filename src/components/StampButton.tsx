"use client";

import { useActionState, useEffect, useState } from "react";
import { pressStamp, type PressStampState } from "@/app/actions";
import { StampMark } from "./StampMark";

const initialState: PressStampState = { status: "idle", error: null };

export function StampButton({
  userId,
  alreadyStampedToday,
  canStampNow,
  windowLabel,
}: {
  userId: string;
  alreadyStampedToday: boolean;
  canStampNow: boolean;
  windowLabel: string;
}) {
  const pressStampForUser = pressStamp.bind(null, userId);
  const [state, formAction, pending] = useActionState(
    pressStampForUser,
    initialState,
  );
  const [justStamped, setJustStamped] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      setJustStamped(true);
    }
  }, [state.status]);

  const showStamp = alreadyStampedToday || justStamped;

  if (showStamp) {
    return (
      <div className="flex items-center gap-3">
        <StampMark size="lg" animate={justStamped} />
        <p className="text-ink-soft">今日のスタンプは押しました</p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending || !canStampNow}
        className="rounded-full bg-stamp px-6 py-3 font-heading text-xl text-paper transition-colors hover:bg-stamp-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "押しています…" : "⭐ スタンプを押す"}
      </button>
      {!canStampNow && (
        <p className="mt-2 text-sm text-ink-soft">
          スタンプが押せるのは {windowLabel} の間だけです
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-stamp-dark">
          {state.error}
        </p>
      )}
    </form>
  );
}

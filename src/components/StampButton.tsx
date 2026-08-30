"use client";

import { useActionState, useEffect, useState } from "react";
import {
  pressStamp,
  removeTodayStamp,
  type PressStampState,
  type RemoveStampState,
} from "@/app/actions";
import { StampMark } from "./StampMark";

const initialPressState: PressStampState = { status: "idle", error: null };
const initialRemoveState: RemoveStampState = { status: "idle", error: null };

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
  const removeStampForUser = removeTodayStamp.bind(null, userId);

  const [pressState, pressAction, pressPending] = useActionState(
    pressStampForUser,
    initialPressState,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeStampForUser,
    initialRemoveState,
  );

  const [justStamped, setJustStamped] = useState(false);

  useEffect(() => {
    if (pressState.status === "success") {
      setJustStamped(true);
    }
  }, [pressState.status]);

  useEffect(() => {
    if (removeState.status === "success") {
      setJustStamped(false);
    }
  }, [removeState.status]);

  const showStamp = alreadyStampedToday || justStamped;

  if (showStamp) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <StampMark size="lg" animate={justStamped} />
          <p className="text-ink-soft">今日のスタンプは押しました</p>
        </div>
        <form action={removeAction}>
          <button
            type="submit"
            disabled={removePending}
            className="text-left text-sm text-ink-soft underline decoration-dotted underline-offset-2 hover:text-stamp-dark disabled:opacity-50"
          >
            {removePending
              ? "取り消しています…"
              : "押し間違えた場合はこちら（取り消す）"}
          </button>
          {removeState.status === "error" && (
            <p role="alert" className="mt-1 text-sm text-stamp-dark">
              {removeState.error}
            </p>
          )}
        </form>
      </div>
    );
  }

  return (
    <form action={pressAction}>
      <button
        type="submit"
        disabled={pressPending || !canStampNow}
        className="rounded-full bg-stamp px-6 py-3 font-heading text-xl text-paper transition-colors hover:bg-stamp-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pressPending ? "押しています…" : "⭐ スタンプを押す"}
      </button>
      {!canStampNow && (
        <p className="mt-2 text-sm text-ink-soft">
          スタンプが押せるのは {windowLabel} の間だけです
        </p>
      )}
      {pressState.status === "error" && (
        <p role="alert" className="mt-2 text-sm text-stamp-dark">
          {pressState.error}
        </p>
      )}
    </form>
  );
}

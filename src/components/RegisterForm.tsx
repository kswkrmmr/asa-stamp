"use client";

import { useActionState } from "react";
import { registerUser, type RegisterState } from "@/app/actions";

const initialState: RegisterState = { error: null };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerUser,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 border-t border-paper-line pt-4">
      <label
        htmlFor="name"
        className="block font-heading text-lg text-ink-soft"
      >
        名前を入力してください
      </label>
      <input
        id="name"
        name="name"
        type="text"
        required
        maxLength={20}
        placeholder="例：まもる"
        className="mt-2 w-full rounded border border-paper-line bg-white/70 px-3 py-2 text-ink outline-none focus:border-stamp"
      />
      {state.error && (
        <p role="alert" className="mt-2 text-sm text-stamp-dark">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-3 w-full rounded bg-stamp px-3 py-2 font-heading text-lg text-paper transition-colors hover:bg-stamp-dark disabled:opacity-50"
      >
        {pending ? "登録中…" : "登録する"}
      </button>
    </form>
  );
}

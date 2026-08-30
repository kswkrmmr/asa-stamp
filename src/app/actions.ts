"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import {
  getJstTodayString,
  getStampWindow,
  isWithinStampWindowNow,
  formatStampWindow,
} from "@/lib/stampWindow";

export type RegisterState = {
  error: string | null;
};

const MAX_NAME_LENGTH = 20;

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "名前を入力してください" };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `名前は${MAX_NAME_LENGTH}文字以内で入力してください` };
  }

  try {
    await db.orm.public.User.create({ name });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "その名前はすでに登録されています" };
    }
    throw err;
  }

  revalidatePath("/", "layout");
  return { error: null };
}

// Postgres SQLSTATE 23505 = unique_violation
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "sqlState" in err &&
    (err as { sqlState?: unknown }).sqlState === "23505"
  );
}

export type PressStampState = {
  status: "idle" | "success" | "error";
  error: string | null;
};

export async function pressStamp(
  userId: string,
  _prevState: PressStampState,
  _formData: FormData,
): Promise<PressStampState> {
  const window = await getStampWindow();
  if (!isWithinStampWindowNow(window)) {
    return {
      status: "error",
      error: `スタンプが押せるのは ${formatStampWindow(window)} の間だけです`,
    };
  }

  try {
    await db.orm.public.Stamp.create({
      userId,
      stampedOn: getJstTodayString(),
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { status: "error", error: "今日のスタンプはもう押されています" };
    }
    throw err;
  }

  revalidatePath(`/u/${userId}`);
  return { status: "success", error: null };
}

export type RemoveStampState = {
  status: "idle" | "success" | "error";
  error: string | null;
};

// 押し間違えた場合の取り消し。当日分のみ対象（過去日は対象外）。
export async function removeTodayStamp(
  userId: string,
  _prevState: RemoveStampState,
  _formData: FormData,
): Promise<RemoveStampState> {
  const today = getJstTodayString();
  const existing = await db.orm.public.Stamp.where({
    userId,
    stampedOn: today,
  }).first();

  if (!existing) {
    return { status: "error", error: "今日のスタンプが見つかりませんでした" };
  }

  await db.orm.public.Stamp.where({ id: existing.id }).delete();

  revalidatePath(`/u/${userId}`);
  return { status: "success", error: null };
}

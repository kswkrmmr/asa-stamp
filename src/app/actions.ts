"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { isUniqueViolation } from "@/lib/dbError";
import { validateUserName } from "@/lib/userName";
import {
  getJstTodayString,
  getStampWindow,
  isWithinStampWindowNow,
  formatStampWindow,
} from "@/lib/stampWindow";

export type RegisterState = {
  error: string | null;
};

export async function registerUser(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const validated = validateUserName(formData.get("name"));
  if (!validated.ok) {
    return { error: validated.error };
  }

  try {
    await db.orm.public.User.create({ name: validated.name });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "その名前はすでに登録されています" };
    }
    throw err;
  }

  revalidatePath("/", "layout");
  return { error: null };
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

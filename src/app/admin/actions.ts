"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { isValidAdminToken } from "@/lib/adminAuth";
import { getJstTodayString } from "@/lib/stampWindow";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  error: string | null;
};

export async function deleteUser(
  token: string,
  userId: string,
  _prevState: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  if (!isValidAdminToken(token)) {
    return { status: "error", error: "権限がありません" };
  }

  await db.orm.public.User.where({ id: userId }).delete();

  revalidatePath(`/admin/${token}`);
  return { status: "success", error: null };
}

export type ToggleStampState = {
  status: "idle" | "success" | "error";
  error: string | null;
  stamped: boolean;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// 管理者による、押し忘れ・誤爆消しの手直し用。一般ユーザー向けの
// 「当日・時間帯内のみ」の制約は適用しない。過去日のみ許可（未来日は対応不要なため）。
export async function toggleStamp(
  token: string,
  userId: string,
  date: string,
): Promise<ToggleStampState> {
  if (!isValidAdminToken(token)) {
    return { status: "error", error: "権限がありません", stamped: false };
  }
  if (!DATE_PATTERN.test(date) || date > getJstTodayString()) {
    return { status: "error", error: "日付が不正です", stamped: false };
  }

  const existing = await db.orm.public.Stamp.where({
    userId,
    stampedOn: date,
  }).first();

  if (existing) {
    await db.orm.public.Stamp.where({ id: existing.id }).delete();
  } else {
    await db.orm.public.Stamp.create({ userId, stampedOn: date });
  }

  revalidatePath(`/admin/${token}/u/${userId}`);
  revalidatePath(`/u/${userId}`);
  return { status: "success", error: null, stamped: !existing };
}

function isValidHour(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 23;
}

function isValidMinute(n: number): boolean {
  return Number.isInteger(n) && n >= 0 && n <= 59;
}

export async function updateStampWindow(
  token: string,
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!isValidAdminToken(token)) {
    return { status: "error", error: "権限がありません" };
  }

  const startHour = Number(formData.get("startHour"));
  const startMinute = Number(formData.get("startMinute"));
  const endHour = Number(formData.get("endHour"));
  const endMinute = Number(formData.get("endMinute"));

  if (
    !isValidHour(startHour) ||
    !isValidMinute(startMinute) ||
    !isValidHour(endHour) ||
    !isValidMinute(endMinute)
  ) {
    return { status: "error", error: "時刻の形式が正しくありません" };
  }
  if (startHour * 60 + startMinute > endHour * 60 + endMinute) {
    return { status: "error", error: "開始時刻は終了時刻より前にしてください" };
  }

  const existing = await db.orm.public.AdminSetting.first({ id: 1 });
  if (existing) {
    await db.orm.public.AdminSetting.where({ id: 1 }).update({
      startHour,
      startMinute,
      endHour,
      endMinute,
    });
  } else {
    await db.orm.public.AdminSetting.create({
      id: 1,
      startHour,
      startMinute,
      endHour,
      endMinute,
    });
  }

  revalidatePath(`/admin/${token}`);
  return { status: "success", error: null };
}

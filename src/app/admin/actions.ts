"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/prisma/db";
import { isValidAdminToken } from "@/lib/adminAuth";

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

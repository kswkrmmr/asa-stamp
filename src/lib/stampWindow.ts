import { db } from "@/prisma/db";

export type StampWindow = {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
};

const DEFAULT_WINDOW: StampWindow = {
  startHour: 6,
  startMinute: 0,
  endHour: 9,
  endMinute: 0,
};

const ADMIN_SETTING_ID = 1;

export async function getStampWindow(): Promise<StampWindow> {
  const setting = await db.orm.public.AdminSetting.first({
    id: ADMIN_SETTING_ID,
  });
  if (!setting) return DEFAULT_WINDOW;
  return {
    startHour: setting.startHour,
    startMinute: setting.startMinute,
    endHour: setting.endHour,
    endMinute: setting.endMinute,
  };
}

export function formatStampWindow(window: StampWindow): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(window.startHour)}:${pad(window.startMinute)}〜${pad(window.endHour)}:${pad(window.endMinute)}`;
}

function getJstParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function getJstYearMonth(): { year: number; month: number } {
  const { year, month } = getJstParts();
  return { year, month };
}

export function getJstTodayString(): string {
  const { year, month, day } = getJstParts();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function isWithinStampWindowNow(window: StampWindow): boolean {
  const { hour, minute } = getJstParts();
  const nowMinutes = hour * 60 + minute;
  const startMinutes = window.startHour * 60 + window.startMinute;
  const endMinutes = window.endHour * 60 + window.endMinute;
  return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
}

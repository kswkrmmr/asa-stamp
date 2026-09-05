export const MAX_NAME_LENGTH = 20;

export type NameValidation =
  | { ok: true; name: string }
  | { ok: false; error: string };

// 登録時と管理画面での改名で同じルールを使う。
export function validateUserName(raw: unknown): NameValidation {
  const name = String(raw ?? "").trim();

  if (!name) {
    return { ok: false, error: "名前を入力してください" };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      error: `名前は${MAX_NAME_LENGTH}文字以内で入力してください`,
    };
  }

  return { ok: true, name };
}

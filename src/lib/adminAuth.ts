// 管理者ページの認証方式は「推測不可能な秘密URLを知っているかどうか」のみ。
// ログインフォームやセッションは持たない（アプリ全体の「認証なし」方針に合わせている）。
export function isValidAdminToken(token: string): boolean {
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret) && token === secret;
}

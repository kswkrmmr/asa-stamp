# 朝活スタンプカード 

RUNTEQ内で開催する「朝活もくもく会」の参加記録を、昔のラジオ体操カードのようにスタンプで残す、遊び心重視のWebアプリです。

AI駆動開発（Claude Codeとの協働）の学習・実践プロジェクトとして開発しています。

## コンセプト

「電子版ラジオ体操カード」

- 朝活に参加したら、自分のカードにスタンプを押す
- 他の参加者のカードも見られて、スタンプを押すこともできる
- 厳密な出席証明ではなく、コミュニティで楽しむための記録として運用する（性善説）
- ログイン・アカウント認証は無し。名前を登録するだけで使える

## 主な機能

- 名前を登録してスタンプカードを作成（重複名は登録不可）
- 参加者一覧からカードを選んで閲覧
- 当日・管理者が設定した時間帯（初期値 06:00〜09:00, JST）のみスタンプを押せる
- 1ユーザー・1日につきスタンプは1個まで
- 押し間違えた場合、当日中なら取り消し可能
- 月ごとのカレンダー表示（前月・翌月へ移動可、未来の月へは進めない）
- 管理者ページ（秘密URLでのみアクセス可能）からユーザー削除・スタンプ可能時間帯の変更

## 技術スタック

- [Next.js](https://nextjs.org/) (App Router, TypeScript) + [Tailwind CSS](https://tailwindcss.com/)
- [Prisma 8 (Prisma Next)](https://www.prisma.io/) + PostgreSQL
  - ローカル: Docker ComposeのPostgres
  - 本番: [Vercel](https://vercel.com/) + [Neon](https://neon.tech/) Postgres（Vercel Marketplace経由）

## セットアップ

### 必要なもの

- Node.js
- Docker（ローカルDB用）

### 手順

```bash
npm install

# ローカルDB（Postgres）を起動
docker compose up -d db

# 環境変数ファイルを用意
cp .env.example .env
# .env の ADMIN_SECRET は好きなランダム文字列に変更してください

# DBにスキーマを反映
npx prisma db init

# 開発サーバーを起動
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

管理者ページには `/admin/<.envのADMIN_SECRETの値>` からアクセスできます（このURLは他の人に共有しないでください）。

## 開発フロー

機能ごとにブランチを切り、プルリクエストを作成する運用にしています。

```bash
git checkout -b feature/xxx
# 実装・コミット
git push -u origin feature/xxx
gh pr create
```

## デプロイ

Vercel + Neon Postgres にデプロイしています。GitHubリポジトリと連携済みのため、`main` ブランチへのマージで自動的に本番デプロイされます。

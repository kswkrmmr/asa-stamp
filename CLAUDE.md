@AGENTS.md

# 朝活スタンプカード (asa-stamp)

RUNTEQ内の朝活参加記録を、昔のラジオ体操カードのように「スタンプ」で残す遊び心重視のWebアプリ。
出席証明ではなく、コミュニティで楽しむための記録として運用する（性善説）。

このプロジェクトはAI駆動開発（Claude Codeとの協働）の学習・実践を目的としている。
仕様・設計思想はユーザー側で決定し、実装・テスト・リファクタリング・レビューをClaude Codeが担当する。
技術選定や設計についてClaude Codeから提案する場合も、最終判断は必ずユーザーが行う。実装前に確認すること。

## 大切にしたい設計思想
- 懐かしさ: 昔のラジオ体操カードを思い出すデザイン・スタンプ演出
- 気軽さ: アカウント登録・ログインを極力なくす
- ゆるさ: 厳密な出席管理はしない。性善説で運用する
- コミュニティ感: 他人のカードを見られる、他人のカードにもスタンプを押せる
- スタンプを押す楽しさ: 朱肉スタンプ風の見た目と「ポンッ」というアニメーション

## 重要な設計決定（ここが仕様の肝）
- **ログイン・セッション・認証は一切なし**。ユーザー識別のための localStorage / Cookie も使わない。
  「登録」は単にユーザー名のレコードとスタンプカードを1つ作るだけの行為。
  自分のカードに押す場合も、他人のカードに押す場合も、一覧から名前を選んで開く同一の導線・同一のUIで行う。
  「今どのユーザーとしてログイン中か」という状態をシステムは一切持たない。
- ユーザー名の重複登録は禁止（登録時にエラー）。
- スタンプに「誰が押したか」は記録しない。
- 1ユーザー・1日につきスタンプは1個まで。同日に複数人がほぼ同時に押そうとした場合は先着1件のみ成立し、後続は「既に押されています」というエラーにする（DB側でuser_id+dateのunique制約を必須とする）。
- スタンプが押せるのは当日のみ、かつ管理者が設定した時間帯のみ（初期値 6:00〜9:00, JST）。過去日への後押しは不可。
- 実際に朝活に参加したかどうかの確認はシステム側では一切行わない（意図的な仕様）。
- 管理者機能は非公開の管理者専用URLから提供する。通常のユーザー導線からはリンクしない。
  必須機能: ユーザー一覧確認、ユーザー削除、スタンプ可能時間帯の設定。
  通常ユーザーは自分・他人問わずユーザーを削除できない。

## MVPスコープ外（実装しない）
ログイン/パスワード/外部ログイン、チャット機能、朝活イベントの作成・管理、GPS等による厳密な参加確認、
スタンプを押した人の記録、ランキング機能、通知、SNS共有。
将来的な拡張候補（今は着手しない）: 「スタンプ職人ランキング」など。

## 技術スタック
- Next.js (App Router, TypeScript) + Tailwind CSS
- Prisma 8 (Prisma Next / Composerではなく素のORM機能のみ使用) + PostgreSQL
  - 本番: Vercel Postgres (Neon)。無料枠運用を前提とし、アイドル時のオートサスペンド（デフォルト約5分でスリープ）は許容する。常時起動化のための外形監視（UptimeRobot等)は行わない。無料枠の月間コンピュート時間上限（目安200時間弱/月）を消費してしまうため。
  - ローカル開発: Docker Compose (`docker-compose.yml`) でPostgres 16をポート**5433**（別プロジェクト`ainote`がローカルの5432を使用中のため）で起動し、本番と同じDBエンジンで開発する。
- デプロイ先: Vercel（Hobby/無料枠）
- スタンプ演出: 軽量なReactコンポーネント + CSSアニメーションで実装。重量級ライブラリは使わない。

## データモデル方針（実装時の出発点）
- User: id, name (unique), createdAt
- Stamp: id, userId (FK, onDelete: Cascade), stampedOn (`DateString`型。"YYYY-MM-DD"のJST基準の暦日文字列。時刻・TZを持たない), createdAt / unique制約 (userId, stampedOn)
- AdminSetting (id固定・単一行運用): startHour/startMinute/endHour/endMinute（初期値 06:00–09:00）, updatedAt

## Prisma 8 (Prisma Next) に関する重要な注意
このプロジェクトの学習データ基準日以降に Prisma が「Prisma Next」として大きく作り替えられている（`schema.prisma`→`contract.prisma`、`prisma migrate`→`prisma migration`/`prisma db`、PrismaClientではなく`db.orm`/`db.sql`など）。**素のORM機能のみを使い、マルチサービス/独自クラウドデプロイの「Prisma Composer」機能は使わない**（このアプリの構成にそぐわないため）。実装前に `.claude/skills/prisma-8/SKILL.md` とそのreferencesを確認すること（`npx prisma skills sync` で最新化できる）。

このセッションで確認・確定した実装上の注意点:
- ファイル配置は canonical layout に合わせ `prisma.config.ts`（リポジトリ直下）+ `src/prisma/contract.prisma` + `src/prisma/db.ts` + `migrations/app/`。`prisma orm init` はデフォルトだとルート直下`prisma/`に生成してしまう既知の不具合があるため、`--schema-path src/prisma/contract.prisma` を使うか、後で移動すること。
- IDのデフォルト値は **`cuid()` は現バージョンでパースエラーになる**。`String @id @default(uuid())` を使うこと。
- 日付のみを表すカラムは `DateTime @db.Date` ではなく bare型を使うが、**`Date`（`pg/date-temporal@1` = `Temporal.PlainDate`）は使わない**こと。`@prisma/orm-target-postgres` のコーデックがグローバル`Temporal`を要求し（`typeof Temporal === "undefined"`で例外）、このNodeバージョン（v25）にはまだグローバルTemporalが無いため、実行時に例外になる（`Timestamp`/`Timestamptz`/`Time`のTemporal版も同様）。代わりに文字列版の **`DateString`**（`pg/date-string@1`、値は"YYYY-MM-DD"の生文字列）を使うこと。DDL上のネイティブ型は両者とも同じ`date`なので、既存DBがある場合でも`db update`だけで移行できる（マイグレーション不要）。
- 自動更新タイムスタンプは `@updatedAt` ではなく `updatedAt temporal.updatedAtString()`（型コンストラクタ呼び出し）という記法。こちらは文字列版なのでTemporal依存なし。
- クエリは `db.orm.<Model>` のフラット形式ではなく **`db.orm.public.<Model>`**（名前空間つき、`public`は暗黙のデフォルト名前空間）でアクセスする必要があった（このプロジェクトの実行環境で確認済み）。
- スキーマ変更時のコマンド: `npx prisma contract emit`（成果物再生成）→ 開発中の素早い反映は `npx prisma db update`、正式なマイグレーションは `npx prisma migration plan --name <slug>` → `npx prisma db migrate`。
  `db migrate` は単体では `db` refを進めない（`migration-model.md`参照）ため、**必ず `npx prisma db migrate --advance-ref db` を使うこと**。ref を進め忘れると、次の `migration plan` が `--from` 無指定時に空DB起点でプランしてしまい、既存テーブルとの重複でエラーになる（このセッションで発生済み。復旧は `migration ref set db <直近migrationのtoハッシュ>`）。
- ローカルDBはDocker Compose起動が前提（`docker compose up -d db`）。

## Next.js バージョンに関する注意
このプロジェクトは Next.js 16 系（React 19）。学習データより新しいため、実装前に `node_modules/next/dist/docs/` 配下の該当ドキュメントを確認すること（AGENTS.md参照）。

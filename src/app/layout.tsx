import type { Metadata } from "next";
import { Yomogi, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const yomogi = Yomogi({
  variable: "--font-yomogi",
  subsets: ["latin"],
  weight: "400",
});

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "朝活スタンプカード",
  description: "RUNTEQ版ラジオ体操カード。朝活に参加したらスタンプを押そう。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${yomogi.variable} ${zenMaru.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

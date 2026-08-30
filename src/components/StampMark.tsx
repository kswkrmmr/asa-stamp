import Image from "next/image";

const SIZE_PX = { sm: 24, md: 40, lg: 56 } as const;

// 仮のスタンプ画像。RUNTEQの許可が取れ次第、正式ならんてくんスタンプに差し替え予定（CLAUDE.md参照）。
// 白背景のPNGを mix-blend-mode: multiply で紙の背景になじませている。
export function StampMark({
  size = "md",
  animate = false,
}: {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}) {
  const px = SIZE_PX[size];

  return (
    <Image
      src="/stamp.png"
      alt="スタンプ済み"
      width={px}
      height={px}
      className={`stamp-mark inline-block shrink-0 ${animate ? "stamp-pop" : ""}`}
    />
  );
}

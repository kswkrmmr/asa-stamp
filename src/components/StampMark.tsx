import Image from "next/image";

const SIZE_PX = { sm: 24, md: 40, lg: 56 } as const;

// 仮のスタンプ画像。RUNTEQの許可が取れ次第、正式ならんてくんスタンプに差し替え予定（CLAUDE.md参照）。
// 透過PNGを object-fit: contain で正方形の枠に収め、mix-blend-mode: multiply で紙になじませている。
export function StampMark({
  size = "md",
  animate = false,
}: {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}) {
  const px = SIZE_PX[size];

  return (
    <span
      className={`stamp-mark relative inline-block shrink-0 ${animate ? "stamp-pop" : ""}`}
      style={{ width: px, height: px }}
    >
      <Image
        src="/stamp.png"
        alt="スタンプ済み"
        fill
        sizes={`${px}px`}
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}

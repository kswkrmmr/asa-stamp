// らんてくんの朱肉スタンプ画像が用意できるまでの仮デザイン（CLAUDE.md参照）。
export function StampMark({
  size = "md",
  animate = false,
}: {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}) {
  const sizeClass = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-10 w-10 text-lg",
    lg: "h-14 w-14 text-2xl",
  }[size];

  return (
    <span
      className={`stamp-mark inline-flex shrink-0 items-center justify-center font-bold ${sizeClass} ${animate ? "stamp-pop" : ""}`}
    >
      <span aria-hidden="true">参</span>
      <span className="sr-only">スタンプ済み</span>
    </span>
  );
}

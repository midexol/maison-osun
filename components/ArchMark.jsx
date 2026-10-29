// The house mark: a cluster of doorway arches, one in camwood red.
export default function ArchMark({ size = 30, className, mono = false }) {
  const arch = (x, y, red) => (
    <path
      key={`${x}-${y}`}
      d={`M${x} ${y + 9} a5 5 0 0 1 10 0 V${y + 18} H${x} Z`}
      fill={red && !mono ? "var(--camwood)" : "currentColor"}
    />
  );
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 34 40" aria-hidden="true">
      {arch(0, 2, false)}
      {arch(12, 0, false)}
      {arch(24, 2, false)}
      {arch(6, 21, false)}
      {arch(18, 21, true)}
    </svg>
  );
}

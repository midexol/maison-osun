import { INGREDIENTS } from "@/lib/data";

export default function Marquee() {
  const row = [...INGREDIENTS, ...INGREDIENTS];
  return (
    <div className="marquee" aria-label="Ingredients">
      <div className="track">
        {row.map((t, i) => (
          <span className="pill" key={i} aria-hidden={i >= INGREDIENTS.length}>{t}</span>
        ))}
      </div>
    </div>
  );
}

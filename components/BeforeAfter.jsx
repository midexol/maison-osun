"use client";
import { useCallback, useRef, useState } from "react";

// Drag (or use the keyboard) to compare the selfie with its 28-day simulation.
export default function BeforeAfter({ before, after, labelBefore = "Today", labelAfter = "Day 28" }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const drag = useRef(false);

  const moveTo = useCallback((clientX) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <div
      className="ba"
      ref={ref}
      onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); moveTo(e.clientX); }}
      onPointerMove={(e) => { if (drag.current) moveTo(e.clientX); }}
      onPointerUp={() => { drag.current = false; }}
      onPointerCancel={() => { drag.current = false; }}
    >
      <img src={after} alt="Your skin after 28 days, simulated" draggable={false} />
      <div className="ba-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="Your skin today" draggable={false} />
      </div>
      <span className="ba-tag left">{labelBefore}</span>
      <span className="ba-tag right">{labelAfter}</span>
      <div className="ba-handle" style={{ left: `${pos}%` }} aria-hidden="true"><span /></div>
      <input
        className="ba-range"
        type="range"
        min="0"
        max="100"
        value={Math.round(pos)}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare today with day 28"
      />
    </div>
  );
}

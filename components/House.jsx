"use client";
import { useState } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { BOTANICALS, MORE_BOTANICALS } from "@/lib/data";

const ALL = [...BOTANICALS, ...MORE_BOTANICALS];

// Ingredient index: one framed photo that swaps with the list, Veluno-style soft frame.
export default function House() {
  const [on, setOn] = useState(0);
  const b = ALL[on];
  return (
    <section className="house" id="house" aria-labelledby="houseTitle">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="mono">Ingredients</span>
          <h2 id="houseTitle">Six key <em>ingredients.</em></h2>
        </Reveal>
        <div className="index">
          <Reveal className="stage">
            {ALL.map((x, i) => (
              <div key={x.name} className="stage-layer" style={{ opacity: on === i ? 1 : 0 }}>
                <Photo name={x.photo} alt="" label="" sizes="(max-width: 900px) 92vw, 46vw" widths={[600, 1000, 1400]} />
              </div>
            ))}
            <div className="stage-label">
              <span className="mono">{String(on + 1).padStart(2, "0")} / {String(ALL.length).padStart(2, "0")}</span>
              <b>{b.name}</b>
              <span className="latin">{b.latin} · {b.origin}</span>
            </div>
          </Reveal>
          <ol>
            {ALL.map((x, i) => (
              <li key={x.name} className={on === i ? "on" : ""}>
                <button type="button" onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} onClick={() => setOn(i)} aria-expanded={on === i}>
                  <span className="no mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="nm">{x.name}</span>
                  <span className="og mono">{x.origin}</span>
                  {on === i && <span className="txt">{x.text}</span>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

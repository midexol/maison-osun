"use client";
import { useState } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { BOTANICALS, MORE_BOTANICALS } from "@/lib/data";

const ALL = [...BOTANICALS, ...MORE_BOTANICALS];

// Ingredient index: one large arched photo, a numbered list that swaps it on hover or tap.
export default function House() {
  const [on, setOn] = useState(0);
  return (
    <section className="wrap" id="house" aria-labelledby="houseTitle">
      <div className="house">
        <Reveal className="head">
          <h2 id="houseTitle">A house built on <em>camwood</em>, shea and patience.</h2>
          <p>Osùn is camwood, a red heartwood that West African families have pressed onto skin for generations. We keep that patience, source each botanical from the place it grows best, and add a reader that sees what the mirror misses.</p>
        </Reveal>
        <div className="index">
          <div className="stage" aria-hidden="true">
            {ALL.map((b, i) => (
              <div key={b.name} style={{ opacity: on === i ? 1 : 0 }}>
                <Photo name={b.photo} alt="" label={b.name} sizes="(max-width: 860px) 90vw, 40vw" widths={[480, 800, 1100]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
          <ol>
            {ALL.map((b, i) => (
              <li key={b.name} className={on === i ? "on" : ""}>
                <button type="button" onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} onClick={() => setOn(i)} aria-expanded={on === i}>
                  <span className="no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="nm">{b.name}</span>
                  <span className="og">{b.origin}</span>
                  {on === i && <span className="txt"><em style={{ fontStyle: "italic", color: "rgba(241,232,220,.5)" }}>{b.latin}.</em> {b.text}</span>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

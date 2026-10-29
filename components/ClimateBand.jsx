"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";

const CITIES = [
  ["Seoul", "Dry winters"], ["Lagos", "Heat and humidity"], ["London", "Hard water"],
  ["Dubai", "Desert air"], ["New York", "Indoor heating"], ["São Paulo", "Pollution"],
];

// Full-width photo band: one house, every climate.
export default function ClimateBand() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);
  return (
    <section className="wrap" style={{ marginTop: "1.25rem" }} aria-labelledby="climateTitle">
      <div ref={ref} className="climate">
        <motion.div className="climate-bg" style={{ y }}>
          <Photo name="skyline" alt="A city skyline at sunset over water" label="Every city" sizes="100vw" widths={[800, 1400, 2000]} />
        </motion.div>
        <div className="climate-shade" />
        <div className="climate-copy">
          <span className="eyebrow">One house, every climate</span>
          <h2 id="climateTitle">Your skin answers to <em>where you live.</em></h2>
          <p>The same face reads differently in a Seoul winter and a Dubai summer. The reader meets your skin where it is, every time you sit for it.</p>
          <ul className="cities">
            {CITIES.map(([c, w]) => (<li key={c}><b>{c}</b><span>{w}</span></li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}

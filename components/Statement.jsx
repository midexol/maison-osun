"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";

const CITIES = ["Seoul", "Lagos", "London", "Dubai", "New York", "São Paulo"];

export default function Statement() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);
  return (
    <section className="statement" aria-labelledby="stTitle">
      <div className="statement-frame" ref={ref}>
        <motion.div className="statement-photo" style={{ y }}>
          <Photo name="creamFace" alt="A woman with a jar of cream, mid-ritual" label="" sizes="100vw" widths={[800, 1400, 2000]} />
        </motion.div>
        <div className="statement-shade" />
        <div className="statement-copy">
          <Reveal><span className="mono">Osùn means camwood</span></Reveal>
          <Reveal delay={0.05}><h2 id="stTitle">One red heartwood. <em>Every kind of skin.</em></h2></Reveal>
          <Reveal delay={0.12}><p>For generations, West African families have pressed camwood onto skin to calm and even it. We kept that patience and added a reader that meets your skin wherever you live.</p></Reveal>
          <Reveal delay={0.18}><ul className="cities">{CITIES.map((c) => <li key={c}>{c}</li>)}</ul></Reveal>
        </div>
      </div>
    </section>
  );
}

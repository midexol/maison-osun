"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";
import { SAMPLE, SIGNS, ORDER } from "@/lib/data";
import { skinType, compose } from "@/lib/ritual";

const scores = Object.fromEntries(SAMPLE.concerns.map((c) => [c.type, c.ui]));
const lowest = ORDER.slice().sort((a, b) => scores[a] - scores[b])[0];
const plan = compose(scores);

const STEPS = [
  ["01", "Read", "Sit by a window and take one selfie. YouCam Skin AI scores seven signs from 1 to 100."],
  ["02", "Map", "Tap a sign and its detection map lights up on your own face, so you know where, not just how much."],
  ["03", "Prescribe", "Your two weakest signs choose the treatments. Every product says which score it answers."],
];

export default function Reading() {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  return (
    <section className="reading" id="reading" aria-labelledby="readingTitle">
      <div className="wrap reading-grid">
        <div>
          <Reveal><span className="mono">The reading</span></Reveal>
          <Reveal delay={0.05}><h2 id="readingTitle">A mirror that <em>answers back.</em></h2></Reveal>
          <ol className="steps-list">
            {STEPS.map(([n, t, d], i) => (
              <Reveal as="li" key={n} delay={0.1 + i * 0.08}>
                <span className="n mono">{n}</span>
                <div><b>{t}</b><p>{d}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal delay={0.1} className="phone-wrap">
          <div className="phone-bg"><Photo name="closeup" alt="" label="" sizes="(max-width: 920px) 92vw, 560px" widths={[600, 1000, 1400]} /></div>
          <div className="phone" ref={ref}>
            <div className="screen">
              <div className="notch" />
              <div className="screen-top"><span>Your portrait</span><span className="mono">Sample</span></div>
              <div className="screen-figure">
                <Photo name="hero" alt="" label="" sizes="300px" widths={[400, 700]} />
                <span className="scanbar" />
              </div>
              <div className="screen-stats">
                <div><b>{SAMPLE.overall}</b><span>Score</span></div>
                <div><b>{SAMPLE.skinAge}</b><span>Skin age</span></div>
                <div><b className="sm">{skinType(scores).split(",")[0]}</b><span>Type</span></div>
              </div>
              <ul className="screen-bars">
                {ORDER.map((k, i) => (
                  <li key={k} className={k === lowest ? "low" : ""}>
                    <span>{SIGNS[k].label}</span>
                    <span className="num">{scores[k]}</span>
                    <span className="bar">
                      <motion.i
                        initial={{ width: reduce ? `${scores[k]}%` : 0 }}
                        animate={seen ? { width: `${scores[k]}%` } : {}}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 + i * 0.08 }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="screen-rx">
                <span className="mono">Tonight</span>
                <b>{plan.evening[1][1].replace("Chosen for your ", "For your ")}</b>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <p className="caption center wrap" style={{ marginTop: "1.4rem" }}>Sample scores from YouCam&apos;s reference portrait</p>
    </section>
  );
}

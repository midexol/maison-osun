"use client";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";
import Reveal from "./Reveal";
import ArchMark from "./ArchMark";
import { SAMPLE, SIGNS, ORDER } from "@/lib/data";
import { skinType } from "@/lib/ritual";

const scores = Object.fromEntries(SAMPLE.concerns.map((c) => [c.type, c.ui]));
const lowest = ORDER.slice().sort((a, b) => scores[a] - scores[b])[0];

export default function LivePhone() {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  return (
    <section className="live" id="how">
      <div className="wrap">
        <Reveal className="live-head">
          <span className="eyebrow">The consultation, on your phone</span>
          <h2>A reading you can <em>see</em>, a ritual you can trust.</h2>
        </Reveal>

        <div className="live-grid">
          <Reveal className="live-note left" delay={0.1}>
            <span className="eyebrow">01 · Read</span>
            <h3>Seven signs, one selfie</h3>
            <p>YouCam Skin AI scores hydration, oil balance, radiance, texture, pores, redness and blemishes.</p>
            <span className="eyebrow" style={{ marginTop: "1.6rem" }}>02 · Map</span>
            <h3>See where, not just how much</h3>
            <p>Tap any sign and its detection map lights up on your own face.</p>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="phone" ref={ref}>
              <div className="screen">
                <div className="notch" />
                <div className="top">
                  <span className="word">Your portrait</span>
                  <ArchMark size={18} />
                </div>
                <div className="arch-photo">
                  <Photo name="portrait" alt="Sample skin portrait" label="" sizes="300px" widths={[400, 700]} />
                  <span className="scanbar" />
                  <span className="spot" style={{ left: "26%", top: "44%" }} />
                  <span className="spot" style={{ left: "54%", top: "30%", width: "16%" }} />
                </div>
                <div className="stats">
                  <div><b>{SAMPLE.overall}</b><span>Score</span></div>
                  <div><b>{SAMPLE.skinAge}</b><span>Skin age</span></div>
                  <div><b style={{ fontSize: ".95rem", lineHeight: 2 }}>{skinType(scores).split(",")[0]}</b><span>Type</span></div>
                </div>
                <ul>
                  {ORDER.map((k, i) => (
                    <li key={k} className={k === lowest ? "low" : ""}>
                      <span>{SIGNS[k].label}</span>
                      <span className="num">{scores[k]}</span>
                      <span className="bar">
                        <motion.i
                          initial={{ width: reduce ? `${scores[k]}%` : 0 }}
                          animate={seen ? { width: `${scores[k]}%` } : {}}
                          transition={{ duration: 1.2, ease: [0.2, 0.7, 0.2, 1], delay: 0.15 + i * 0.08 }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="caption" style={{ textAlign: "center", marginTop: "1rem" }}>Sample scores · YouCam reference portrait</p>
          </Reveal>

          <Reveal className="live-note right" delay={0.15}>
            <span className="eyebrow">03 · Prescribe</span>
            <h3>Three steps, morning and night</h3>
            <p>Your weakest signs choose the treatments. Every product says which score it answers.</p>
            <span className="eyebrow" style={{ marginTop: "1.6rem" }}>04 · Keep nothing</span>
            <h3>Your photo stays yours</h3>
            <p>Read once and never stored by the house. Guidance, never diagnosis.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yWindow = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const yGiant = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const ease = [0.2, 0.7, 0.2, 1];
  const rise = (d) => (reduce ? {} : { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease, delay: d } });

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero-bg" aria-hidden="true">
        <Photo name="texture" label="" widths={[800, 1400]} priority />
      </div>

      <div className="wrap hero-grid">
        <div>
          <motion.span className="eyebrow" style={{ display: "block", marginBottom: "1.4rem" }} {...rise(0.05)}>
            Maison Osùn · Est. 2026
          </motion.span>
          <motion.h1 {...rise(0.12)}>
            Skin, read like a <em>portrait.</em>
          </motion.h1>
          <motion.p className="lede" {...rise(0.22)}>
            Take one selfie. Our reader studies seven signs of your skin, then the house composes a morning and evening ritual made only for you.
          </motion.p>
          <motion.div className="ctas" {...rise(0.3)}>
            <a className="btn" href="#consult">Begin your consultation</a>
            <a className="btn light" href="#how">How it works</a>
          </motion.div>
        </div>

        <motion.div style={{ y: yWindow }} {...rise(0.18)}>
          <div className="window">
            <div className="orbit-2" aria-hidden="true" />
            <div className="orbit" aria-hidden="true" />
            <div className="glass-circle">
              <Photo name="portrait" alt="A woman applying cream to her cheek" label="Portrait" sizes="(max-width: 900px) 90vw, 470px" widths={[480, 800, 1100]} priority />
            </div>
            <div className="float-card score">
              <div className="row"><span className="mini">Hydration</span><span className="mini">Sample</span></div>
              <div className="row" style={{ marginTop: ".3rem" }}><b>70</b><span className="mini" style={{ color: "var(--warn)" }}>Steady</span></div>
              <div className="track"><i /></div>
            </div>
            <span className="pill float-pill">Skin portrait ready</span>
            <div className="float-thumb"><Photo name="camwoodSerum" alt="" label="" sizes="120px" widths={[240, 360]} /></div>
          </div>
        </motion.div>
      </div>

      <motion.div className="wrap" style={{ y: yGiant }} aria-hidden="true">
        <div className="giant"><span>O</span><span>S</span><span>Ù</span><span>N</span></div>
      </motion.div>
    </header>
  );
}

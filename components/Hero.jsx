"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Photo from "./Photo";
import VideoPlane from "./VideoPlane";

const Play = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true"><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg>
);

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.04, 1.16]);
  const ease = [0.16, 1, 0.3, 1];
  const rise = (d, y = 18) => (reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, ease, delay: d } });
  const blur = (d) => (reduce ? {} : { initial: { opacity: 0, filter: "blur(12px)", y: 16 }, animate: { opacity: 1, filter: "blur(0px)", y: 0 }, transition: { duration: 1.2, ease, delay: d } });

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero-frame">
        <motion.div className="hero-photo" style={{ scale }}>
          <Photo name="hero" alt="Close portrait of natural, glowing skin" label="" sizes="100vw" widths={[800, 1400, 2000, 2600]} priority />
        </motion.div>
        <div className="hero-shade" />

        <motion.div className="float-card" {...rise(0.6, 10)}>
          <div className="fc-photo"><Photo name="swirls" alt="" label="" sizes="96px" widths={[200, 320]} /></div>
          <div className="fc-body">
            <span className="mono">Sample portrait</span>
            <div className="fc-row"><b>76</b><span>Skin score</span></div>
            <div className="fc-row small"><span>Hydration 70</span><span>Clarity 88</span></div>
          </div>
        </motion.div>

        <div className="hero-copy">
          <motion.h1 {...blur(0.15)}>
            Skin, read like <em>a portrait.</em>
          </motion.h1>
          <motion.p {...rise(0.45)}>
            One selfie. Seven signs of your skin read by AI in about twenty seconds, then a morning and evening ritual composed only for you.
          </motion.p>
          <motion.div className="ctas" {...rise(0.6)}>
            <a className="pill light big" href="/consult">Begin your consultation</a>
            <a className="pill glass big" href="#reading">How it works</a>
          </motion.div>
        </div>

        <motion.div className="hero-tiles" {...rise(0.8, 10)}>
          <a className="tile" href="#reading" aria-label="Watch: the reading">
            <VideoPlane name="drop" position="50% 50%" />
            <span className="tile-play"><Play /></span>
            <span className="tile-label">The reading</span>
          </a>
          <a className="tile" href="#house" aria-label="Watch: the botanicals">
            <VideoPlane name="island" position="50% 50%" />
            <span className="tile-play"><Play /></span>
            <span className="tile-label">Botanicals</span>
          </a>
        </motion.div>
      </div>
    </header>
  );
}

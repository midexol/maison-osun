"use client";
import { useEffect, useRef, useState } from "react";
import { MEDIA } from "@/lib/media";

// Full-bleed looping video with a real poster frame. Fades the video in once it has data;
// with reduced motion it stays on the still frame.
export default function VideoPlane({ name, className = "", style, position = "50% 50%" }) {
  const m = MEDIA[name];
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStill(reduce);
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.05 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`vplane ${className}`} style={style} aria-hidden="true">
      <img className="vplane-poster" src={m.poster} alt="" style={{ objectPosition: position }} />
      {!still && m.src && (
        <video
          ref={ref}
          className={`vplane-video ${ready ? "on" : ""}`}
          src={m.src}
          poster={m.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          style={{ objectPosition: position }}
          onLoadedData={() => setReady(true)}
        />
      )}
    </div>
  );
}

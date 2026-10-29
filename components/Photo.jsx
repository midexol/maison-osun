"use client";
import { useState } from "react";
import { photoUrl } from "@/lib/data";

// Unsplash photo with a responsive srcset and a soft tinted fallback if it fails to load.
export default function Photo({ name, alt = "", sizes = "100vw", widths = [480, 800, 1200, 1800], priority = false, className, style, crossOrigin, imgRef, label }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`ph-fallback ${className || ""}`} data-label={label ?? alt} style={{ width: "100%", height: "100%", ...style }} aria-hidden="true" />;
  return (
    <img
      ref={imgRef}
      className={className}
      style={style}
      src={photoUrl(name, widths[Math.min(2, widths.length - 1)])}
      srcSet={widths.map((w) => `${photoUrl(name, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      crossOrigin={crossOrigin}
      onError={() => setFailed(true)}
    />
  );
}

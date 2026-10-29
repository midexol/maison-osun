"use client";
import { useEffect, useState } from "react";
import ArchMark from "./ArchMark";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
      <div className="wrap">
        <a href="#top" className="brand" aria-label="Maison Osùn, home">
          <ArchMark size={28} />
          <span className="word">Osùn</span>
        </a>
        <ul>
          <li><a href="#how">How it works</a></li>
          <li><a href="#house">The house</a></li>
          <li><a href="#consult">Consultation</a></li>
          <li><a href="#faq">Questions</a></li>
        </ul>
        <a className="btn" href="#consult">Read my skin</a>
      </div>
    </nav>
  );
}

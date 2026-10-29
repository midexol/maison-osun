"use client";
import { useEffect, useState } from "react";
import ArchMark from "./ArchMark";

const LINKS = [["#reading", "The reading"], ["#house", "Botanicals"], ["#consult", "Consultation"], ["#faq", "Questions"]];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
      <div className="nav-inner">
        <a href="#top" className="brand" aria-label="Maison Osùn, home">
          <ArchMark size={22} />
          <span className="wordmark">Osùn</span>
        </a>
        <ul className="nav-links">
          {LINKS.map(([h, l]) => <li key={h}><a href={h}>{l}</a></li>)}
        </ul>
        <div className="nav-right">
          <a className="search" href="#house"><SearchIcon /><span>Search botanicals</span></a>
          <a className="icon-btn" href="#consult" aria-label="Your ritual bag"><BagIcon /></a>
          <a className="pill dark" href="#consult">Read my skin</a>
          <button className="pill line menu-btn" type="button" aria-expanded={open} aria-controls="mobileMenu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
        </div>
      </div>
      {open && (
        <div className="mobile-menu" id="mobileMenu">
          {LINKS.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)}>{l}</a>)}
        </div>
      )}
    </nav>
  );
}

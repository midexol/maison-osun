"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ArchMark from "./ArchMark";
import { getBag, useStore } from "@/lib/store";

const LINKS = [["/consult", "Consultation"], ["/portrait", "Portrait"], ["/ritual", "Ritual"], ["/journal", "Journal"]];

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>
);

export default function Nav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [bag] = useStore(getBag);
  const count = (bag || []).reduce((n, i) => n + i.qty, 0);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [path]);
  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
      <div className="nav-inner">
        <a href="/" className="brand" aria-label="Maison Osùn, home">
          <ArchMark size={22} />
          <span className="wordmark">Osùn</span>
        </a>
        <ul className="nav-links">
          {LINKS.map(([h, l]) => <li key={h}><a href={h} aria-current={path === h ? "page" : undefined}>{l}</a></li>)}
        </ul>
        <div className="nav-right">
          <a className="icon-btn bag-btn" href="/bag" aria-label={`Bag, ${count} items`}>
            <BagIcon />{count > 0 && <span className="count">{count}</span>}
          </a>
          {path !== "/consult" && <a className="pill dark" href="/consult">Read my skin</a>}
          <button className="pill line menu-btn" type="button" aria-expanded={open} aria-controls="mobileMenu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
        </div>
      </div>
      {open && (
        <div className="mobile-menu" id="mobileMenu">
          {[["/", "Home"], ...LINKS, ["/bag", `Bag${count ? ` (${count})` : ""}`]].map(([h, l]) => <a key={h} href={h}>{l}</a>)}
        </div>
      )}
    </nav>
  );
}

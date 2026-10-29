import ArchMark from "./ArchMark";
import Reveal from "./Reveal";

export function Closing() {
  return (
    <section className="closing" aria-labelledby="closeTitle">
      <Reveal>
        <span className="eyebrow">Maison Osùn</span>
        <h2 id="closeTitle">Your portrait is one <em>selfie</em> away.</h2>
        <p>Sit by a window, take one photo, and let the house compose your ritual.</p>
        <a className="btn" href="#consult">Read my skin</a>
      </Reveal>
    </section>
  );
}

export default function Footer() {
  return (
    <footer>
      <ArchMark className="wm" size={600} mono />
      <div className="wrap">
        <div style={{ display: "grid", gap: ".8rem" }}>
          <span className="brand"><ArchMark size={28} /><span className="word">Osùn</span></span>
          <p style={{ maxWidth: "40ch" }}>A skincare house concept, built for the YouCam API Skin AI Hackathon. Skin analysis by YouCam Skin AI (Perfect Corp). Scores are cosmetic guidance, not a medical diagnosis.</p>
        </div>
        <ul>
          <li><a href="#how">How it works</a></li>
          <li><a href="#house">The house</a></li>
          <li><a href="#consult">Consultation</a></li>
        </ul>
        <ul>
          <li>Photography via Unsplash</li>
          <li>© 2026 Maison Osùn</li>
        </ul>
      </div>
    </footer>
  );
}

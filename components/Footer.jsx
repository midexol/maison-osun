import Photo from "./Photo";
import Reveal from "./Reveal";
import ArchMark from "./ArchMark";

export function Closing() {
  return (
    <section className="closing" aria-labelledby="closeTitle">
      <div className="closing-frame">
        <Photo name="dropper" alt="A hand holding a serum dropper" label="" sizes="100vw" widths={[800, 1400, 2000]} />
        <div className="closing-shade" />
        <Reveal className="closing-copy">
          <span className="mono">Your ritual</span>
          <h2 id="closeTitle">Your portrait is one <em>selfie away.</em></h2>
          <p>Sit by a window, take one photo, and let the house compose your morning and your night.</p>
          <a className="pill light big" href="#consult">Read my skin</a>
        </Reveal>
      </div>
    </section>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <span className="brand"><ArchMark size={22} /><span className="wordmark">Osùn</span></span>
          <p>A skincare house concept built for the YouCam API Skin AI Hackathon. Skin analysis by YouCam Skin AI (Perfect Corp). Scores are cosmetic guidance, not a medical diagnosis.</p>
        </div>
        <ul>
          <li><a href="#reading">The reading</a></li>
          <li><a href="#house">Botanicals</a></li>
          <li><a href="#consult">Consultation</a></li>
          <li><a href="#faq">Questions</a></li>
        </ul>
        <ul>
          <li>Photography via Unsplash</li>
          <li>Film via MotionSites</li>
          <li>© 2026 Maison Osùn</li>
        </ul>
      </div>
      <div className="giant-word" aria-hidden="true">Osùn</div>
    </footer>
  );
}

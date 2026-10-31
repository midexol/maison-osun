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
          <span className="mono">Get started</span>
          <h2 id="closeTitle">Check your skin <em>in about a minute.</em></h2>
          <p>Take one selfie in good light. You get your scores and a morning and evening routine.</p>
          <a className="pill light big" href="/consult">Analyse my skin</a>
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
          <p>A concept skincare brand built for the YouCam API Skin AI Hackathon. Skin analysis by YouCam Skin AI (Perfect Corp). Scores are for cosmetic guidance only, not a medical diagnosis.</p>
        </div>
        <ul>
          <li><a href="/consult">Consultation</a></li>
          <li><a href="/portrait">Portrait</a></li>
          <li><a href="/ritual">Ritual</a></li>
          <li><a href="/journal">Journal</a></li>
          <li><a href="/#faq">Questions</a></li>
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

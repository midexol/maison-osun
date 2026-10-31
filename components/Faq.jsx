import Reveal from "./Reveal";
import { FAQ } from "@/lib/data";

export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faqTitle">
      <div className="wrap faq-grid">
        <Reveal>
          <span className="eyebrow">FAQ</span>
          <h2 id="faqTitle">Common <em>questions.</em></h2>
        </Reveal>
        <Reveal delay={0.08}>
          {FAQ.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

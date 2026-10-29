import Reveal from "./Reveal";
import { FAQ } from "@/lib/data";

export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faqTitle">
      <div className="wrap grid">
        <Reveal>
          <span className="eyebrow">At the counter</span>
          <h2 id="faqTitle" style={{ marginTop: "1rem" }}>Questions people <em>ask</em> us.</h2>
        </Reveal>
        <Reveal delay={0.1}>
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

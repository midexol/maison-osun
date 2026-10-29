"use client";
import { useState } from "react";
import ArchMark from "./ArchMark";
import Photo from "./Photo";
import { PRODUCTS, PRODUCT_PHOTO } from "@/lib/data";
import { getBag, setBag, useStore } from "@/lib/store";
import { priceOf } from "./PortraitView";

export default function BagView() {
  const [bag, ready] = useStore(getBag);
  const [placed, setPlaced] = useState(null);
  if (!ready) return <section className="app-page" />;
  const items = (bag || []).filter((i) => PRODUCTS[i.key]);
  const qty = (key, n) => setBag(items.map((i) => (i.key === key ? { ...i, qty: Math.max(0, Math.min(9, n)) } : i)));
  const subtotal = items.reduce((s, i) => s + priceOf(i.key) * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  if (placed) {
    return (
      <section className="app-page empty-page">
        <div className="wrap narrow">
          <ArchMark size={56} />
          <span className="mono">Order {placed}</span>
          <h1 className="app-title">Your ritual is <em>on its way.</em></h1>
          <p className="intro">This is a concept checkout: no payment was taken and nothing will ship. Your ritual tracker is ready for day one.</p>
          <div className="actions">
            <a className="btn" href="/ritual">Open my ritual</a>
            <a className="btn light" href="/">Back to the house</a>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="app-page empty-page">
        <div className="wrap narrow">
          <ArchMark size={56} />
          <span className="mono">Bag</span>
          <h1 className="app-title">Your bag is <em>empty.</em></h1>
          <p className="intro">Your ritual is composed from your skin portrait. Read your skin and add the whole ritual in one tap.</p>
          <div className="actions">
            <a className="btn" href="/consult">Read my skin</a>
            <a className="btn light" href="/portrait">My portrait</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="app-page bag-page" aria-labelledby="bagTitle">
      <div className="wrap bag-grid">
        <div>
          <span className="mono">{count} {count === 1 ? "item" : "items"}</span>
          <h1 className="app-title" id="bagTitle">Your <em>bag.</em></h1>
          <ul className="bag-list">
            {items.map(({ key, qty: q }) => {
              const p = PRODUCTS[key];
              return (
                <li key={key}>
                  <span className="bag-thumb" style={{ background: p.tint }}>
                    <Photo name={PRODUCT_PHOTO[key]} alt="" label="" sizes="96px" widths={[200, 300]} />
                  </span>
                  <span className="bag-info">
                    <span className="step">{p.step} · {p.size}</span>
                    <b>{p.name}</b>
                    <span className="why">{p.note}</span>
                  </span>
                  <span className="bag-ctrl">
                    <span className="qty">
                      <button type="button" onClick={() => qty(key, q - 1)} aria-label={`One fewer ${p.name}`}>−</button>
                      <span aria-live="polite">{q}</span>
                      <button type="button" onClick={() => qty(key, q + 1)} aria-label={`One more ${p.name}`}>+</button>
                    </span>
                    <b className="price">${priceOf(key) * q}</b>
                    <button type="button" className="text-link" onClick={() => qty(key, 0)}>Remove</button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="checkout">
          <span className="mono">Summary</span>
          <dl>
            <div><dt>Subtotal</dt><dd>${subtotal}</dd></div>
            <div><dt>Shipping</dt><dd>{subtotal >= 120 ? "Complimentary" : "$8"}</dd></div>
            <div className="total"><dt>Total</dt><dd>${subtotal + (subtotal >= 120 ? 0 : 8)}</dd></div>
          </dl>
          <button className="btn" type="button" onClick={() => { setBag([]); setPlaced("MO-" + Math.random().toString(36).slice(2, 7).toUpperCase()); }}>Place order</button>
          <p className="caption">Concept checkout. No payment is taken in this demo.</p>
        </aside>
      </div>
    </section>
  );
}

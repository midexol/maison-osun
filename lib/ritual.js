import { SIGNS, ORDER } from "./data";

export function band(v) {
  if (v >= 80) return { label: "Luminous", tone: "good" };
  if (v >= 65) return { label: "Steady", tone: "warn" };
  return { label: "Needs care", tone: "care" };
}

export function skinType(sc) {
  const oil = sc.oiliness ?? 75;
  const wet = sc.moisture ?? 75;
  if (oil < 65 && wet < 65) return "Combination";
  if (oil < 65) return "Oil-rich";
  if (wet < 65) return "Thirsty";
  return oil <= wet ? "Balanced, oil-leaning" : "Balanced";
}

// scores: { moisture: 70, ... } -> { type, morning: [[productKey, why]], evening: [...] }
export function compose(sc) {
  const type = skinType(sc);
  const ranked = ORDER.filter((k) => sc[k] != null).sort((a, b) => sc[a] - sc[b]);
  const first = ranked[0];
  const firstP = SIGNS[first].treat;
  const second = ranked.find((k) => SIGNS[k].treat !== firstP) || ranked[1];
  const secondP = SIGNS[second].treat;
  const oily = /Oil-rich|Combination/.test(type);
  const cleanse = oily ? "blackSoap" : "sheaMilk";
  const seal = oily && type !== "Combination" ? "melon" : "sheaCream";
  const why = (k) => `Chosen for your ${SIGNS[k].label.toLowerCase()}, which reads ${sc[k]}.`;
  return {
    type,
    morning: [
      [cleanse, `Suits ${type.toLowerCase()} skin.`],
      [firstP, why(first)],
      ["veil", "Daily protection keeps every other step working."],
    ],
    evening: [
      [cleanse, "A second cleanse lifts the day's sunscreen and dust."],
      [secondP, why(second)],
      [seal, oily ? "Light enough for oil-rich skin." : "Locks in water overnight."],
    ],
  };
}

export function toScores(result) {
  const sc = {};
  (result?.concerns || []).forEach((c) => {
    if (SIGNS[c.type] && c.ui != null) sc[c.type] = Math.round(c.ui);
  });
  return sc;
}

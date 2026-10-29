// Catalogue, skin signs, sample portrait and photography for Maison Osùn.

/* Photography: free under the Unsplash License, hot-linked from images.unsplash.com.
   Swap any photo by changing its id. */
export const IMG = {
  hero: "1581182815808-b6eb627a8798", // close portrait, natural skin, soft bokeh (Fleur Kaan)
  closeup: "1556942040-df93bd3bdd19", // close-up of a woman's face (Oliver Johnson)
  creamFace: "1648203276014-20f97ba1f817", // towel on head, jar of cream (Kaeme)
  swirls: "1694147185194-f91cd8a50680", // pink gel, cream and serum swirls on beige
  dropper: "1573461160327-b450ce3d8e7f", // hand holding a dropper
  facial: "1570172619644-dfd03ed5d881", // facial mask treatment
  skyline: "1638437155671-167865b8bd49", // city skyline at sunset, Chibuzo Nwaneri
  portrait: "1693004925174-d9e06209d0ee", // woman applying cream
  ritual: "1693004927824-f2623bbedc8b", // woman applying lotion
  camwood: "1781344116880-029945a42b75", // amber dropper on stone
  sheaCream: "1693004926638-d2e47d705229", // hand holding a jar of whipped cream
  sheaMilk: "1585945037805-5fd82c2e60b1", // cream smear
  texture: "1748543668687-624e058c367c", // two viscous textures
  serums: "1748543668646-e81cda0890f3", // serums on glass plates
  hibiscus: "1548285852-c2c61bf144f9", // red hibiscus
  zobo: "1563636680-28d36aeb83a4", // cup of red hibiscus tea
  okra: "1558470570-c9a5a5ade867", // water drops
  baobab: "1608571424237-381e6b43a2a7", // bottle with orange liquid
  moringa: "1771643033515-0028fd03b708", // moringa leaves
  blackSoap: "1638131164559-5efa77e52527", // soap bottles and dish
  camwoodSerum: "1608571702419-f1267e9a18fb", // hand holding a brown glass bottle
  melon: "1748543669178-efd3de4e64e0", // serums and leaves
  veil: "1566812335496-af416725bc1d", // white bottles
};

export const photoUrl = (key, w = 1200) =>
  `https://images.unsplash.com/photo-${IMG[key] || key}?auto=format&fit=crop&w=${w}&q=72`;

export const PRODUCTS = {
  blackSoap: { name: "Black Soap Clarifying Gel", step: "Cleanse", size: "150 ml", price: "$38", tint: "#e4dccd", note: "Plantain-ash black soap in a gentle gel. Lifts excess oil without the squeak." },
  sheaMilk: { name: "Shea Milk Cleanser", step: "Cleanse", size: "150 ml", price: "$36", tint: "#ece2cf", note: "A cream cleanser that leaves the skin's own oils where they belong." },
  okra: { name: "Okra Hydra Serum", step: "Treat", size: "30 ml", price: "$64", tint: "#dde0d2", note: "Okra mucilage and hyaluronic acid hold water in thirsty skin." },
  baobab: { name: "Baobab C-15 Serum", step: "Treat", size: "30 ml", price: "$72", tint: "#efdcc4", note: "15% vitamin C with baobab fruit pulp for even, lit-from-within tone." },
  hibiscus: { name: "Hibiscus Resurfacing Tonic", step: "Treat", size: "120 ml", price: "$54", tint: "#ead2cf", note: "Hibiscus fruit acids smooth rough texture over two weeks of evenings." },
  moringa: { name: "Moringa Clarity Serum", step: "Treat", size: "30 ml", price: "$62", tint: "#dfe3d3", note: "Moringa and 2% niacinamide quiet blemishes and tighten the look of pores." },
  camwood: { name: "Camwood Calm Concentrate", step: "Treat", size: "30 ml", price: "$68", tint: "#e9d6c8", note: "Camwood and centella for skin that flushes, stings or reacts." },
  sheaCream: { name: "Shea Cloud Cream", step: "Seal", size: "50 ml", price: "$58", tint: "#efe6d6", note: "Whipped unrefined shea. Rich, never greasy." },
  melon: { name: "Melon Water Gel", step: "Seal", size: "50 ml", price: "$52", tint: "#dbe2dc", note: "Kalahari melon seed oil in a water gel for skin that shines by noon." },
  veil: { name: "Daylight Veil SPF 50", step: "Protect", size: "50 ml", price: "$46", tint: "#ebe3d3", note: "Sheer, with no white cast on any skin tone. Every morning, in any city, rain or sun." },
};

// Photo used for each product card
export const PRODUCT_PHOTO = {
  blackSoap: "blackSoap", sheaMilk: "sheaMilk", okra: "okra", baobab: "baobab", hibiscus: "hibiscus",
  moringa: "moringa", camwood: "camwoodSerum", sheaCream: "sheaCream", melon: "melon", veil: "veil",
};

export const COLLECTION = ["camwood", "sheaCream", "baobab", "hibiscus", "moringa", "okra", "blackSoap", "veil"];

// The seven SD signs the reader checks. Higher score = healthier.
export const SIGNS = {
  moisture: { label: "Hydration", sub: "Water held in the skin", treat: "okra" },
  oiliness: { label: "Oil balance", sub: "Shine and sebum", treat: "moringa" },
  radiance: { label: "Radiance", sub: "Evenness and glow", treat: "baobab" },
  texture: { label: "Texture", sub: "Smoothness of the surface", treat: "hibiscus" },
  pore: { label: "Pores", sub: "How visible they are", treat: "moringa" },
  redness: { label: "Calm", sub: "Redness and flushing", treat: "camwood" },
  acne: { label: "Clarity", sub: "Blemishes and breakouts", treat: "moringa" },
};
export const ORDER = Object.keys(SIGNS);

// Published YouCam SD reference sample from the API docs. Used for demos, always labelled.
export const SAMPLE = {
  overall: 76,
  skinAge: 37,
  concerns: [
    { type: "moisture", ui: 70 }, { type: "oiliness", ui: 72 }, { type: "radiance", ui: 79 },
    { type: "texture", ui: 76 }, { type: "pore", ui: 84 }, { type: "redness", ui: 77 }, { type: "acne", ui: 88 },
  ],
};

export const BOTANICALS = [
  { name: "Camwood", latin: "Pterocarpus osun", origin: "West Africa", photo: "camwood", text: "A red heartwood ground into paste and pressed onto skin for generations to calm and even it. The quiet base of our Calm Concentrate, and the name of the house." },
  { name: "Shea", latin: "Vitellaria paradoxa", origin: "Ghana", photo: "sheaCream", text: "Women-pressed, unrefined and slow-churned. It seals moisture in, whether the air is a dry winter or a desert wind." },
  { name: "Hibiscus", latin: "Hibiscus sabdariffa", origin: "Egypt", photo: "zobo", text: "The calyx brewed as karkadé in Cairo and sorrel in Kingston, rich in natural fruit acids. In our tonic it lifts dull texture without stripping." },
];

export const MORE_BOTANICALS = [
  { name: "Moringa", latin: "Moringa oleifera", origin: "India", photo: "moringa", text: "Leaf extract dense in antioxidants. Paired with 2% niacinamide, it quiets blemishes and tightens the look of pores." },
  { name: "Baobab", latin: "Adansonia digitata", origin: "Senegal", photo: "baobab", text: "Fruit pulp carries vitamin C into our C-15 serum for even, lit-from-within tone." },
  { name: "Centella", latin: "Centella asiatica", origin: "Madagascar", photo: "serums", text: "The calming herb behind our Calm Concentrate, for skin that flushes, stings or reacts." },
];

export const INGREDIENTS = [
  "Camwood · West Africa", "Shea · Ghana", "Hibiscus · Egypt", "Moringa · India", "Baobab · Senegal",
  "Rice ferment · Japan", "Centella · Madagascar", "Kalahari melon · Namibia", "Okra mucilage", "Niacinamide 2%",
];

export const FAQ = [
  { q: "What does the skin reader actually look at?", a: "Seven signs: hydration, oil balance, radiance, texture, pores, redness and blemishes. It also estimates an overall score and a skin age. The reading comes from YouCam Skin AI by Perfect Corp, the same models used by more than 800 beauty brands." },
  { q: "Is this a medical diagnosis?", a: "No. Scores are cosmetic guidance to help you choose a routine. For anything that hurts, spreads or worries you, see a dermatologist." },
  { q: "What happens to my photo?", a: "It is sent once to YouCam for analysis and never stored by Maison Osùn. YouCam deletes uploads after 24 hours." },
  { q: "How do I get the most accurate reading?", a: "Face a window in daylight, bare-faced if you can. Glasses off, hair away from your forehead, and come close enough that your face fills most of the frame. No filters or coloured lights." },
  { q: "How is my ritual chosen?", a: "Your skin type picks the cleanser and the finishing cream. Your two weakest signs pick the morning and evening treatments. SPF is always in the morning. Every step tells you which score it answers." },
];

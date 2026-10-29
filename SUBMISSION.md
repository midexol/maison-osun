# Devpost submission kit

## Project name
Maison Osùn

## Tagline
A global skincare house where your selfie becomes a skin portrait and a ritual made for you.

## Inspiration
Osùn is camwood, a red heartwood families across West Africa have pressed onto skin for generations. Good skincare used to be personal: someone looked closely at you and handed you exactly what you needed. Online, that care disappears into a shelf of 40 serums and a quiz. We wanted the luxury counter experience, where someone reads your skin and hands you three things, available to anyone, anywhere, from a phone.

## What it does
- You take one selfie. YouCam Skin AI scores seven signs: hydration, oil balance, radiance, texture, pores, redness and blemishes, plus an overall score and skin age.
- The site turns those scores into a **skin portrait**. Tap any sign and YouCam's detection mask lights up on your own photo, so you see where the reader found it.
- **See it before you buy it:** a **28-day preview** runs YouCam **AI Skin Simulation** on the same selfie, tuned to the two signs the ritual targets, and shows a before/after slider of *your own* face.
- A **Clinical view** toggle switches to YouCam's unadjusted raw scores, and every live result shows its YouCam task ID.
- The house then composes a **morning and evening ritual** from its ten-product collection. Skin type picks the cleanser and finishing cream, your two weakest signs pick the treatments, and SPF is always in the morning. Every step tells you which score it answers ("Chosen for your clarity, which reads 58").

- It's a full app, not a landing page: **Consultation → Portrait → Ritual → Journal → Bag**. The ritual tracker lets you tick off each step morning and night with a streak, and counts down to day 28, when you take your next portrait. The **journal** keeps every reading on your device and charts each sign over time, so you can see whether the ritual is working.
- Capture uses YouCam's **JS Camera Kit** in skincare mode, which checks light, distance and angle and captures automatically, with a plain selfie or upload as fallback.

## How we built it
- **YouCam Skin AI (V2 API):** `POST /file/skin-analysis` for an upload slot, a `PUT` to the pre-signed URL, `POST /task/skin-analysis` with seven SD concerns and `format: json`, then polling `GET /task/skin-analysis/{id}`.
- **YouCam AI Skin Simulation (V2 API):** the selfie's two weakest signs become per-concern intensities (0.2–0.6, weaker skin gets a stronger but still natural change), sent to `POST /task/skin-simulation`, then polled for the result image.
- **Next.js Route Handlers on Vercel** so the API key never reaches the browser, with a normaliser that turns the task output into one clean shape.
- **Frontend:** Next.js 14 (App Router) with Framer Motion and Lenis. An editorial luxury page, a live consultation that resizes photos in the browser to meet the API's size rules, and a ritual result that turns scores into products with prices and an add-to-bag step.
- Friendly errors mapped from YouCam's codes (face too small, too dark, turned away) so a first-time user knows exactly how to retake the photo.

## Challenges
- Getting the photo right: the reader needs the face to fill at least 60% of the frame. We resize client-side and translate every image error into one plain instruction.
- Making scores feel like advice, not a report card: the ritual explains its choice in one line per product.

## What's next
- Accounts so the journal syncs across devices.
- Real checkout and a 28-day refill subscription for the ritual.
- Re-composing the ritual automatically when a new reading shows a sign has recovered.

## Built with
YouCam Skin AI API, YouCam AI Skin Simulation API, YouCam JS Camera Kit, Next.js 14, React, Framer Motion, Lenis, Vercel

---

## Demo video script (about 2 minutes)

**0:00 – 0:12 · Hook.** Landing hero. "Most skincare sites sell you a shelf. Maison Osùn reads your skin first, then helps you keep the ritual."

**0:12 – 0:35 · Consultation.** On a phone, open /consult and tap *Guided camera*. "This is YouCam's Camera Kit in skincare mode: it checks my light and distance, then captures." Show the signs ticking off. "The photo goes through our server to the YouCam Skin AI API, seven concerns in one task."

**0:35 – 1:00 · Portrait.** Score, skin age, skin type. Tap *Clarity* and *Texture*: masks on the face. Flip *Clinical view*. "These are YouCam's own masks and raw scores, with the task ID underneath."

**1:00 – 1:20 · Day 28.** Tap *Preview my skin at day 28*, drag the slider. "A second API, AI Skin Simulation, shows my own skin after the ritual targets my two weakest signs."

**1:20 – 1:40 · Ritual.** Tap *Start this ritual*. Tick two morning steps; the week bar fills. "Every step says which score it answers. Day 1 of 28, and the next portrait is already booked."

**1:40 – 2:00 · Journal.** Open /journal (load the sample history if needed). Switch between Hydration and Clarity on the chart. "Every reading is saved on the device, so you can see what the ritual is actually doing."

**2:00 – 2:10 · Close.** "One selfie, a ritual made for you, and proof it's working. Maison Osùn."

Remember: say "YouCam Skin AI API" out loud and show it working on a real device (both are requirements).

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
- Run the analysis again after 28 days and show the change per sign.
- Real checkout for the ritual as a bundle.

## Built with
YouCam Skin AI API, YouCam AI Skin Simulation API, Next.js 14, React, Framer Motion, Lenis, Vercel

---

## Demo video script (about 2 minutes)

**0:00 – 0:15 · Hook.** Hero on screen. "Most skincare sites sell you a shelf. Maison Osùn reads your skin first."

**0:15 – 0:30 · The house.** Scroll the House section. "Osùn is camwood, an old West African skincare tradition. We paired it with YouCam's Skin AI."

**0:30 – 0:55 · Consultation.** On a phone: tap *Take a selfie*, take the photo. Show the scan line and the signs ticking off. "The photo goes to YouCam's Skin AI API through our server. We start a skin-analysis task with seven concerns and poll for the result."

**0:55 – 1:25 · Portrait.** Show score, skin age, skin type. Tap *Clarity*, then *Texture*: the masks light up on the face. "These are YouCam's detection masks, laid over your own photo."

**1:25 – 1:45 · Ritual.** Scroll the morning and evening ritual. Read one "Chosen for your…" line. "Every product answers a specific score."

**1:45 – 2:10 · Day 28.** Tap *Preview my skin at day 28* and drag the slider. "A second YouCam API, AI Skin Simulation, shows your own skin after the ritual, before you buy anything."

**2:10 – 2:20 · Close.** "Seven signs, one selfie, a ritual made for you. Maison Osùn."

Remember: say "YouCam Skin AI API" out loud and show it working on a real device (both are requirements).

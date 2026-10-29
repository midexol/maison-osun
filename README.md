# Maison Osùn

A luxury skincare house for every skin, built on the **YouCam Skin AI API**. You take one selfie, the reader scores seven signs of your skin, and the house composes a morning and evening ritual from its collection, explaining why each product was chosen.

Built for the [YouCam API Skin AI & eCommerce VTO Hackathon](https://youcam-api-skin-ai-ecommerce.devpost.com/) (Skin AI track).

## What it does

1. **Consultation.** Take a selfie (front camera on phones) or upload a photo. The page resizes it in the browser to fit the API's limits (short side ≥ 480 px, long side ≤ 1600 px, JPEG).
2. **Reading.** A serverless function uploads the photo to YouCam and runs an SD skin-analysis task for seven concerns: `moisture`, `oiliness`, `radiance`, `texture`, `pore`, `redness`, `acne`. The page polls until it finishes.
3. **Skin portrait.** Overall score, skin age, skin type, and a score per sign. Tap a sign to overlay YouCam's detection mask on your photo and see *where* it was found.
4. **Ritual.** Skin type picks the cleanser and finishing cream; your two weakest signs pick the morning and evening treatments; SPF is always in the morning. Each step says which score it answers.

If the API key isn't set (or you open the static preview), the site still works with a clearly labelled sample portrait.

## YouCam APIs used

| Step | Endpoint |
| --- | --- |
| Get upload slot | `POST /s2s/v2.0/file/skin-analysis` |
| Upload photo | `PUT` to the pre-signed URL returned above |
| Run analysis | `POST /s2s/v2.0/task/skin-analysis` (`format: "json"`, 7 SD concerns) |
| Poll result | `GET /s2s/v2.0/task/skin-analysis/{task_id}` |

The API key never reaches the browser: all calls go through the Route Handlers in `app/api/`.

## Stack

Next.js 14 (App Router), React 18, Framer Motion, Lenis. No database.

## Project layout

```
app/page.js                 the page (hero, live phone, climate band, ingredient index, consultation with ritual + bag, FAQ)
app/globals.css             design tokens and all styles
app/api/analyze/route.js    upload + start task  -> { taskId }
app/api/status/route.js     poll task            -> { status, overall, skinAge, concerns[] }
app/api/health/route.js     { live: true } when the key is configured
components/                 Hero, LivePhone, House, Consultation (the live tool), ...
lib/data.js                 products, signs, sample portrait, photo ids
lib/ritual.js               skin type + ritual logic
lib/youcam.js               YouCam helpers + result normaliser
test/proxy.test.mjs         route handlers against a mock YouCam server
```

## Deploy (Vercel, about 3 minutes)

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New → Project → Import** the repo. Vercel detects **Next.js** automatically.
3. **Settings → Environment Variables:** add `YOUCAM_API_KEY` = your key from the [YouCam API console](https://yce.perfectcorp.com/api-console/en/api-keys/).
4. Deploy. In the consultation section the badge turns green: "Live reader: YouCam Skin AI".

## Run locally

```bash
npm install
YOUCAM_API_KEY=your_key npm run dev   # http://localhost:3000
npm test                              # route handlers against a mock API
```

## Photography

Free photos from [Unsplash](https://unsplash.com/license), hot-linked from `images.unsplash.com` (no image files in the repo). All ids live in the `IMG` object in `lib/data.js`, so any photo can be swapped by changing its id.

If a photo fails to load, a soft tinted panel takes its place, so nothing breaks.

## Notes

- Scores are cosmetic guidance, not a medical diagnosis.
- Photos are sent to YouCam once for analysis; this site stores nothing. YouCam deletes uploads after 24 hours.
- Each reading uses 12 API units (SD, 5–7 concerns).
- Maison Osùn and its products are a concept brand made for this hackathon.

# Maison Osùn

A luxury skincare house for every skin, built on the **YouCam Skin AI API**. You take one selfie, the reader scores seven signs of your skin, and the house composes a morning and evening ritual from its collection, explaining why each product was chosen.

Built for the [YouCam API Skin AI & eCommerce VTO Hackathon](https://youcam-api-skin-ai-ecommerce.devpost.com/) (Skin AI track).

## What it does

Maison Osùn is a small app, not a single page:

| Route | What happens |
| --- | --- |
| `/` | The house: brand, how the reading works, botanicals, FAQ. |
| `/consult` | The consultation. **Guided camera** uses YouCam's JS Camera Kit in skincare mode (it checks light, distance and angle, then captures on its own). Falls back to a normal selfie or upload. Photos are resized in the browser to the API's limits. |
| `/portrait` | The skin portrait: overall score, skin age, skin type, a score per sign with change since your last reading, YouCam detection masks on your photo, a Clinical (raw score) view, the **28-day preview** (AI Skin Simulation before/after slider) and your composed ritual with add-to-bag. |
| `/ritual` | Daily tracker: tick off morning and evening steps, a 7-day view, a streak, and the date your next portrait is due (day 28). |
| `/journal` | Every reading saved on this device, a trend chart for the overall score or any of the seven signs, and per-reading deltas. "Load a sample history" shows the journal for judges without a camera (always labelled Sample). |
| `/bag` | The ritual as a bag with quantities and a concept checkout (no payment). |

Readings, check-offs and the bag live in `localStorage` on the device; the full-size selfie is kept only in `sessionStorage` for the 28-day preview. Nothing is stored on a server.

If the API key isn't set (or you open the static preview), the site still works with a clearly labelled sample portrait.

## YouCam APIs used

| Step | Endpoint |
| --- | --- |
| Get upload slot | `POST /s2s/v2.0/file/skin-analysis` |
| Upload photo | `PUT` to the pre-signed URL returned above |
| Run analysis | `POST /s2s/v2.0/task/skin-analysis` (`format: "json"`, 7 SD concerns) |
| Poll result | `GET /s2s/v2.0/task/skin-analysis/{task_id}` |
| 28-day preview | `POST /s2s/v2.0/task/skin-simulation`, polled at `GET /s2s/v2.0/task/skin-simulation/{task_id}` |
| Guided capture | YouCam JS Camera Kit (`faceDetectionMode: "skincare"`) |

The API key never reaches the browser: all calls go through the Route Handlers in `app/api/`.

## Stack

Next.js 14 (App Router), React 18, Framer Motion, Lenis. No database.

## Project layout

```
app/page.js                 landing (hero, reading, statement, botanicals, FAQ)
app/consult|portrait|ritual|journal|bag/page.js   the app routes
app/globals.css             design tokens and all styles
app/api/analyze/route.js    upload + start analysis -> { taskId }
app/api/simulate/route.js   upload + start skin simulation -> { taskId }
app/api/status/route.js     poll either task
app/api/health/route.js     { live: true } when the key is configured
components/                 ConsultFlow, PortraitView, RitualView, JournalView, BagView, Nav, Hero, ...
lib/data.js                 products, signs, sample portrait + history, photo ids
lib/ritual.js               skin type, ritual and simulation logic
lib/store.js                on-device storage (readings, ritual checks, bag)
lib/client.js               browser helpers: photo prep, API calls, errors
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

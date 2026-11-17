# Digital Wedding Invitation & RSVP System (Next.js)

An **Ivory & Champagne Floral** digital wedding invitation built with **Next.js (App Router)**, **Tailwind CSS**, and **Framer Motion**, featuring:

- **Pre-Configured Guest URLs (`/invite/[slug]`)** with personalized WhatsApp/iMessage Open Graph previews (`displayName` in title & envelope).
- **Bride's Side & Groom's Side Customization** — adapts parent names, couple name order, warm greeting, and family coordinator contact automatically per guest.
- **Single-Day Schedule** — unified whole-day flow covering the Sacred **Nikah** Ceremony and the **Mutual Wedding Reception & Dinner** (with zero mention of gifts or a gift corner).
- **Automatic Open & Non-Response Tracking** — tracks `Not Opened`, `Opened` (viewed invite, not yet responded), `Attending`, and `Declined`.
- **Reserved Seat Counter** — lets guests select how many seats (up to `maxSeats`) are attending and totals confirmed headcounts by family side.
- **Google Sheets Live Sync + Local Demo Mode** — works immediately with `data/guests.json` locally, and switches to your live Google Spreadsheet when `GOOGLE_SCRIPT_URL` is set.

---

## 1. Quick Start (Local)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:
- `http://localhost:3000` — Main cover & quick links
- `http://localhost:3000/invite/karim-uncle` — Groom's side sample (`Not Opened` -> `Opened` on visit)
- `http://localhost:3000/invite/farhana-apu` — Bride's side sample
- `http://localhost:3000/dashboard` — Host RSVP & Open Tracker (default passcode: `nikah2026`)

---

## 2. Customize Names, Venue & Date

Edit `src/config/wedding.ts` to replace all placeholder names, parents' names, date/time, Google Maps link, dress code swatches, and Bride/Groom coordinator phone numbers.

---

## 3. Connect Your Google Spreadsheet (Free)

1. Create a new Google Sheet.
2. Open **Extensions → Apps Script**, paste the contents of `google-apps-script/Code.gs`, and save.
3. Run `setupWeddingSheets()` once to generate the `Guests`, `RSVP_Log`, and `Summary` tabs.
4. Click **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the generated Web App URL into `.env.local` (and Vercel Environment Variables) as:
   ```env
   GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   HOST_PASSCODE=choose-a-strong-passcode
   ```

---

## 4. Deploy with a Clean URL (No Business Domain Needed)

Deploy directly to **Vercel** (free):
- Gives you a clean dedicated URL like `https://zayd-and-amina.vercel.app/invite/karim-uncle`, or connect a dedicated wedding domain later without touching your business domain.

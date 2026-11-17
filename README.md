# Digital Wedding Invitation & RSVP System (Next.js)

An interactive 3D **Ivory & Champagne Floral** digital wedding invitation built with **Next.js (App Router)**, **Tailwind CSS**, and **Framer Motion**, featuring:

- **Pre-Configured Guest URLs (`/invite/[slug]`)** with personalized WhatsApp/iMessage Open Graph previews (`displayName` in title & envelope).
- **Interactive 3D Envelope, Wax Seal & Flip-Card Experience** — 3D perspective envelope unfolding, pointer-reactive holographic champagne foil glare, and a 3D double-sided Hero Invitation / Keepsake Pass flip card.
- **Bride's Side & Groom's Side Customization** — adapts parent names, couple name order, warm greeting, and family coordinator contact automatically per guest.
- **Two Separate Google Spreadsheets (Bride & Groom)** — each spreadsheet has **2 sheets** (`Guest List` and `Respond List`), automatically merged in `/dashboard`.
- **Single-Day Schedule** — unified whole-day flow covering the Sacred **Nikah** Ceremony and the **Mutual Wedding Reception & Dinner** (with zero mention of gifts or a gift corner).
- **Automatic Open & Non-Response Tracking** — tracks `Not Opened`, `Opened` (viewed invite, not yet responded), `Attending`, and `Declined`, plus exact attending guest counts up to `maxSeats`.

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

Edit `src/config/wedding.ts` to replace all placeholder names, parents' names, date/time, Google Maps / Apple Maps links, dress code swatches, and Bride/Groom coordinator phone numbers.

---

## 3. Connect Your Two Google Spreadsheets (Bride & Groom)

Create **two separate Google Sheets** (one for the Groom's side, one for the Bride's side). In **each** spreadsheet:

1. Open **Extensions → Apps Script**, paste `google-apps-script/Code.gs`, and save.
2. Update `BASE_SITE_URL` on line 19 to your live Vercel URL.
3. Run `setupWeddingSheets()` once to create the **`Guest List`** and **`Respond List`** sheets.
4. Click **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy both `/exec` Web App URLs into `.env.local` and Vercel Environment Variables, along with separate passcodes for each family:
   ```env
   GOOGLE_SCRIPT_URL_GROOM=https://script.google.com/macros/s/GROOM_SCRIPT_ID/exec
   GOOGLE_SCRIPT_URL_BRIDE=https://script.google.com/macros/s/BRIDE_SCRIPT_ID/exec
   GROOM_PASSCODE=your-groom-side-password
   BRIDE_PASSCODE=your-bride-side-password
   HOST_PASSCODE=optional-master-password
   ```

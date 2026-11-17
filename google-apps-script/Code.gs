/**
 * Google Apps Script backend for the Wedding Invitation & RSVP Tracker.
 *
 * SETUP:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions -> Apps Script, paste this entire file, and save.
 * 3. Update BASE_SITE_URL below once you deploy to Vercel (or keep placeholder for now).
 * 4. Run `setupWeddingSheets()` once from the Apps Script toolbar to create the tabs & formulas.
 * 5. Click Deploy -> New deployment -> Web app:
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Copy the Web App URL into your Next.js `.env.local` as GOOGLE_SCRIPT_URL=...
 */

const BASE_SITE_URL = "https://your-wedding-site.vercel.app";

const GUESTS_SHEET = "Guests";
const LOG_SHEET = "RSVP_Log";
const SUMMARY_SHEET = "Summary";

const GUEST_HEADERS = [
  "slug",
  "displayName",
  "side",
  "maxSeats",
  "status",
  "openedAt",
  "openCount",
  "attendingCount",
  "respondedAt",
  "message",
  "phone",
  "inviteUrl",
];

function setupWeddingSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Guests sheet
  let guests = ss.getSheetByName(GUESTS_SHEET);
  if (!guests) {
    guests = ss.insertSheet(GUESTS_SHEET);
  }
  if (guests.getLastRow() === 0) {
    guests.appendRow(GUEST_HEADERS);
    guests.getRange(1, 1, 1, GUEST_HEADERS.length).setFontWeight("bold").setBackground("#F3EADC");
    guests.setFrozenRows(1);

    // Sample rows
    guests.appendRow([
      "karim-uncle",
      "Karim Uncle & Family",
      "groom",
      4,
      "Not Opened",
      "",
      0,
      0,
      "",
      "",
      "",
      `=IF(A2="","","${BASE_SITE_URL}/invite/"&A2)`,
    ]);
    guests.appendRow([
      "farhana-apu",
      "Farhana Apu & Family",
      "bride",
      3,
      "Not Opened",
      "",
      0,
      0,
      "",
      "",
      "",
      `=IF(A3="","","${BASE_SITE_URL}/invite/"&A3)`,
    ]);
  }

  // 2. RSVP_Log sheet
  let log = ss.getSheetByName(LOG_SHEET);
  if (!log) {
    log = ss.insertSheet(LOG_SHEET);
  }
  if (log.getLastRow() === 0) {
    log.appendRow([
      "timestamp",
      "action",
      "slug",
      "displayName",
      "side",
      "status",
      "attendingCount",
      "phone",
      "message",
    ]);
    log.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#F3EADC");
    log.setFrozenRows(1);
  }

  // 3. Summary dashboard sheet
  let summary = ss.getSheetByName(SUMMARY_SHEET);
  if (!summary) {
    summary = ss.insertSheet(SUMMARY_SHEET);
  }
  summary.clear();
  const rows = [
    ["Wedding RSVP Summary", "Count"],
    ["Total Invited Households", `=COUNTA(${GUESTS_SHEET}!A2:A)`],
    ["Total Reserved Seats (Max Capacity)", `=SUM(${GUESTS_SHEET}!D2:D)`],
    ["Not Opened Yet", `=COUNTIF(${GUESTS_SHEET}!E2:E,"Not Opened")`],
    ["Opened (Not Responded Yet)", `=COUNTIF(${GUESTS_SHEET}!E2:E,"Opened")`],
    ["Attending Households", `=COUNTIF(${GUESTS_SHEET}!E2:E,"Attending")`],
    ["Declined Households", `=COUNTIF(${GUESTS_SHEET}!E2:E,"Declined")`],
    ["Total Confirmed Attending Guests", `=SUMIF(${GUESTS_SHEET}!E2:E,"Attending",${GUESTS_SHEET}!H2:H)`],
    ["Groom's Side Confirmed Guests", `=SUMIFS(${GUESTS_SHEET}!H2:H,${GUESTS_SHEET}!E2:E,"Attending",${GUESTS_SHEET}!C2:C,"groom")`],
    ["Bride's Side Confirmed Guests", `=SUMIFS(${GUESTS_SHEET}!H2:H,${GUESTS_SHEET}!E2:E,"Attending",${GUESTS_SHEET}!C2:C,"bride")`],
  ];
  summary.getRange(1, 1, rows.length, 2).setValues(rows);
  summary.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#DFC8A2");
  summary.setColumnWidth(1, 280);
  summary.setColumnWidth(2, 120);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function rowToGuest(row) {
  return {
    slug: String(row[0] || "").trim().toLowerCase(),
    displayName: String(row[1] || "").trim(),
    side: String(row[2] || "groom").trim().toLowerCase() === "bride" ? "bride" : "groom",
    maxSeats: Math.max(1, Number(row[3]) || 1),
    status: String(row[4] || "Not Opened").trim() || "Not Opened",
    openedAt: row[5] ? String(row[5]) : null,
    openCount: Math.max(0, Number(row[6]) || 0),
    attendingCount: Math.max(0, Number(row[7]) || 0),
    respondedAt: row[8] ? String(row[8]) : null,
    message: String(row[9] || ""),
    phone: String(row[10] || ""),
  };
}

function getAllGuests(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, GUEST_HEADERS.length).getValues();
  return values
    .filter((r) => String(r[0] || "").trim() !== "")
    .map((r) => rowToGuest(r));
}

function findGuestRowIndex(sheet, slug) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const slugs = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const target = String(slug || "").trim().toLowerCase();
  for (let i = 0; i < slugs.length; i++) {
    if (String(slugs[i][0] || "").trim().toLowerCase() === target) {
      return i + 2;
    }
  }
  return -1;
}

function appendLog(ss, action, guest) {
  const log = ss.getSheetByName(LOG_SHEET);
  if (!log) return;
  log.appendRow([
    new Date().toISOString(),
    action,
    guest.slug,
    guest.displayName,
    guest.side,
    guest.status,
    guest.attendingCount,
    guest.phone,
    guest.message,
  ]);
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(GUESTS_SHEET);
  if (!sheet) {
    return jsonResponse({ error: "Guests sheet not found. Run setupWeddingSheets() first." });
  }

  if (action === "getGuest") {
    const slug = String(e.parameter.slug || "").trim().toLowerCase();
    const rowIdx = findGuestRowIndex(sheet, slug);
    if (rowIdx === -1) return jsonResponse({ guest: null });
    const row = sheet.getRange(rowIdx, 1, 1, GUEST_HEADERS.length).getValues()[0];
    return jsonResponse({ guest: rowToGuest(row) });
  }

  if (action === "listGuests") {
    return jsonResponse({ guests: getAllGuests(sheet) });
  }

  return jsonResponse({ ok: true, message: "Wedding RSVP Apps Script is active." });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(GUESTS_SHEET);
    if (!sheet) {
      return jsonResponse({ error: "Guests sheet not found. Run setupWeddingSheets() first." });
    }

    const slug = String(payload.slug || "").trim().toLowerCase();

    if (action === "trackOpen") {
      const rowIdx = findGuestRowIndex(sheet, slug);
      if (rowIdx === -1) return jsonResponse({ guest: null });

      const row = sheet.getRange(rowIdx, 1, 1, GUEST_HEADERS.length).getValues()[0];
      const current = rowToGuest(row);
      const now = payload.timestamp || new Date().toISOString();
      const nextStatus = current.status === "Not Opened" ? "Opened" : current.status;
      const nextOpenedAt = current.openedAt || now;
      const nextOpenCount = current.openCount + 1;

      sheet.getRange(rowIdx, 5, 1, 3).setValues([[nextStatus, nextOpenedAt, nextOpenCount]]);

      const updated = Object.assign({}, current, {
        status: nextStatus,
        openedAt: nextOpenedAt,
        openCount: nextOpenCount,
      });

      if (current.openCount === 0) {
        appendLog(ss, "FIRST_OPEN", updated);
      }
      return jsonResponse({ guest: updated });
    }

    if (action === "submitRsvp") {
      const rowIdx = findGuestRowIndex(sheet, slug);
      if (rowIdx === -1) return jsonResponse({ guest: null });

      const row = sheet.getRange(rowIdx, 1, 1, GUEST_HEADERS.length).getValues()[0];
      const current = rowToGuest(row);
      const now = payload.timestamp || new Date().toISOString();
      const attending = Boolean(payload.attending);
      const count = attending
        ? Math.max(1, Math.min(current.maxSeats, Number(payload.attendingCount) || 1))
        : 0;
      const nextStatus = attending ? "Attending" : "Declined";
      const nextOpenedAt = current.openedAt || now;
      const msg = String(payload.message || "").trim();
      const phone = String(payload.phone || "").trim();

      sheet.getRange(rowIdx, 5, 1, 7).setValues([
        [nextStatus, nextOpenedAt, Math.max(1, current.openCount), count, now, msg, phone],
      ]);

      const updated = Object.assign({}, current, {
        status: nextStatus,
        openedAt: nextOpenedAt,
        openCount: Math.max(1, current.openCount),
        attendingCount: count,
        respondedAt: now,
        message: msg,
        phone: phone,
      });

      appendLog(ss, "RSVP_SUBMITTED", updated);
      return jsonResponse({ guest: updated });
    }

    if (action === "upsertGuest") {
      const displayName = String(payload.displayName || "").trim();
      const side = payload.side === "bride" ? "bride" : "groom";
      const maxSeats = Math.max(1, Math.min(20, Number(payload.maxSeats) || 1));
      const rowIdx = findGuestRowIndex(sheet, slug);

      if (rowIdx >= 2) {
        sheet.getRange(rowIdx, 2, 1, 3).setValues([[displayName, side, maxSeats]]);
        const updatedRow = sheet.getRange(rowIdx, 1, 1, GUEST_HEADERS.length).getValues()[0];
        return jsonResponse({ guest: rowToGuest(updatedRow) });
      }

      const newRowNum = sheet.getLastRow() + 1;
      sheet.appendRow([
        slug,
        displayName,
        side,
        maxSeats,
        "Not Opened",
        "",
        0,
        0,
        "",
        "",
        "",
        `=IF(A${newRowNum}="","","${BASE_SITE_URL}/invite/"&A${newRowNum})`,
      ]);
      const createdRow = sheet.getRange(newRowNum, 1, 1, GUEST_HEADERS.length).getValues()[0];
      return jsonResponse({ guest: rowToGuest(createdRow) });
    }

    return jsonResponse({ error: "Unknown action" });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Google Apps Script backend for ONE side's Wedding Spreadsheet (Groom OR Bride).
 * Deploy this script once in the Groom's Google Sheet, and once in the Bride's Google Sheet.
 *
 * Each spreadsheet file contains exactly TWO sheets:
 *   1. "Guest List"   — Pre-configured households, open tracking, current RSVP status, and invite URLs
 *   2. "Respond List" — Chronological log of every RSVP submission & update
 *
 * SETUP:
 * 1. Open your Google Sheet -> Extensions -> Apps Script -> paste this file -> Save.
 * 2. Update BASE_SITE_URL below to your live Vercel URL (e.g. "https://sagor-and-moon.vercel.app").
 * 3. Run `setupWeddingSheets()` once from the Apps Script toolbar to create "Guest List" & "Respond List".
 * 4. Deploy -> New deployment -> Web app:
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Put the Groom Sheet's /exec URL into GOOGLE_SCRIPT_URL_GROOM and the Bride Sheet's /exec URL into GOOGLE_SCRIPT_URL_BRIDE.
 */

const BASE_SITE_URL = "https://your-wedding-site.vercel.app";

const GUEST_LIST_SHEET = "Guest List";
const RESPOND_LIST_SHEET = "Respond List";

const GUEST_HEADERS = [
  "slug",
  "displayName",
  "maxSeats",
  "status",
  "openedAt",
  "openCount",
  "attendingCount",
  "respondedAt",
  "message",
  "phone",
  "inviteUrl",
  "addedBy",
];

const RESPOND_HEADERS = [
  "timestamp",
  "action",
  "slug",
  "displayName",
  "status",
  "attendingCount",
  "maxSeats",
  "phone",
  "message",
];

function setupWeddingSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Sheet 1: Guest List
  let guestSheet = ss.getSheetByName(GUEST_LIST_SHEET);
  if (!guestSheet) {
    const firstSheet = ss.getSheets()[0];
    if (firstSheet && firstSheet.getLastRow() === 0 && firstSheet.getName() === "Sheet1") {
      firstSheet.setName(GUEST_LIST_SHEET);
      guestSheet = firstSheet;
    } else {
      guestSheet = ss.insertSheet(GUEST_LIST_SHEET);
    }
  }
  if (guestSheet.getLastRow() === 0) {
    guestSheet.appendRow(GUEST_HEADERS);
    guestSheet.getRange(1, 1, 1, GUEST_HEADERS.length).setFontWeight("bold").setBackground("#F3EADC");
    guestSheet.setFrozenRows(1);

    guestSheet.appendRow([
      "sample-family",
      "Sample Uncle & Family",
      4,
      "Not Opened",
      "",
      0,
      0,
      "",
      "",
      "",
      `=IF(A2="","","${BASE_SITE_URL}/invite/"&A2)`,
      "Spreadsheet",
    ]);
  }

  // Sheet 2: Respond List
  let respondSheet = ss.getSheetByName(RESPOND_LIST_SHEET);
  if (!respondSheet) {
    respondSheet = ss.insertSheet(RESPOND_LIST_SHEET);
  }
  if (respondSheet.getLastRow() === 0) {
    respondSheet.appendRow(RESPOND_HEADERS);
    respondSheet.getRange(1, 1, 1, RESPOND_HEADERS.length).setFontWeight("bold").setBackground("#F3EADC");
    respondSheet.setFrozenRows(1);
  }
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
    maxSeats: Math.max(1, Number(row[2]) || 1),
    status: String(row[3] || "Not Opened").trim() || "Not Opened",
    openedAt: row[4] ? String(row[4]) : null,
    openCount: Math.max(0, Number(row[5]) || 0),
    attendingCount: Math.max(0, Number(row[6]) || 0),
    respondedAt: row[7] ? String(row[7]) : null,
    message: String(row[8] || ""),
    phone: String(row[9] || ""),
    addedBy: String(row[11] || ""),
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

function appendRespondRow(ss, action, guest) {
  const respondSheet = ss.getSheetByName(RESPOND_LIST_SHEET);
  if (!respondSheet) return;
  respondSheet.appendRow([
    new Date().toISOString(),
    action,
    guest.slug,
    guest.displayName,
    guest.status,
    guest.attendingCount,
    guest.maxSeats,
    guest.phone,
    guest.message,
  ]);
}

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(GUEST_LIST_SHEET);
  if (!sheet) {
    return jsonResponse({ error: 'Sheet "Guest List" not found. Run setupWeddingSheets() first.' });
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

  return jsonResponse({ ok: true, message: "Wedding Guest List & Respond List Apps Script active." });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(GUEST_LIST_SHEET);
    if (!sheet) {
      return jsonResponse({ error: 'Sheet "Guest List" not found. Run setupWeddingSheets() first.' });
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

      sheet.getRange(rowIdx, 4, 1, 3).setValues([[nextStatus, nextOpenedAt, nextOpenCount]]);

      const updated = Object.assign({}, current, {
        status: nextStatus,
        openedAt: nextOpenedAt,
        openCount: nextOpenCount,
      });

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

      sheet.getRange(rowIdx, 4, 1, 7).setValues([
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

      appendRespondRow(ss, "RSVP_SUBMITTED", updated);
      return jsonResponse({ guest: updated });
    }

    if (action === "upsertGuest") {
      const displayName = String(payload.displayName || "").trim();
      const maxSeats = Math.max(1, Math.min(20, Number(payload.maxSeats) || 1));
      const addedBy = String(payload.addedBy || "").trim();
      const rowIdx = findGuestRowIndex(sheet, slug);

      if (rowIdx >= 2) {
        sheet.getRange(rowIdx, 2, 1, 2).setValues([[displayName, maxSeats]]);
        if (addedBy) {
          sheet.getRange(rowIdx, 12).setValue(addedBy);
        }
        const updatedRow = sheet.getRange(rowIdx, 1, 1, GUEST_HEADERS.length).getValues()[0];
        return jsonResponse({ guest: rowToGuest(updatedRow) });
      }

      const newRowNum = sheet.getLastRow() + 1;
      sheet.appendRow([
        slug,
        displayName,
        maxSeats,
        "Not Opened",
        "",
        0,
        0,
        "",
        "",
        "",
        `=IF(A${newRowNum}="","","${BASE_SITE_URL}/invite/"&A${newRowNum})`,
        addedBy,
      ]);
      const createdRow = sheet.getRange(newRowNum, 1, 1, GUEST_HEADERS.length).getValues()[0];
      return jsonResponse({ guest: rowToGuest(createdRow) });
    }

    return jsonResponse({ error: "Unknown action" });
  } finally {
    lock.releaseLock();
  }
}

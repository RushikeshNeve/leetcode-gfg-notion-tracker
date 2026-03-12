# Run & Deploy Guide (Step-by-Step)

## 1) Run extension locally

1. Clone project and open folder.
2. In Chrome, open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this project folder.

## 2) Configure destination

Open extension **Options** from extension details and choose a default target:

- `Google Sheets`
- `Notion`

You can also change the target from the popup before saving.

---

## 3A) Deploy Google Sheets backend (Apps Script)

1. Create a Google Sheet with headers:
   - Solved At, Title, Platform, URL, Original Difficulty, User Difficulty, Need Revision, Notes, Solution Language, Solution
2. Open **Extensions → Apps Script**.
3. Paste:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents || "{}");

  sheet.appendRow([
    data.solvedAt || new Date().toISOString(),
    data.title || "",
    data.platform || "",
    data.url || "",
    data.originalDifficulty || "",
    data.userDifficulty || "",
    data.needRevision ? "Yes" : "No",
    data.notes || "",
    data.solutionLanguage || "",
    data.solution || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy as **Web App** and copy `.../exec` URL.
5. Put URL in extension options.

---

## 3B) Deploy Notion integration

1. Create Notion integration and copy token.
2. Create database with properties listed in `README.md`.
3. Share database with integration.
4. Copy database ID from URL.
5. In extension options, set:
   - Notion Integration Token
   - Notion Database ID

---

## 4) Verify end-to-end

1. Open a LeetCode or GFG problem page.
2. Open extension popup.
3. Confirm scraped fields and set destination.
4. Click **Save**.
5. Verify data appears in selected destination.

## 5) Deploy updates

1. Bump `version` in `manifest.json`.
2. Reload extension in `chrome://extensions`.
3. Re-test save flow.

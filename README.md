# DSA Solve Logger (LeetCode + GFG → Google Sheets)

Chrome Extension (Manifest V3) that captures solved problem data from LeetCode and GeeksforGeeks and appends it into a Google Sheet.

## Features

- Scrapes problem details from LeetCode/GFG pages.
- Lets you override difficulty tag (`Easy`, `Medium`, `Hard`).
- Includes `Need Revision` checkbox and notes.
- Captures submitted solution code where available.
- Saves a timestamped row in Google Sheets.

## Project structure

```text
leetcode-gfg-notion-tracker/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── options.html
├── options.js
├── styles.css
└── README.md
```

## Google Sheet columns

Create a header row with these columns (same order recommended):

- `Solved At`
- `Title`
- `Platform`
- `URL`
- `Original Difficulty`
- `User Difficulty`
- `Need Revision`
- `Notes`
- `Solution Language`
- `Solution`

## Google Apps Script setup

1. Create a Google Sheet.
2. Open **Extensions → Apps Script**.
3. Paste this script and save:

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

4. Deploy as **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone** (or anyone with link, based on your policy)
5. Copy the Web App URL (`.../exec`) and paste it into extension **Options**.

## Run and deploy

For a complete step-by-step setup and deployment walkthrough, see [`RUN_AND_DEPLOY.md`](./RUN_AND_DEPLOY.md).

## Testing

For step-by-step local and end-to-end testing instructions, see [`TESTING.md`](./TESTING.md).

## Notes

- LeetCode/GFG selectors may change over time and require updates.
- This is an MVP and uses an Apps Script endpoint for writes.
- If your web app is restricted, make sure the calling context is allowed.

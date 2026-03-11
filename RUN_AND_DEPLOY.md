# Run & Deploy Guide (Step-by-Step)

This guide explains exactly how to:

1. run the extension locally,
2. connect it to Google Sheets,
3. deploy updates safely.

---

## Part A: Prerequisites

Before you start, make sure you have:

- Google Chrome
- A Google account
- A Google Sheet where rows should be appended
- This repository cloned locally

Optional (for local mock testing):

- Node.js 18+

---

## Part B: First-time local run (Chrome extension)

### Step 1) Download / clone the project

```bash
git clone <your-repo-url>
cd leetcode-gfg-notion-tracker
```

### Step 2) Open extension management

In Chrome, open:

- `chrome://extensions`

### Step 3) Enable Developer Mode

- Toggle **Developer mode** ON (top-right).

### Step 4) Load extension

- Click **Load unpacked**.
- Select this project folder (`leetcode-gfg-notion-tracker`).

You should now see **DSA Solve Logger** in your extension list.

---

## Part C: Create Google Sheet + Apps Script endpoint

### Step 1) Create the Sheet

Create a new Google Sheet with header row:

1. `Solved At`
2. `Title`
3. `Platform`
4. `URL`
5. `Original Difficulty`
6. `User Difficulty`
7. `Need Revision`
8. `Notes`
9. `Solution Language`
10. `Solution`

### Step 2) Add Apps Script

From the sheet:

- **Extensions → Apps Script**
- Replace script content with:

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

### Step 3) Deploy Web App

- Click **Deploy → New deployment**
- Type: **Web app**
- Execute as: **Me**
- Who has access: **Anyone** (or **Anyone with Google account**, based on your policy)
- Click **Deploy** and authorize prompts if shown
- Copy generated URL ending in `/exec`

---

## Part D: Connect extension to deployed endpoint

### Step 1) Open extension options

From `chrome://extensions`:

- Find **DSA Solve Logger**
- Click **Details**
- Click **Extension options**

### Step 2) Save endpoint

- Paste your Apps Script `/exec` URL
- Click **Save Settings**

### Step 3) Verify it works

- Open a problem page such as `https://leetcode.com/problems/two-sum/`
- Open extension popup
- Click **Save to Google Sheets**
- Confirm a new row appears in your sheet

---

## Part E: Local testing before real deployment (recommended)

Use the built-in mock endpoint to test without touching Google Sheets.

### Step 1) Start mock server

```bash
node scripts/mock-apps-script.js
```

### Step 2) In extension options, use:

- `http://127.0.0.1:8787/exec`

### Step 3) Save from popup

You should see successful status in popup and payload logs in terminal.

---

## Part F: How to deploy updates (new versions)

When you change code and want to roll out a new version to your browser/dev team:

### Step 1) Update version in `manifest.json`

Example:

- `1.1.0` → `1.1.1`

### Step 2) Reload unpacked extension

In `chrome://extensions`:

- Click **Reload** on DSA Solve Logger card.

### Step 3) Re-test core flow

- Open LeetCode/GFG page
- Save once via popup
- Verify row in sheet

### Step 4) If Apps Script changed

- Go to Apps Script
- Create **New deployment** (or manage deployment versions)
- Update extension options with new `/exec` URL if it changed

---

## Part G: Troubleshooting

- **Popup says cannot capture details**
  - Ensure you are on `leetcode.com/problems/*` or `geeksforgeeks.org/*`
  - Reload tab and retry

- **Save fails with endpoint error**
  - Confirm Apps Script URL is correct and ends with `/exec`
  - Confirm Web App access policy allows your requests

- **No new row in sheet**
  - Check Apps Script executions/logs
  - Verify sheet headers/order

For deeper test coverage, see `TESTING.md`.

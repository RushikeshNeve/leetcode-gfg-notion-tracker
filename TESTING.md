# Testing Guide

This extension can be tested end-to-end without Google Sheets first, then validated against a real Apps Script deployment.

## 1) Static checks (quick sanity)

Run these from the repo root:

```bash
python -m json.tool manifest.json >/dev/null
node --check background.js
node --check content.js
node --check popup.js
node --check options.js
node --check scripts/mock-apps-script.js
```

## 2) Local end-to-end test (without Google account)

### Start a mock Apps Script endpoint

```bash
node scripts/mock-apps-script.js
```

It will expose:

- `http://127.0.0.1:8787/exec`

### Load extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this repository folder

### Configure options page

1. Open extension details → **Extension options**
2. Set **Google Apps Script Web App URL** to:
   - `http://127.0.0.1:8787/exec`
3. Click **Save Settings**

### Validate popup flow

1. Open a supported URL, for example:
   - `https://leetcode.com/problems/two-sum/`
2. Open extension popup
3. Confirm fields auto-fill:
   - title
   - platform
   - difficulty
4. Optionally edit notes / solution / revision toggle
5. Click **Save to Google Sheets**

Expected results:

- Popup status shows: `Saved to Google Sheets successfully.`
- Terminal running mock server prints a JSON payload containing:
  - title, platform, url
  - originalDifficulty, userDifficulty
  - needRevision, notes
  - solution, solutionLanguage
  - solvedAt

## 3) Real Google Sheets integration test

1. Deploy Apps Script web app as described in `README.md`
2. Put deployed `.../exec` URL in extension options
3. Repeat popup flow on a LeetCode/GFG problem
4. Verify a new row appears in the target sheet with all expected columns populated

## 4) Negative test cases

- **Missing settings:** clear URL in options and click save in popup
  - Expect clear error: missing Google Apps Script URL
- **Invalid endpoint:** set URL to `http://127.0.0.1:8787/invalid`
  - Expect popup error from background request
- **Unsupported tab:** open popup on a non-LeetCode/non-GFG page
  - Expect inability to capture problem details

## 5) Regression checklist

- Options persist after browser restart
- Save still works after extension reload
- LeetCode scraping still captures Monaco code when available
- GFG scraping still captures title/difficulty and editor code where available

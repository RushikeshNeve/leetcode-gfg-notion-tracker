# Testing Guide

## 1) Static checks

```bash
python -m json.tool manifest.json >/dev/null
node --check background.js
node --check content.js
node --check popup.js
node --check options.js
node --check scripts/mock-apps-script.js
```

## 2) Google Sheets local test (mock endpoint)

1. Start mock server:

```bash
node scripts/mock-apps-script.js
```

2. Set options:
   - Default target: `Google Sheets`
   - URL: `http://127.0.0.1:8787/exec`
3. Open LeetCode/GFG page, then popup, then Save.
4. Confirm popup success and terminal payload log.

## 3) Notion integration test

1. Create Notion integration + database.
2. Put token/database ID in options.
3. Set target to `Notion`.
4. Save from popup.
5. Confirm page created in database with:
   - mapped properties
   - code block body for submitted solution.

## 4) Negative tests

- Missing Google URL while target is Google Sheets → validation error.
- Missing Notion token/DB while target is Notion → validation error.
- Unsupported page URL → popup cannot capture details.

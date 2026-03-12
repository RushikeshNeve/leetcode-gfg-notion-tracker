# DSA Solve Logger (LeetCode + GFG → Google Sheets / Notion)

Chrome Extension (Manifest V3) that captures solved problem data from LeetCode and GeeksforGeeks and saves it to either Google Sheets or Notion.

## Features

- Scrapes problem details from LeetCode/GFG pages.
- Lets you override difficulty tag (`Easy`, `Medium`, `Hard`).
- Includes `Need Revision` checkbox and notes.
- Captures submitted solution code where available.
- Saves to either:
  - Google Sheets (via Apps Script Web App), or
  - Notion database (via Notion API).

## Setup overview

1. Load extension unpacked in Chrome (`chrome://extensions`).
2. Open extension options.
3. Choose default save target:
   - Google Sheets, or
   - Notion.
4. Fill relevant credentials:
   - Google Sheets: Apps Script `/exec` URL
   - Notion: Integration Token + Database ID
5. Use popup on LeetCode/GFG problem page and click **Save**.

## Notion database schema

Create these Notion properties:

- `Name` → Title
- `Platform` → Select
- `URL` → URL
- `Difficulty` → Select
- `Need Revision` → Checkbox
- `Solved At` → Date
- `Notes` → Text
- `Original Difficulty` → Text

Submitted code is stored as page content in a Notion code block.

## Run and deploy

For a complete step-by-step setup and deployment walkthrough, see [`RUN_AND_DEPLOY.md`](./RUN_AND_DEPLOY.md).

## Testing

For step-by-step local and end-to-end testing instructions, see [`TESTING.md`](./TESTING.md).

## Notes

- LeetCode/GFG selectors may change over time and require updates.
- This is an MVP and uses direct client-side API calls.

chrome.runtime.onInstalled.addListener(() => {
  console.log("DSA Solve Logger installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SAVE_PROBLEM") {
    return false;
  }

  saveProblem(message.payload)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

async function saveProblem(payload) {
  const { storageTarget = "googleSheets" } = await chrome.storage.sync.get(["storageTarget"]);
  const target = payload?.storageTarget || storageTarget;

  if (target === "notion") {
    return saveToNotion(payload);
  }

  return saveToGoogleSheets(payload);
}

async function saveToGoogleSheets(payload) {
  const { googleScriptUrl } = await chrome.storage.sync.get(["googleScriptUrl"]);

  if (!googleScriptUrl) {
    throw new Error("Missing Google Apps Script Web App URL. Set it in extension options.");
  }

  const body = {
    title: payload.title || "Untitled Problem",
    platform: payload.platform || "Unknown",
    url: payload.url || "",
    originalDifficulty: payload.difficulty || "Unknown",
    userDifficulty: payload.userDifficulty || payload.difficulty || "Unknown",
    needRevision: Boolean(payload.needRevision),
    notes: (payload.notes || "").slice(0, 5000),
    solution: payload.solution || "No solution captured",
    solutionLanguage: inferLanguage(payload.solutionLanguage),
    solvedAt: new Date().toISOString()
  };

  const response = await fetch(googleScriptUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Failed to update Google Sheets (HTTP ${response.status})`);
  }

  return data;
}

async function saveToNotion(payload) {
  const { notionToken, notionDatabaseId } = await chrome.storage.sync.get(["notionToken", "notionDatabaseId"]);

  if (!notionToken || !notionDatabaseId) {
    throw new Error("Missing Notion token or database ID. Set them in extension options.");
  }

  const body = {
    parent: { database_id: notionDatabaseId },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: payload.title || "Untitled Problem"
            }
          }
        ]
      },
      Platform: {
        select: {
          name: payload.platform || "Unknown"
        }
      },
      URL: {
        url: payload.url || null
      },
      Difficulty: {
        select: {
          name: payload.userDifficulty || payload.difficulty || "Unknown"
        }
      },
      "Need Revision": {
        checkbox: Boolean(payload.needRevision)
      },
      "Solved At": {
        date: {
          start: new Date().toISOString()
        }
      },
      Notes: {
        rich_text: payload.notes
          ? [
              {
                text: {
                  content: payload.notes.slice(0, 1800)
                }
              }
            ]
          : []
      },
      "Original Difficulty": {
        rich_text: payload.difficulty
          ? [
              {
                text: {
                  content: payload.difficulty
                }
              }
            ]
          : []
      }
    },
    children: [
      {
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Submitted Solution"
              }
            }
          ]
        }
      },
      {
        object: "block",
        type: "code",
        code: {
          rich_text: [
            {
              type: "text",
              text: {
                content: payload.solution || "No solution captured"
              }
            }
          ],
          language: inferLanguage(payload.solutionLanguage)
        }
      }
    ]
  };

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28"
    },
    body: JSON.stringify(body)
  });

  const data = await readJson(response);

  if (!response.ok) {
    throw new Error(data?.message || `Failed to create Notion page (HTTP ${response.status})`);
  }

  return data;
}

async function readJson(response) {
  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}

function inferLanguage(lang) {
  const map = {
    cpp: "c++",
    cplusplus: "c++",
    python: "python",
    python3: "python",
    java: "java",
    javascript: "javascript",
    typescript: "typescript",
    c: "c",
    csharp: "c#",
    go: "go",
    kotlin: "kotlin",
    rust: "rust",
    ruby: "ruby"
  };

  if (!lang) return "plain text";
  return map[String(lang).toLowerCase()] || "plain text";
}

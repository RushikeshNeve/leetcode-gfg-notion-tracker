chrome.runtime.onInstalled.addListener(() => {
  console.log("DSA Solve Logger installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SAVE_TO_SHEETS") {
    return false;
  }

  saveToGoogleSheets(message.payload)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

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

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    if (!response.ok) {
      throw new Error(`Failed to update Google Sheets (HTTP ${response.status})`);
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Failed to update Google Sheets (HTTP ${response.status})`);
  }

  return data;
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

async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function setStatus(text, isError = false) {
  const el = document.getElementById("status");
  el.textContent = text;
  el.style.color = isError ? "#b91c1c" : "#166534";
}

function withTabMessage(tabId, message, onSuccess, emptyError) {
  chrome.tabs.sendMessage(tabId, message, (response) => {
    if (chrome.runtime.lastError) {
      setStatus(chrome.runtime.lastError.message || emptyError, true);
      return;
    }

    if (!response?.ok || !response.details) {
      setStatus(emptyError, true);
      return;
    }

    onSuccess(response.details);
  });
}

async function loadProblemDetails() {
  const tab = await getCurrentTab();
  if (!tab?.id) {
    setStatus("No active tab found.", true);
    return;
  }

  withTabMessage(
    tab.id,
    { type: "GET_PROBLEM_DETAILS" },
    (details) => {
      document.getElementById("title").value = details.title || "";
      document.getElementById("platform").value = details.platform || "";
      document.getElementById("difficulty").value = details.difficulty || "Unknown";
      document.getElementById("notes").value = details.notes || "";
      document.getElementById("solution").value = details.solution || "";

      const userDifficulty = document.getElementById("userDifficulty");
      if (["Easy", "Medium", "Hard"].includes(details.difficulty)) {
        userDifficulty.value = details.difficulty;
      }
    },
    "Could not read problem details from this page."
  );
}

document.getElementById("saveBtn").addEventListener("click", async () => {
  const tab = await getCurrentTab();
  if (!tab?.id) {
    setStatus("No active tab found.", true);
    return;
  }

  withTabMessage(
    tab.id,
    { type: "GET_PROBLEM_DETAILS" },
    (details) => {
      const payload = {
        ...details,
        title: document.getElementById("title").value || details.title,
        userDifficulty: document.getElementById("userDifficulty").value,
        needRevision: document.getElementById("needRevision").checked,
        notes: document.getElementById("notes").value,
        solution: document.getElementById("solution").value || details.solution
      };

      chrome.runtime.sendMessage({ type: "SAVE_TO_SHEETS", payload }, (result) => {
        if (chrome.runtime.lastError) {
          setStatus(chrome.runtime.lastError.message || "Failed to save to Google Sheets.", true);
          return;
        }

        if (result?.ok) {
          setStatus("Saved to Google Sheets successfully.");
        } else {
          setStatus(result?.error || "Failed to save to Google Sheets.", true);
        }
      });
    },
    "Unable to capture data from current page."
  );
});

loadProblemDetails();

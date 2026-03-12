async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadTargetSetting() {
  const { storageTarget } = await chrome.storage.sync.get(["storageTarget"]);
  document.getElementById("storageTarget").value = storageTarget || "googleSheets";
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

function targetLabel(target) {
  return target === "notion" ? "Notion" : "Google Sheets";
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
      const storageTarget = document.getElementById("storageTarget").value;
      const payload = {
        ...details,
        storageTarget,
        title: document.getElementById("title").value || details.title,
        userDifficulty: document.getElementById("userDifficulty").value,
        needRevision: document.getElementById("needRevision").checked,
        notes: document.getElementById("notes").value,
        solution: document.getElementById("solution").value || details.solution
      };

      chrome.runtime.sendMessage({ type: "SAVE_PROBLEM", payload }, (result) => {
        if (chrome.runtime.lastError) {
          setStatus(chrome.runtime.lastError.message || `Failed to save to ${targetLabel(storageTarget)}.`, true);
          return;
        }

        if (result?.ok) {
          setStatus(`Saved to ${targetLabel(storageTarget)} successfully.`);
        } else {
          setStatus(result?.error || `Failed to save to ${targetLabel(storageTarget)}.`, true);
        }
      });
    },
    "Unable to capture data from current page."
  );
});

loadTargetSetting();
loadProblemDetails();

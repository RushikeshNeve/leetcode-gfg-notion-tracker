async function loadSettings() {
  const { storageTarget, googleScriptUrl, notionToken, notionDatabaseId } = await chrome.storage.sync.get([
    "storageTarget",
    "googleScriptUrl",
    "notionToken",
    "notionDatabaseId"
  ]);

  document.getElementById("storageTarget").value = storageTarget || "googleSheets";
  document.getElementById("googleScriptUrl").value = googleScriptUrl || "";
  document.getElementById("notionToken").value = notionToken || "";
  document.getElementById("notionDatabaseId").value = notionDatabaseId || "";
}

async function saveSettings() {
  const storageTarget = document.getElementById("storageTarget").value;
  const googleScriptUrl = document.getElementById("googleScriptUrl").value.trim();
  const notionToken = document.getElementById("notionToken").value.trim();
  const notionDatabaseId = document.getElementById("notionDatabaseId").value.trim();

  if (storageTarget === "googleSheets" && !googleScriptUrl) {
    document.getElementById("settingsStatus").textContent = "Please enter the Apps Script URL for Google Sheets.";
    return;
  }

  if (storageTarget === "notion" && (!notionToken || !notionDatabaseId)) {
    document.getElementById("settingsStatus").textContent = "Please enter Notion token and database ID.";
    return;
  }

  await chrome.storage.sync.set({
    storageTarget,
    googleScriptUrl,
    notionToken,
    notionDatabaseId
  });

  document.getElementById("settingsStatus").textContent = "Settings saved.";
}

document.getElementById("saveSettings").addEventListener("click", saveSettings);
loadSettings();

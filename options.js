async function loadSettings() {
  const { googleScriptUrl } = await chrome.storage.sync.get(["googleScriptUrl"]);
  document.getElementById("googleScriptUrl").value = googleScriptUrl || "";
}

async function saveSettings() {
  const googleScriptUrl = document.getElementById("googleScriptUrl").value.trim();

  if (!googleScriptUrl) {
    document.getElementById("settingsStatus").textContent = "Please enter the Apps Script URL.";
    return;
  }

  await chrome.storage.sync.set({ googleScriptUrl });
  document.getElementById("settingsStatus").textContent = "Settings saved.";
}

document.getElementById("saveSettings").addEventListener("click", saveSettings);
loadSettings();

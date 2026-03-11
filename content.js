function getPlatform() {
  const host = window.location.hostname;
  if (host.includes("leetcode.com")) return "LeetCode";
  if (host.includes("geeksforgeeks.org")) return "GFG";
  return "Unknown";
}

function getLeetCodeDetails() {
  const titleEl =
    document.querySelector("div.text-title-large a") ||
    document.querySelector("[data-cy='question-title']") ||
    document.querySelector("div.text-title-large");

  const difficultyCandidates = Array.from(document.querySelectorAll("div, span"));
  const difficultyEl = difficultyCandidates.find((el) => {
    const txt = el.textContent?.trim();
    return txt === "Easy" || txt === "Medium" || txt === "Hard";
  });

  const notesEl = document.querySelector("div[data-track-load='description_content']");

  let solution = "";
  let solutionLanguage = "";

  try {
    const models = window.monaco?.editor?.getModels?.() || [];
    if (models.length > 0) {
      solution = models[0].getValue();
    }
  } catch (_) {}

  solutionLanguage = document.querySelector("button.rounded.items-center")?.textContent?.trim() || "";

  return {
    platform: "LeetCode",
    title: titleEl?.textContent?.trim() || document.title,
    url: location.href,
    difficulty: difficultyEl?.textContent?.trim() || "Unknown",
    notes: notesEl?.innerText?.slice(0, 1200) || "",
    solution,
    solutionLanguage
  };
}

function getGfgDetails() {
  const titleEl = document.querySelector("h1");
  const bodyText = document.body.innerText || "";

  let detectedDifficulty = "Unknown";
  if (/\bEasy\b/i.test(bodyText)) detectedDifficulty = "Easy";
  else if (/\bMedium\b/i.test(bodyText)) detectedDifficulty = "Medium";
  else if (/\bHard\b/i.test(bodyText)) detectedDifficulty = "Hard";

  let solution = "";

  try {
    const monacoModels = window.monaco?.editor?.getModels?.() || [];
    if (monacoModels.length > 0) {
      solution = monacoModels[0].getValue();
    }
  } catch (_) {}

  try {
    if (!solution && window.editor?.getValue) {
      solution = window.editor.getValue();
    }
  } catch (_) {}

  return {
    platform: "GFG",
    title: titleEl?.textContent?.trim() || document.title,
    url: location.href,
    difficulty: detectedDifficulty,
    notes: "",
    solution,
    solutionLanguage: ""
  };
}

function scrapeProblemDetails() {
  const platform = getPlatform();
  if (platform === "LeetCode") return getLeetCodeDetails();
  if (platform === "GFG") return getGfgDetails();
  return null;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PROBLEM_DETAILS") {
    const details = scrapeProblemDetails();
    sendResponse({ ok: true, details });
  }
});

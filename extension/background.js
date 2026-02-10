
// SERVICE WORKER
const API_URL = "http://localhost:3000/api/extension/ingest";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "clip-to-strategyos",
    title: "Clip to StrategyOS",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "clip-to-strategyos" && info.selectionText) {
    try {
      const payload = {
        type: "clip",
        content: info.selectionText,
        source: tab?.url || "Unknown",
        title: tab?.title || "Clipped Content"
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Send success message to content script (if active) or notify
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => alert("✅ Saved to StrategyOS Inbox")
        });
      } else {
        console.error("Failed to clip", response.status);
      }
    } catch (error) {
       console.error("Error sending clip:", error);
       chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => alert("❌ Failed to connect to StrategyOS (Is localhost:3000 running?)")
        });
    }
  }
});

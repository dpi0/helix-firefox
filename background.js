// background.js

let previousTabId = null;

browser.commands.onCommand.addListener((command) => {
  if (command === "copy-url") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const url = tabs[0].url;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          console.log("URL copied to clipboard:", url);
        })
        .catch((error) => {
          console.error("Failed to copy URL to clipboard:", error);
        });
    });
  } else if (command === "switch-tabs") {
    switchTabs();
  }
});

function switchTabs() {
  browser.tabs.query({ currentWindow: true }).then((tabs) => {
    const activeTab = tabs.find((tab) => tab.active);
    if (previousTabId === null) {
      previousTabId = activeTab.id;
      return;
    }

    const previousTab = tabs.find((tab) => tab.id === previousTabId);
    if (!previousTab) {
      console.error("Previous tab not found.");
      return;
    }

    browser.tabs
      .update(previousTab.id, { active: true })
      .then(() => {
        const temp = previousTabId;
        previousTabId = activeTab.id;
        console.log("Switched to tab:", temp);
      })
      .catch((error) => {
        console.error("Failed to switch tabs:", error);
      });
  });
}

browser.tabs.onActivated.addListener((activeInfo) => {
  previousTabId = activeInfo.previousTabId;
});

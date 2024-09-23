let previousTabId = null;

// Function to handle copying the current page's URL to the clipboard
function copyUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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
}

// Function to switch to the previously active tab
function switchTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
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

    chrome.tabs
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

// Function to remove playlist part from YouTube URLs and open the video in a new tab
function removePlaylist(tab) {
  const url = new URL(tab.url);
  if (url.hostname === "www.youtube.com" && url.searchParams.has("v")) {
    const videoId = url.searchParams.get("v");
    const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
    chrome.tabs.create({ url: newUrl });
  }
}

// Function to handle context menu click
function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "copyCurrentUrl") {
    copyUrl();
  } else if (info.menuItemId === "removePlaylist") {
    removePlaylist(tab);
  }
}

// Create the context menu items
chrome.contextMenus.create({
  id: "copyCurrentUrl",
  title: "Copy Current URL",
  contexts: ["all"],
});

chrome.contextMenus.create({
  id: "removePlaylist",
  title: "Open in New Tab without Playlist",
  contexts: ["all"],
});

// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-url") {
    copyUrl();
  } else if (command === "switch-tabs") {
    switchTabs();
  } else if (command === "remove-playlist") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      removePlaylist(tabs[0]);
    });
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

// Update previousTabId when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  previousTabId = activeInfo.previousTabId;
});

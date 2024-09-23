let previousTabId = null;

// Function to handle copying the URL to the clipboard
function copyUrl(url) {
  navigator.clipboard
    .writeText(url)
    .then(() => {
      console.log("URL copied to clipboard:", url);
    })
    .catch((error) => {
      console.error("Failed to copy URL to clipboard:", error);
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
function removePlaylist(url) {
  const parsedUrl = new URL(url);
  if (
    parsedUrl.hostname === "www.youtube.com" &&
    parsedUrl.searchParams.has("v")
  ) {
    const videoId = parsedUrl.searchParams.get("v");
    const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
    chrome.tabs.create({ url: newUrl });
  }
}

// Function to handle context menu click
function handleContextMenuClick(info, tab) {
  if (info.menuItemId === "copyCurrentUrl") {
    if (info.linkUrl) {
      copyUrl(info.linkUrl);
    } else {
      copyUrl(tab.url);
    }
  } else if (info.menuItemId === "removePlaylist") {
    if (info.linkUrl) {
      removePlaylist(info.linkUrl);
    } else {
      removePlaylist(tab.url);
    }
  }
}

// Create the context menu items
browser.contextMenus.create({
  id: "copyCurrentUrl",
  title: "Copy URL",
  contexts: ["link", "page"],
  icons: {
    48: `icons/copy-url-48.svg`,
  },
});

browser.contextMenus.create({
  id: "removePlaylist",
  title: "Open YouTube Video in New Tab without Playlist",
  contexts: ["link"],
  icons: {
    48: `icons/no-playlist-48.svg`,
  },
});

// Listen for commands
chrome.commands.onCommand.addListener((command) => {
  if (command === "copy-url") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      copyUrl(tabs[0].url);
    });
  } else if (command === "switch-tabs") {
    switchTabs();
  } else if (command === "remove-playlist") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      removePlaylist(tabs[0].url);
    });
  }
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

// Update previousTabId when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  previousTabId = activeInfo.previousTabId;
});

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
  }
});

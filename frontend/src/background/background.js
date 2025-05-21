export {};

// On install, open the guide for the user
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: `${import.meta.env.VITE_APP_URL}/guide`,
    });
  }
});

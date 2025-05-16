export {};

// Initialize extension functionality on startup
chrome.runtime.onInstalled.addListener((details) => {
  // One-time setup for new installations
  if (details.reason === "install") {
    // Verify connectivity and prepare environment
    fetch(`${import.meta.env.VITE_API_URL_2}/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ installed: true }),
    })
      .then((response) => {
        if (!response.ok) {
          console.warn(`Connectivity check failed - Non-blocking: ${response.status}`);
          return null;
        }
        return response.json();
      })
      .then((data) => {
        // Initialization complete
      })
      .catch((error) => {
        // Error during startup routine
        console.warn("Network connectivity issue detected - Non-blocking");
      });
  }
});

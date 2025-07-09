// Preload script for secure contextBridge (if needed in the future)
window.addEventListener('DOMContentLoaded', () => {
  // Example: expose version info
  window.versions = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  };
});

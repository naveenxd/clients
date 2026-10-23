export function portName(storageLocation: chrome.storage.StorageArea) {
  // `chrome.storage.session` is not exposed to extension iframes that are embedded into
  // web pages. In-page panels therefore identify the background memory storage by the
  // port name instead of by the storage area they cannot access.
  if (storageLocation === chrome.storage.local) {
    return "local";
  }
  if (storageLocation === chrome.storage.sync) {
    return "sync";
  }
  if (storageLocation === chrome.storage.session || storageLocation == null) {
    return "session";
  }

  throw new Error("Unknown storage location");
}

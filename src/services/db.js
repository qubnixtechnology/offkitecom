const dbName = "offkilt_media_db";
const storeName = "media_files";

/**
 * Saves a file (Blob or File) or string to IndexedDB.
 * @param {string} key
 * @param {Blob|File|string} data
 * @returns {Promise<boolean>}
 */
export const saveMediaToIndexedDB = (key, data) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const putRequest = store.put(data, key);
      putRequest.onsuccess = () => resolve(true);
      putRequest.onerror = () => reject(putRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Retrieves data from IndexedDB by key.
 * @param {string} key
 * @returns {Promise<Blob|File|string|null>}
 */
export const getMediaFromIndexedDB = (key) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const getRequest = store.get(key);
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Removes data from IndexedDB by key.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export const deleteMediaFromIndexedDB = (key) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(dbName, 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const deleteRequest = store.delete(key);
      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
};

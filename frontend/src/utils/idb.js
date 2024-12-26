const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messages-db', 1);
  
      request.onerror = (event) => reject(event);
      request.onsuccess = (event) => resolve(event.target.result);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
      };
    });
  };
  
  export const getMessagesFromIndexedDB = async (contactId) => {
    const db = await openDB();
    const transaction = db.transaction('messages', 'readonly');
    const store = transaction.objectStore('messages');
    const request = store.getAll(contactId);
  
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
  };
  
  export const saveMessageToIndexedDB = async (contactId, message) => {
    const db = await openDB();
    const transaction = db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    store.put({ ...message, contactId });
  };
  
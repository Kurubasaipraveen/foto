import { useState, useEffect } from 'react';

function useContacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    // Mock fetching contacts from a backend or IndexedDB
    setContacts([
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' },
      { id: '3', name: 'Alice Johnson' },
    ]);
  }, []);

  return contacts;
}

export default useContacts;

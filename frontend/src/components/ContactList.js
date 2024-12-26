import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ContactList from './ContactList';
import ChatWindow from './ChatWindow';

function ChatApp() {
  const [selectedContactId, setSelectedContactId] = useState(null); 
  const { state } = useAppContext();

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId); 
  };

  const filteredMessages = state.messages.filter(
    (msg) => msg.contactId === selectedContactId
  );

  return (
    <div className="chat-app" style={{ display: 'flex', height: '100vh' }}>
      
      <div
        className="contact-panel"
        style={{ width: '30%', borderRight: '1px solid #ccc', overflowY: 'auto' }}
      >
        <ContactList onSelectContact={handleSelectContact} />
      </div>

      <div className="chat-panel" style={{ flex: 1 }}>
        {selectedContactId ? (
          <ChatWindow messages={filteredMessages} />
        ) : (
          <div style={{ padding: '20px' }}>Select a contact to view messages</div>
        )}
      </div>
    </div>
  );
}

export default ChatApp;

import React from 'react';
import { AppProvider } from './context/AppContext';  
import ContactList from './components/ContactList';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <ContactList />
        <ChatWindow />
      </div>
    </AppProvider>
  );
}

export default App;

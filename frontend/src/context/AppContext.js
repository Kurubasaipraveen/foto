import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  contacts: [],
  messages: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONTACTS':
      return { ...state, contacts: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Simulate fetching contacts and messages
  useEffect(() => {
    // Sample contacts
    const sampleContacts = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Alice Johnson' },
    ];

    // Sample messages
    const sampleMessages = [
      { id: 1, contactId: 1, text: 'Hello John!', timestamp: new Date() },
      { id: 2, contactId: 2, text: 'Hi Jane!', timestamp: new Date() },
      { id: 3, contactId: 1, text: 'How are you?', timestamp: new Date() },
    ];

    // Dispatch actions to set contacts and messages
    dispatch({ type: 'SET_CONTACTS', payload: sampleContacts });
    dispatch({ type: 'SET_MESSAGES', payload: sampleMessages });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within a AppProvider');
  }
  return context;
};

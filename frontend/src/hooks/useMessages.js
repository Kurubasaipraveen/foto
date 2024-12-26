import { useState, useEffect } from 'react';
import axios from 'axios';
import { getMessagesFromIndexedDB, saveMessageToIndexedDB } from '../utils/idb';

const INSTANTDB_API_URL = 'https://api.instantdb.com';  // Replace with your InstantDB API endpoint
const INSTANTDB_API_KEY = 'bc9a599a-bc1b-40de-a664-3c2c7df072b8';  // Replace with your InstantDB API Key

function useMessages(contactId) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      // Load local messages from IndexedDB
      const localMessages = await getMessagesFromIndexedDB(contactId);
      setMessages(localMessages);

      // Fetch real-time messages from InstantDB
      try {
        const response = await axios.get(`${INSTANTDB_API_URL}/messages`, {
          params: { contactId },
          headers: {
            Authorization: `Bearer ${INSTANTDB_API_KEY}`,
          },
        });
        const realTimeMessages = response.data;
        setMessages((prevMessages) => [...prevMessages, ...realTimeMessages]);
      } catch (error) {
        console.error("Error fetching real-time messages: ", error);
      }
    };

    loadMessages();
  }, [contactId]);

  const sendMessage = async (message) => {
    const newMessage = {
      text: message,
      fromMe: true,
      contactId,
      timestamp: new Date().toISOString(),
    };

    // Send message to InstantDB
    try {
      await axios.post(
        `${INSTANTDB_API_URL}/messages`,
        newMessage,
        {
          headers: {
            Authorization: `Bearer ${INSTANTDB_API_KEY}`,
          },
        }
      );

      // Save the message to IndexedDB for offline capabilities
      await saveMessageToIndexedDB(contactId, newMessage);

      // Update state with the new message
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return { messages, sendMessage };
}

export default useMessages;

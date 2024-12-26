import React from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

function ChatWindow({messages}) {
  return (
    <div className="chat-window" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="chat-history" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages && messages.length > 0 ? (
          messages.map((msg) => <Message key={msg.id} message={msg} />)
        ):(
          <div>No messages to display</div>
        )}
      </div>
      <MessageInput />
    </div>
  );
}

export default ChatWindow;

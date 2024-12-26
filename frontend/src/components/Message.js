import React from 'react';

function Message({ message }) {
  return (
    <div className={`message ${message.fromMe ? 'from-me' : 'from-other'}`}>
      <div>{message.text}</div>
    </div>
  );
}

export default Message;

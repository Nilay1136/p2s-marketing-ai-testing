import React, { useState } from 'react';
import './PrimaryContent.css';

const PrimaryContent = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Function to handle message submission
  const handleSendMessage = () => {
    if (userInput.trim() === '') return;

    // Add user's message to the chat
    const newMessage = {
      sender: 'user',
      text: userInput,
    };

    setMessages([...messages, newMessage]);

    // Clear the input field
    setUserInput('');

    // Simulate bot typing
    setIsTyping(true);

    // Simulate bot response after a delay
    setTimeout(() => {
      const botMessage = {
        sender: 'bot',
        text: 'This is a simulated response from the AI Assistant.',
      };
      setIsTyping(false); // Hide typing indicator when bot responds
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, 2000); // Bot response after 2 seconds
  };

  return (
    <div className="primary-content">
      <div className="chat-history">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            {message.text}
          </div>
        ))}
        {isTyping && (
          <div className="chat-message typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default PrimaryContent;

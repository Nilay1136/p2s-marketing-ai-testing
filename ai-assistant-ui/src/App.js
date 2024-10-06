import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaPaperPlane, FaBars, FaChevronLeft, FaChevronRight, FaEdit, FaPlus, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import logo from './P2S_Legence_Logo_White.png'; // Ensure the correct path for the logo

// Reusable Circular Logo Component for Bot Messages with blue circle and lime green dot
const CircularLogo = ({ isBotMessage }) => (
  <div className={`circular-logo ${isBotMessage ? 'bot-logo' : ''}`}>
    <div className="blue-circle">
      <img src={logo} alt="Logo" className="circular-logo-image" />
      <div className="lime-green-dot"></div> {/* Lime green dot added here */}
    </div>
  </div>
);

// Department List Component
const DepartmentList = ({ isVisible, toggleDepartmentList, handleDepartmentSelection }) => {
  return (
    <div className="department-dropdown">
      <button className="department-button" onClick={toggleDepartmentList}>
        <FaBars />
      </button>
      <ul className={`department-list ${isVisible ? 'expanded' : ''}`}>
        <li onClick={() => handleDepartmentSelection('Human Resources')}>Human Resources</li>
        <li onClick={() => handleDepartmentSelection('Project Management')}>Project Management</li>
        <li onClick={() => handleDepartmentSelection('Engineering')}>Engineering</li>
        <li onClick={() => handleDepartmentSelection('BIM')}>BIM</li>
        <li onClick={() => handleDepartmentSelection('Marketing')}>Marketing</li>
        <li onClick={() => handleDepartmentSelection('IT')}>IT</li>
      </ul>
    </div>
  );
};

function App() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Sample Conversation',
      messages: [
        { sender: 'AI Assistant', text: 'Welcome to the conversation!', timestamp: new Date().toLocaleString(), rating: null },
      ],
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDepartmentListVisible, setIsDepartmentListVisible] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Select an AI Assistant');
  const [editMode, setEditMode] = useState({});

  const chatHistoryRef = useRef(null); // Reference to chat history

  // Scroll to the bottom of the chat history when a new message is added
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversations, isTyping]); // Scroll when conversations or typing state changes

  // Toggle the department dropdown visibility
  const toggleDepartmentList = () => {
    setIsDepartmentListVisible(!isDepartmentListVisible);
  };

  // Handle department selection
  const handleDepartmentSelection = (department) => {
    setSelectedDepartment(department);
    setIsDepartmentListVisible(false);

    // Create a casual bot message after department selection
    const departmentBotMessage = {
      sender: 'AI Assistant',
      text: `You've chosen the ${department} AI Assistant! I’ll be answering your questions using information from our ${department} knowledge base.`
      + ` How can I help you today?`,
      timestamp: new Date().toLocaleString(),
      rating: null,
    };

    // Append the bot message to the conversation
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, messages: [...conversation.messages, departmentBotMessage] }
          : conversation
      )
    );
  };

  // Function to handle adding a new conversation
  const handleAddConversation = () => {
    if (conversations.length < 10) {
      const newConversation = {
        id: conversations.length + 1,
        name: `Conversation ${conversations.length + 1}`,
        messages: [],
      };
      setConversations([...conversations, newConversation]);
      setActiveConversationId(newConversation.id);
    } else {
      alert("You can't add more than 10 conversations.");
    }
  };

  // Function to handle editing a conversation name
  const handleEditConversationName = (id, newName) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === id ? { ...conversation, name: newName } : conversation
      )
    );
    setEditMode((prevEditMode) => ({ ...prevEditMode, [id]: false })); // Turn off edit mode after saving
  };

  // Function to toggle edit mode for a conversation
  const toggleEditMode = (id) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [id]: !prevEditMode[id],
    }));
  };

  // Function to handle sending messages
  const handleSendMessage = () => {
    if (userInput.trim() === '') return;

    const newMessage = { sender: 'user', text: userInput, timestamp: new Date().toLocaleString() };

    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, messages: [...conversation.messages, newMessage] }
          : conversation
      )
    );

    setUserInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        sender: 'AI Assistant',
        text: `This is a response from the ${selectedDepartment} AI Assistant.`,
        timestamp: new Date().toLocaleString(),
        rating: null, // Add initial null rating
      };

      setConversations((prevConversations) =>
        prevConversations.map((conversation) =>
          conversation.id === activeConversationId
            ? { ...conversation, messages: [...conversation.messages, botResponse] }
            : conversation
        )
      );
      setIsTyping(false);
    }, 2000);
  };

  // Handle rating a bot response
  const handleRateMessage = (conversationId, messageIndex, rating) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: conversation.messages.map((msg, idx) =>
                idx === messageIndex ? { ...msg, rating } : msg
              ),
            }
          : conversation
      )
    );
  };

  // Function to toggle the left panel collapse
  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  return (
    <div className="app">
      {/* Main Header */}
      <header className="main-header">
        <CircularLogo isBotMessage={false} />
        <h1>{selectedDepartment}</h1>
        {/* Render Department List Component */}
        <DepartmentList
          isVisible={isDepartmentListVisible}
          toggleDepartmentList={toggleDepartmentList}
          handleDepartmentSelection={handleDepartmentSelection}
        />
      </header>

      {/* Main Body Content */}
      <div className="main-body">
        {/* Left Sidebar (History) */}
        <div className={`left-panel ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
          {/* History Header */}
          <div className="history-header">
            <h3 className={`history-title ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
              History
            </h3>
            <div className="sidebar-toggle" onClick={toggleLeftPanel}>
              {isLeftPanelCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </div>
          </div>

          {/* Conversation List and Add Button */}
          {!isLeftPanelCollapsed && (
            <>
              <ul>
                {conversations.map((conversation) => (
                  <li
                    key={conversation.id}
                    className={`conversation-item ${
                      conversation.id === activeConversationId ? 'active-conversation' : ''
                    }`}
                    onClick={() => setActiveConversationId(conversation.id)}
                  >
                    {editMode[conversation.id] ? (
                      <div className="edit-conversation">
                        <input
                          type="text"
                          defaultValue={conversation.name}
                          onBlur={(e) =>
                            handleEditConversationName(conversation.id, e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <span>{conversation.name}</span>
                        <button
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEditMode(conversation.id);
                          }}
                        >
                          <FaEdit />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <button
                className="add-conversation-button"
                onClick={handleAddConversation}
              >
                <FaPlus /> Add Conversation
              </button>
            </>
          )}
        </div>

        {/* Chat Input Section */}
        <div className="chat-panel">
          <div className="chat-history" ref={chatHistoryRef}>
            {activeConversation?.messages.map((msg, index) => (
              <div key={index} className="message-row">
                {msg.sender === 'AI Assistant' && (
                  <CircularLogo isBotMessage style={{ transform: 'scale(0.5)' }} />
                )}
                <div
                  className={`message ${
                    msg.sender === 'user' ? 'user-message' : 'bot-message'
                  }`}
                >
                  {msg.text}
                  <div className="timestamp">{msg.timestamp}</div>
                  {msg.sender === 'AI Assistant' && (
                    <div className="rating">
                      <span>Rate the response:</span>
                      <FaThumbsUp
                        className={`thumbs-up ${msg.rating === 'good' ? 'selected' : ''}`}
                        onClick={() => handleRateMessage(activeConversationId, index, 'good')}
                      />
                      <FaThumbsDown
                        className={`thumbs-down ${msg.rating === 'bad' ? 'selected' : ''}`}
                        onClick={() => handleRateMessage(activeConversationId, index, 'bad')}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
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
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

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

// Banner Component to display announcements and events
const Banner = ({ announcements }) => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements]);

  if (!announcements.length) {
    return null; // No announcements to display
  }

  return (
    <div className="banner">
      <p>{announcements[currentAnnouncement]}</p>
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

  const [announcements] = useState([
    'Benefits Open Enrollment is Monday, Nov. 4, through Friday, Nov. 15.',
    'The company holiday party is scheduled for Friday, Dec. 20, at 6 PM.',
    'The annual performance review period is from Monday, Jan. 6, through Friday, Jan. 17.',
    'The office will be closed on Friday, July 3, in observance of Independence Day.',
    'Don\'t forget to fill out your timecards at the end of each day.',
  ]);

  const [activeConversationId, setActiveConversationId] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDepartmentListVisible, setIsDepartmentListVisible] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Select an AI Assistant');
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false); // State for right panel visibility
  const [editMode, setEditMode] = useState({});

  const chatHistoryRef = useRef(null); // Reference to chat history

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversations, isTyping]);

  const toggleDepartmentList = () => {
    setIsDepartmentListVisible(!isDepartmentListVisible);
  };

  const handleDepartmentSelection = (department) => {
    setSelectedDepartment(department);
    setIsDepartmentListVisible(false);

    const departmentBotMessage = {
      sender: 'AI Assistant',
      text: `You've chosen the ${department} AI Assistant! I’ll be answering your questions using information from our ${department} knowledge base. How can I help you today?`,
      timestamp: new Date().toLocaleString(),
      rating: null,
    };

    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, messages: [...conversation.messages, departmentBotMessage] }
          : conversation
      )
    );
  };

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

  const handleEditConversationName = (id, newName) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === id ? { ...conversation, name: newName } : conversation
      )
    );
    setEditMode((prevEditMode) => ({ ...prevEditMode, [id]: false })); 
  };

  const toggleEditMode = (id) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [id]: !prevEditMode[id],
    }));
  };

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

    // Check for 'proposal' to show the right panel and 'hide display area' to hide it
    if (userInput.toLowerCase().includes('proposal')) {
      setIsRightPanelVisible(true);  // Show the right panel
    } else if (userInput.toLowerCase().includes('hide display area')) {
      setIsRightPanelVisible(false); // Hide the right panel if "hide display area" is typed
    }

    setUserInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        sender: 'AI Assistant',
        text: `This is a response from the ${selectedDepartment} AI Assistant.`,
        timestamp: new Date().toLocaleString(),
        rating: null, 
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

  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  return (
    <div className="app">
      <header className="main-header">
        <CircularLogo isBotMessage={false} />
        <h1>{selectedDepartment}</h1>
        <DepartmentList
          isVisible={isDepartmentListVisible}
          toggleDepartmentList={toggleDepartmentList}
          handleDepartmentSelection={handleDepartmentSelection}
        />
      </header>

      <Banner announcements={announcements} />

      <div className="main-body">
        <div className={`left-panel ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
          <div className="history-header">
            <h3 className={`history-title ${isLeftPanelCollapsed ? 'collapsed' : ''}`}>
              History
            </h3>
            <div className="sidebar-toggle" onClick={toggleLeftPanel}>
              {isLeftPanelCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </div>
          </div>

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
              <button className="add-conversation-button" onClick={handleAddConversation}>
                <FaPlus /> Add Conversation
              </button>
            </>
          )}
        </div>

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

        {isRightPanelVisible && (
          <div className="right-panel">
            <h3>Proposal Details</h3>
            <p>Here you can find information related to the proposal process.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef,useCallback } from 'react';
import axios from 'axios';
import './App.css';
import {
  FaPaperPlane,
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaPlus,
  FaThumbsUp,
  FaThumbsDown,
  FaSignOutAlt,
  FaSignInAlt
} from 'react-icons/fa';
import logo from './P2S_Legence_Logo_White.png';
//1
import { API_BASE_URL } from './apiConfig'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import { Trash } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';
import { useMsal, useAccount, AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest,apiRequest } from "./authConfig";
import PageLayout from "./PageLayout.js";

// Set the app element for accessibility
Modal.setAppElement('#root');  //2

//3
// Debounce function to limit the rate of function execution
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Reusable Circular Logo Component for Bot Messages with blue circle and lime green dot
const CircularLogo = ({ isBotMessage }) => (
  <div className={`circular-logo ${isBotMessage ? 'bot-logo' : ''}`}>
    <div className="blue-circle">
      <img src={logo} alt="Logo" className="circular-logo-image" />
      <div className="lime-green-dot"></div> {/* Lime green dot added here */}
    </div>
  </div>
);

//4
// Department List Component
const DepartmentList = ({
  isVisible,
  toggleDepartmentList,
  handleDepartmentSelection,
  selectedDepartment
}) => {
  // Define departments with a flag indicating if they are enabled
  const departments = [
    { name: 'Human Resources', enabled: true },
    { name: 'Project Management', enabled: false },
    { name: 'Engineering', enabled: false },
    { name: 'BIM', enabled: false },
    { name: 'Marketing', enabled: false },
    { name: 'IT', enabled: false },
  ];

  // Function to handle mouse enter on disabled departments
  const handleMouseEnter = (dept) => {
    if (!dept.enabled) {
      toast.info("Coming Soon!", {
        position: "top-right",
        autoClose: 2000, // Duration in milliseconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <div className="department-dropdown">
      <button className="department-button" onClick={toggleDepartmentList}>
        <FaBars />
      </button>
      <ul className={`department-list ${isVisible ? 'expanded' : ''}`}>
        {departments.map((dept, index) => (
          <li
            key={index}
            className={`department-item ${
              !dept.enabled ? 'disabled' : ''
            } ${dept.name === selectedDepartment ? 'active' : ''}`}
            onClick={() => {
              if (dept.enabled) {
                handleDepartmentSelection(dept.name);
              }
            }}
            aria-disabled={!dept.enabled}
            tabIndex={!dept.enabled ? -1 : 0}
            onMouseEnter={() => handleMouseEnter(dept)}
          >
            {dept.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

//modified component
// Banner Component to display announcements and events
const Banner = ({ announcements }) => {
  const bannerTextRef = useRef(null);
  const [animationDuration, setAnimationDuration] = useState(0);

  useEffect(() => {
    const updateAnimationDuration = () => {
      const bannerTextElement = bannerTextRef.current;
      const bannerWrapper = document.querySelector('.banner-text-wrapper');

      if (bannerTextElement && bannerWrapper) {
        setAnimationDuration(150);
      }
    };

    updateAnimationDuration();
    window.addEventListener('resize', updateAnimationDuration);

    return () => {
      window.removeEventListener('resize', updateAnimationDuration);
    };
  }, [announcements]);

  const combinedAnnouncments = announcements.join(" ~~~●~~~ "); // Combine all announcements for animation

  return (
    <div className="banner">
      <div className="banner-text-wrapper">
        <span 
          className="banner-text"
          ref={bannerTextRef}
          style={{ animationDuration: `${animationDuration}s` }}
          dangerouslySetInnerHTML={{ __html: combinedAnnouncments}}
        ></span>
      </div>
    </div>
  ); 
};

//new component
const Footer = () => {
  const [showAboutTooltip, setShowAboutTooltip] = useState(false);
  const [showDisclaimerTooltip, setShowDisclaimerTooltip] = useState(false);

  return (
    <footer className="footer">
      <div className="footer-left">
        <div 
          className="tooltip-container" 
          onMouseEnter={() => setShowAboutTooltip(true)} 
          onMouseLeave={() => setShowAboutTooltip(false)}
        >
          <span className="footer-text">About</span>
          {showAboutTooltip && (
            <div className="tooltip">
              Our P2S AI Assistant was developed by Nilay Nagar, Chad Peterson, and Jonathan Herrera.
            </div>
          )}
        </div>

        <div 
          className="tooltip-container" 
          onMouseEnter={() => setShowDisclaimerTooltip(true)} 
          onMouseLeave={() => setShowDisclaimerTooltip(false)}
        >
          <span className="footer-text">| Disclaimer</span>
          {showDisclaimerTooltip && (
            <div className="tooltip">
              AI-generated responses may not always be accurate. 
              Verify information before making decisions.
            </div>
          )}
        </div>
      </div>

      <div className="footer-right">
        <a href="https://www.p2sinc.com" target="_blank" rel="noopener noreferrer">
          www.p2sinc.com
        </a>
        <span> | © {new Date().getFullYear()} P2S All rights reserved.</span>
      </div>
    </footer>
  );
};

function App() {
  const [conversations, setConversations] = useState([]); //5
  const { instance, accounts } = useMsal(); //6
  const account = useAccount(accounts[0] || {}); //7
  const isAuthenticated = useIsAuthenticated(); //8
  const [user, setUser] = useState(null); //9
  const [accessToken, setAccessToken] = useState(''); //10
  const [error, setError] = useState(null); //11


  const [announcements] = useState([
    'Benefits Open Enrollment is Monday, Nov. 4, through Friday, Nov. 15.',
    'Upcoming Company Holidays: November 28-29 & December 24, 2024-January 1, 2025.',
    'P2S 2025 Payroll and Holiday Calendar is available on the Intranet > HR > HR Toolbox.',
    'FSA Reminder: You have until December 31 to incur eligible expenses for the 2024 plan year. Unused funds (up to $610) in your Healthcare FSA will roll over to the next plan year. Any amount over $610 will be forfeited.',
    'Update your Employee Information (Address Changes): To ensure you receive end-of-year tax and benefit information, please confirm that your address and other personal details are accurate in <a href="https://access.paylocity.com/">Paylocity</a>.',
    'Don\'t forget to fill out your timecards at the end of each day.',
  ]);

  const [activeConversationId, setActiveConversationId] = useState(null); //modified 1 to null
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDepartmentListVisible, setIsDepartmentListVisible] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Human Resources'); //modified default HR
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false); // State for right panel visibility
  const [editMode, setEditMode] = useState({});
  const [feedbackState, setFeedbackState] = useState({}); //12
  const chatHistoryRef = useRef(null); // Reference to chat history

  //13
  //lets fetch user data
  useEffect(()=>{
    if(isAuthenticated&&account){
      const fetchUserData=async()=>{
        if(account){
          try{
            console.log('Getting token....')
            const tokenResponse=await instance.acquireTokenSilent({
              ...apiRequest,
              account:account
            });
            console.log('Token acquired success!!')
            console.log('Token: ',tokenResponse.accessToken)
            setAccessToken(tokenResponse.accessToken)
            const tokenPayload = JSON.parse(atob(tokenResponse.accessToken.split('.')[1]));
            console.log('Token payload:', tokenPayload);
            const response = await fetch(`${API_BASE_URL}/api/me`, {
              headers: {
                'Authorization': `Bearer ${tokenResponse.accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API call failed: ${response.status} - ${errorText}`);
            }
  
            const data = await response.json();
            console.log('User data:', data);
            setUser(data);
            setError(null);
          }catch(error){
            console.error('Error fetching user data:', error);
            setError(error.message);
            
            if (error.name === "InteractionRequiredAuthError") {
              try {
                await instance.acquireTokenRedirect({
                  ...apiRequest,
                  account: account
                });
              } catch (redirectError) {
                console.error('Token redirect failed:', redirectError);
              }
          }
        }
      }
    }; fetchUserData();
  }
  }, [isAuthenticated, account, instance]);

  //14
  //fetch chats for user
  useEffect(() => {
    const fetchChats = async () => {
      if (!isAuthenticated || !user) return; // Changed isLoggedIn to isAuthenticated

      try {
        const response = await axios.get(`${API_BASE_URL}/chats`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json', // Added Content-Type
          }
        });
        const fetchedChats = response.data;

        if (fetchedChats.length > 0) {
          setConversations(fetchedChats);
          setActiveConversationId(fetchedChats[0].id);
          setSelectedDepartment(fetchedChats[0].department || 'Human Resources');
        } else {
          // If no chats exist, create a default chat for "Human Resources"
          await createNewChat();
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to fetch chats. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchChats();
  }, [isAuthenticated, user, accessToken]);


  //login and logout handlers

  const LoginPage = ({ onLogin }) => {
    return (
        <PageLayout>
          <div className="login-container">
            <button className="login-button" onClick={onLogin}>
              <FaSignInAlt/> Sign In with Microsoft
            </button>
          </div>
        </PageLayout>
    );
  };
  
  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      const tokenResponse = await instance.acquireTokenSilent(loginRequest);
      console.log("Access Token:", tokenResponse.accessToken); // Should NOT start with 'Bearer '
      setAccessToken(tokenResponse.accessToken);
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error(e);
      toast.error("Logout failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    });
  };


  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [conversations, isTyping]);

  const toggleDepartmentList = () => {
    setIsDepartmentListVisible(!isDepartmentListVisible);
  };

  //15
  const handleDepartmentSelection = (department) => {
    if (department === selectedDepartment) {
      // If the selected department is already active, do nothing
      setIsDepartmentListVisible(false);
      return;
    }

    // Check if a chat for the selected department already exists
    const existingChat = conversations.find(conv => conv.department === department);
    if (existingChat) {
      // Activate the existing chat
      setActiveConversationId(existingChat.id);
      setSelectedDepartment(department);
      setIsDepartmentListVisible(false);
    } else {
      // Create a new chat for the department
      setSelectedDepartment(department);
      setIsDepartmentListVisible(false);
      createNewChat();
    }
  };

  //16
  //Create a new chat
  const createNewChat = async () => { 
    try {
      const token = accessToken;
      if (!token) {
        throw new Error("Access token is missing.");
      }
  
      console.log('Access Token:', token);
  
      const response = await axios.post(
        `${API_BASE_URL}/create_chat`,
        {}, // Ensure payload matches backend expectations
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Correctly prefixed
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Create chat response:', response.data);
  
      const newChat = {
        id: response.data.chat_id, // Ensure 'chat_id' matches the backend's response
        name: `Chat ${response.data.chat_id.slice(0, 8)}`,
        department: 'Human Resources',
        messages: [],
      };
      setConversations((prev) => [...prev, newChat]);
      setActiveConversationId(newChat.id);
      toast.success("New chat created for Human Resources");
    } catch (error) {
      console.error("Error creating chat:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        // Token might be expired, try to get a new one
        setAccessToken('');
        toast.error('Authentication expired. Please try again.');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to create chat');
      }
    }
  };

  //17
  const handleSendMessage = useCallback(async () => {
    if (userInput.trim() === '' || !activeConversationId) return;

    console.log("Sending message:", userInput);
    const token = accessToken;

    const newMessage = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toISOString(),
      rating: null
    };
    updateConversationMessages(activeConversationId, newMessage);

    setUserInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/send_message`, {
        chat_id: activeConversationId,
        message: userInput,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      console.log("Received response:", response.data);

      // Only add bot response if there's actual response content
      if (response.data.response && response.data.response.trim() !== '') {
        const botResponse = {
          sender: 'AI Assistant',
          text: response.data.response,
          timestamp: new Date().toISOString(),
          response_id: response.data.response_id,
          query: userInput,
          rating: null,
          feedbackSubmitted: false,
          sources: response.data.sources || []
        };
        console.debug("Bot response:", botResponse);
        updateConversationMessages(activeConversationId, botResponse);
      } else {
        console.debug("No response needed for casual message");
        // Don't show any error or warning for intentionally empty responses
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const botResponse = {
        sender: 'AI Assistant',
        text: "An unexpected error occurred. Please try again.",
        timestamp: new Date().toISOString(),
        response_id: null,
        query: userInput,
        rating: null,
        feedbackSubmitted: false,
        sources: []
      };
      updateConversationMessages(activeConversationId, botResponse);
    } finally {
      setIsTyping(false);
    }
  }, [userInput, activeConversationId, accessToken]);
  // //sendmessage
  // const handleSendMessage = useCallback(async () => {
  //   if (userInput.trim() === '' || !activeConversationId) return;

  //   console.log("Sending message:", userInput);
  //   const token=accessToken

  //   const newMessage = {
  //     sender: 'user',
  //     text: userInput,
  //     timestamp: new Date().toISOString(),
  //     rating: null
  //   };
  //   updateConversationMessages(activeConversationId, newMessage);

  //   setUserInput('');
  //   setIsTyping(true);

  //   try {
  //     const response = await axios.post(`${API_BASE_URL}/send_message`, {
  //       chat_id: activeConversationId,
  //       message: userInput,
  //     }, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json', // Added Content-Type
  //       }
  //     });

  //     console.log("Received response:", response.data);

  //     if (response.data.response) {
  //       const botResponse = {
  //         sender: 'AI Assistant',
  //         text: response.data.response,
  //         timestamp: new Date().toISOString(),
  //         response_id: response.data.response_id, // Store response_id
  //         query: userInput, // Store the original user query
  //         rating: null,
  //         feedbackSubmitted: false ,// Track if feedback has been submitted
  //         sources: response.data.sources || []
  //       };
  //       console.debug("bot responded", botResponse)
  //       updateConversationMessages(activeConversationId, botResponse);
  //     } else {
  //       console.warn("No response text received");
  //     }
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //     const botResponse = {
  //       sender: 'AI Assistant',
  //       text: "An unexpected error occurred. Please try again.",
  //       timestamp: new Date().toISOString(),
  //       response_id: null,
  //       query: userInput,
  //       rating: null,
  //       feedbackSubmitted: false
  //     };
  //     updateConversationMessages(activeConversationId, botResponse);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // }, [userInput, activeConversationId, accessToken]);

  //18
  // Debounced version of handleSendMessage to prevent rapid-fire messages
  const debounceSendMessage = useCallback(debounce(handleSendMessage, 300), [handleSendMessage]);

  //19 delete
  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/chats/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json', // Added Content-Type
        }
      });

      if (response.status !== 200) {
        throw new Error('Failed to delete conversation');
      }

      console.log('Conversation deleted successfully');

      // Remove the conversation from the state
      setConversations((prevConversations) =>
        prevConversations.filter((conversation) => conversation.id !== conversationId)
      );

      // Update the active conversation if the deleted one was active
      if (activeConversationId === conversationId) {
        const remainingConversations = conversations.filter((conv) => conv.id !== conversationId);
        if (remainingConversations.length > 0) {
          setActiveConversationId(remainingConversations[0].id);
          setSelectedDepartment(remainingConversations[0].department || 'Human Resources');
        } else {
          setActiveConversationId(null);
          setSelectedDepartment('Human Resources');
          // Optionally, create a default chat if no conversations remain
          createNewChat();
        }
      }
      toast.success("Conversation deleted successfully", {
        position: "top-right",
        autoClose: 1000,
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error("Failed to delete the conversation. Please try again.", {
        position: "top-right",
        autoClose: 1000,
      });
    }
  };

  //20
  // Function to update messages in a conversation
  const updateConversationMessages = (conversationId, message) => {
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation
      )
    );
  };

  //modified
  const handleAddConversation = () => {
    if (conversations.length < 10) {
      createNewChat(); // Removed department parameter
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

  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId
  );

  //21
  // Feedback Handlers
  const handleRating = (response_id, isHelpful, query, response) => {
    // Show comment input if needed
    setFeedbackState((prevState) => ({
      ...prevState,
      [response_id]: { isVisible: true, isHelpful, query, response, comment: '' }
    }));
  };

  const handleCommentChange = (response_id, comment) => {
    setFeedbackState((prevState) => ({
      ...prevState,
      [response_id]: { ...prevState[response_id], comment }
    }));
  };

  const submitFeedback = async (response_id) => {
    const feedback = feedbackState[response_id];
    if (!feedback) return;

    const { isHelpful, query, response, comment } = feedback;

    try {
      await axios.post(`${API_BASE_URL}/feedback`, {
        response_id,
        query,
        response,
        is_helpful: isHelpful,
        comment,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      // Update message to indicate feedback has been submitted
      setConversations((prevConversations) =>
        prevConversations.map((conversation) =>
          conversation.id === activeConversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((msg) =>
                  msg.response_id === response_id
                    ? { ...msg, feedbackSubmitted: true }
                    : msg
                )
              }
            : conversation
        )
      );

      // Hide feedback input
      setFeedbackState((prevState) => ({
        ...prevState,
        [response_id]: { ...prevState[response_id], isVisible: false }
      }));
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  

  return (
    <div className="app">

      {/* Toast Container for Notifications */}
      <ToastContainer />
      <UnauthenticatedTemplate>
        <LoginPage onLogin={handleLogin} />
      </UnauthenticatedTemplate>

      <AuthenticatedTemplate>
        <>
        <header className="main-header">
          <div className="header-left">
            <CircularLogo isBotMessage={false} />
            <div className="title-stack">
              <h1 className="welcome-text">Welcome, {user?.username}</h1>
              <h1 className="department-title">{selectedDepartment}</h1>
            </div>
          </div>
          
          <div className="header-controls">
            <DepartmentList
              isVisible={isDepartmentListVisible}
              toggleDepartmentList={toggleDepartmentList}
              handleDepartmentSelection={handleDepartmentSelection}
              selectedDepartment={selectedDepartment}
            />
          </div>
          <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

      <Banner announcements={announcements} />

      <div className="main-body">
        {/* Left Sidebar (History) */}
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
                        onClick={() => {
                          setActiveConversationId(conversation.id);
                          setSelectedDepartment(conversation.department || 'Human Resources');
                        }}
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
                              className="delete-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(conversation.id);
                              }}
                            >
                              <Trash size={18} color="white" />
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="add-conversation-button"
                    onClick={() => handleAddConversation()}
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
                      <CircularLogo isBotMessage={true} />
                    )}
                    <div
                      className={`message ${
                        msg.sender === 'user' ? 'user-message' : 'bot-message'
                      }`}
                    >
                      {/* Render message text as Markdown */}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                          table: ({ node, ...props }) => (
                            <table {...props} style={{ border: '1px solid #dee2e6', borderCollapse: 'collapse' }} />
                          ),
                          th: ({ node, ...props }) => (
                            <th {...props} style={{ backgroundColor: '#f2f2f2', padding: '8px', border: '1px solid #dee2e6' }} />
                          ),
                          td: ({ node, ...props }) => (
                            <td {...props} style={{ padding: '8px', border: '1px solid #dee2e6' }} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong {...props} style={{ fontWeight: 'bold' }} />
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                      {/* Add Sources Display with updated logic */}
                      {msg.sender === 'AI Assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="message-sources">
                          <div className="sources-header">Sources:</div>
                          <ul className="sources-list">
                            {msg.sources.map((source, idx) => (
                              <li key={idx} className="source-item">
                                {source.source_link ? (
                                  // If source_link exists, only show the link
                                  <a 
                                    href={source.source_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="source-link"
                                  >
                                    View Document
                                  </a>
                                ) : (
                                  // If no source_link, show document and page
                                  <>
                                    <span className="source-document">{source.document}</span>
                                    {source.page && <span className="source-page"> (Page {source.page})</span>}
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
      
                      <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>

                      {/* Feedback Section for AI Assistant Messages */}
                      {msg.sender === 'AI Assistant' && msg.response_id && !msg.feedbackSubmitted && (
                        <div className="rating">
                          <span>Rate the response:</span>
                          <FaThumbsUp
                            className="thumbs-up"
                            onClick={() => handleRating(msg.response_id, true, msg.query, msg.text)}
                          />
                          <FaThumbsDown
                            className="thumbs-down"
                            onClick={() => handleRating(msg.response_id, false, msg.query, msg.text)}
                          />
                        </div>
                      )}

                      {/* Feedback Form */}
                      {msg.sender === 'AI Assistant' && msg.response_id && feedbackState[msg.response_id]?.isVisible && (
                        <div className="feedback-form">
                          <textarea
                            placeholder="Add a comment (optional)"
                            value={feedbackState[msg.response_id].comment}
                            onChange={(e) => handleCommentChange(msg.response_id, e.target.value)}
                          ></textarea>
                          <button onClick={() => submitFeedback(msg.response_id)}>Submit Feedback</button>
                        </div>
                      )}

                      {/* Confirmation of Feedback Submission */}
                      {msg.sender === 'AI Assistant' && msg.feedbackSubmitted && (
                        <div className="feedback-confirmation">
                          Thank you for your feedback!
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
                  onKeyPress={(e) => e.key === 'Enter' && debounceSendMessage()}
                />
                <button onClick={debounceSendMessage}>
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
      <div className="footer-panel">
          <Footer />
      </div>  
        </>
      </AuthenticatedTemplate>

    </div>
  );
}

export default App;

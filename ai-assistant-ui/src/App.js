import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { API_ENDPOINTS, DEPARTMENT_AGENT_MAP } from './apiConfig'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import { Trash } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

// Import components (create fallbacks if missing)
let UploadButton, Tools, ProgressBar, UploadedFiles, AgentIndicator;

try {
  AgentIndicator = require('./AgentIndicator').default;
} catch (e) {
  // Fallback component if AgentIndicator.js doesn't exist yet
  AgentIndicator = ({ agentType }) => (
    <div style={{ 
      display: 'inline-block', 
      fontSize: '10px', 
      backgroundColor: '#4f46e5', 
      color: 'white', 
      padding: '2px 6px', 
      borderRadius: '8px', 
      marginBottom: '4px' 
    }}>
      {agentType?.toUpperCase() || 'AI'}
    </div>
  );
}

try {
  UploadButton = require('./UploadButton').default;
} catch (e) {
  UploadButton = ({ onFileUpload, onUploadProgress, disabled }) => (
    <button 
      className="upload-button" 
      disabled={disabled}
      onClick={() => toast.info("Upload feature coming soon!")}
      title="Upload files"
    >
      📎
    </button>
  );
}

try {
  Tools = require('./Tools').default;
} catch (e) {
  Tools = ({ selectedDepartment, onToolSelect }) => (
    <div className="tools-section" style={{ padding: '10px', marginTop: '10px' }}>
      <h4 style={{ color: '#666' }}>🛠 Tools</h4>
      <div style={{ fontSize: '12px', color: '#999' }}>Coming Soon</div>
    </div>
  );
}

try {
  ProgressBar = require('./ProgressBar').default;
} catch (e) {
  ProgressBar = ({ file, progress, status, onCancel }) => (
    <div style={{ padding: '5px', fontSize: '12px' }}>
      Uploading {file.name}: {progress}%
    </div>
  );
}

try {
  UploadedFiles = require('./UploadedFiles').default;
} catch (e) {
  UploadedFiles = ({ files, onRemoveFile, maxVisible }) => (
    <div style={{ padding: '5px', fontSize: '12px' }}>
      {files.length} file(s) uploaded
    </div>
  );
}

// Set the app element for accessibility
Modal.setAppElement('#root');

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
      <div className="lime-green-dot"></div>
    </div>
  </div>
);

// Department List Component
const DepartmentList = ({
  isVisible,
  toggleDepartmentList,
  handleDepartmentSelection,
  selectedDepartment
}) => {
  const departments = [
    { name: 'Human Resources', enabled: false },
    { name: 'Project Management', enabled: false },
    { name: 'Engineering', enabled: false },
    { name: 'BIM', enabled: false },
    { name: 'Marketing', enabled: true }, //isolated for testing
    { name: 'IT', enabled: false },
  ];

  const handleMouseEnter = (dept) => {
    if (!dept.enabled) {
      toast.info("Coming Soon!", {
        position: "top-right",
        autoClose: 2000,
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

// Footer Component
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

// Banner Component to display announcements and events
const Banner = ({ announcements, selectedDepartment }) => {
  const bannerTextRef = useRef(null);
  const [animationDuration, setAnimationDuration] = useState(0);

  // Department-specific announcements
  const departmentAnnouncements = {
    'Human Resources': announcements,
    'Marketing': [
      'Marketing team: New brand guidelines available on SharePoint.',
      'Q4 campaign materials due by December 15th.',
      'Social media calendar updated for holiday season.',
      'Marketing ROI reports due monthly.',
      'Content review meetings every Tuesday at 2PM.',
    ]
  };

  const currentAnnouncements = departmentAnnouncements[selectedDepartment] || announcements;

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
  }, [currentAnnouncements]);

  const combinedAnnouncements = currentAnnouncements.join(" ~~~◦~~~ ");

  return (
    <div className="banner">
      <div className="banner-text-wrapper">
        <span 
          className="banner-text"
          ref={bannerTextRef}
          style={{ animationDuration: `${animationDuration}s` }}
          dangerouslySetInnerHTML={{ __html: combinedAnnouncements}}
        ></span>
      </div>
    </div>
  ); 
};

// Enhanced message rendering section for your App.js
// Replace the existing message rendering section with this improved version

const MessageContent = ({ message }) => {
  const isBot = message.sender === 'assistant';
  
  if (isBot) {
    return (
      <div className="bot-message-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Links
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
            
            // Tables
            table: ({ node, ...props }) => (
              <table {...props} style={{ 
                border: '1px solid rgba(240, 248, 255, 0.3)', 
                borderCollapse: 'collapse',
                width: '100%',
                margin: '12px 0'
              }} />
            ),
            th: ({ node, ...props }) => (
              <th {...props} style={{ 
                backgroundColor: 'rgba(240, 248, 255, 0.2)', 
                padding: '8px 12px', 
                border: '1px solid rgba(240, 248, 255, 0.3)',
                fontWeight: '600',
                color: '#f0f8ff'
              }} />
            ),
            td: ({ node, ...props }) => (
              <td {...props} style={{ 
                padding: '8px 12px', 
                border: '1px solid rgba(240, 248, 255, 0.3)'
              }} />
            ),
            
            // Headings with proper hierarchy
            h1: ({ node, ...props }) => (
              <h1 {...props} style={{ 
                fontSize: '1.3em', 
                fontWeight: '600', 
                margin: '20px 0 10px 0', 
                color: '#f0f8ff',
                borderBottom: '2px solid rgba(240, 248, 255, 0.3)',
                paddingBottom: '4px'
              }} />
            ),
            h2: ({ node, ...props }) => (
              <h2 {...props} style={{ 
                fontSize: '1.2em', 
                fontWeight: '600', 
                margin: '18px 0 8px 0', 
                color: '#f0f8ff',
                borderBottom: '1px solid rgba(240, 248, 255, 0.2)',
                paddingBottom: '3px'
              }} />
            ),
            h3: ({ node, ...props }) => (
              <h3 {...props} style={{ 
                fontSize: '1.1em', 
                fontWeight: '600', 
                margin: '16px 0 6px 0', 
                color: '#e6f3ff'
              }} />
            ),
            h4: ({ node, ...props }) => (
              <h4 {...props} style={{ 
                fontSize: '1.05em', 
                fontWeight: '600', 
                margin: '14px 0 5px 0', 
                color: '#ddeeff'
              }} />
            ),
            h5: ({ node, ...props }) => (
              <h5 {...props} style={{ 
                fontSize: '1em', 
                fontWeight: '600', 
                margin: '12px 0 4px 0', 
                color: '#ccddff'
              }} />
            ),
            h6: ({ node, ...props }) => (
              <h6 {...props} style={{ 
                fontSize: '0.95em', 
                fontWeight: '600', 
                margin: '10px 0 4px 0', 
                color: '#ccddff'
              }} />
            ),
            
            // Paragraphs with proper spacing
            p: ({ node, ...props }) => (
              <p {...props} style={{ 
                margin: '8px 0', 
                lineHeight: '1.6'
              }} />
            ),
            
            // Lists with proper indentation
            ul: ({ node, ...props }) => (
              <ul {...props} style={{ 
                margin: '12px 0', 
                paddingLeft: '24px',
                lineHeight: '1.5'
              }} />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} style={{ 
                margin: '12px 0', 
                paddingLeft: '24px',
                lineHeight: '1.5'
              }} />
            ),
            li: ({ node, ...props }) => (
              <li {...props} style={{ 
                margin: '6px 0',
                lineHeight: '1.5'
              }} />
            ),
            
            // Strong text
            strong: ({ node, ...props }) => (
              <strong {...props} style={{ 
                fontWeight: '700',
                color: '#f0f8ff'
              }} />
            ),
            
            // Emphasis
            em: ({ node, ...props }) => (
              <em {...props} style={{ 
                fontStyle: 'italic',
                color: '#e6f3ff'
              }} />
            ),
            
            // Code blocks
            code: ({ node, inline, ...props }) => 
              inline ? (
                <code {...props} style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9em',
                  color: '#f0f8ff'
                }} />
              ) : (
                <code {...props} style={{
                  display: 'block',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: '12px',
                  borderRadius: '6px',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.9em',
                  color: '#f0f8ff',
                  overflow: 'auto'
                }} />
              ),
            
            // Pre blocks
            pre: ({ node, ...props }) => (
              <pre {...props} style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: '6px',
                overflow: 'auto',
                margin: '12px 0'
              }} />
            ),
            
            // Blockquotes
            blockquote: ({ node, ...props }) => (
              <blockquote {...props} style={{
                borderLeft: '4px solid rgba(240, 248, 255, 0.5)',
                paddingLeft: '16px',
                margin: '12px 0',
                fontStyle: 'italic',
                color: '#e6f3ff'
              }} />
            ),
            
            // Horizontal rules
            hr: ({ node, ...props }) => (
              <hr {...props} style={{
                border: 'none',
                borderTop: '1px solid rgba(240, 248, 255, 0.3)',
                margin: '16px 0'
              }} />
            )
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  } else {
    // User message - simple rendering
    return (
      <div className="user-message-content">
        {message.content}
      </div>
    );
  }
};

// Usage in your message rendering:
// Replace this section in your App.js:
/*
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // ... existing components
  }}
>
  {msg.content}
</ReactMarkdown>
*/

// With this:
// <MessageContent message={msg} />
function App() {
  // State for sessions (renamed from conversations)
  const [sessions, setSessions] = useState([]);
  
  // Hardcoded user for demo - no auth required
  const [user] = useState({ username: "Demo User", user_id: "demo-user-123" }); 
  const [accessToken] = useState('demo-token'); 
  const isAuthenticated = true;

  const [announcements] = useState([
    'Benefits Open Enrollment is Monday, Nov. 4, through Friday, Nov. 15.',
    'Upcoming Company Holidays: November 28-29 & December 24, 2024-January 1, 2025.',
    'P2S 2025 Payroll and Holiday Calendar is available on the Intranet > HR > HR Toolbox.',
    'FSA Reminder: You have until December 31 to incur eligible expenses for the 2024 plan year.',
    'Update your Employee Information (Address Changes): Please confirm your details in <a href="https://access.paylocity.com/">Paylocity</a>.',
    'Don\'t forget to fill out your timecards at the end of each day.',
  ]);

  const [activeSessionId, setActiveSessionId] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDepartmentListVisible, setIsDepartmentListVisible] = useState(false);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('Marketing'); //isolated for testingg
  const [isRightPanelVisible, setIsRightPanelVisible] = useState(false);
  const [editMode, setEditMode] = useState({});
  const [feedbackState, setFeedbackState] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const chatHistoryRef = useRef(null);

  // Load sessions on startup
  useEffect(() => {
    console.log('App mounted, user:', user);
    if (user?.user_id) {
      console.log('Loading sessions for user:', user.user_id);
      loadSessions();
    }
  }, [user?.user_id]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [sessions, isTyping]);

  const loadSessions = async () => {
    console.log('loadSessions called');
    console.log('API Base:', API_ENDPOINTS.BASE);
    console.log('Endpoint:', API_ENDPOINTS.SESSIONS.LIST(user.user_id));
    
    try {
      const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.SESSIONS.LIST(user.user_id)}`;
      console.log('Fetching from URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Load sessions response:', response.data);
      const fetchedSessions = response.data.sessions || [];
      // Filter only Marketing sessions
      const marketingSessions = fetchedSessions.filter(session => 
        session.department === 'Marketing' || !session.department
      );
      setSessions(marketingSessions);

      if (marketingSessions.length > 0) {
        console.log('Setting active session to:', marketingSessions[0].session_id);
        setActiveSessionId(marketingSessions[0].session_id);
      } else {
        console.log('No existing sessions, creating default session');
        await createNewSession();
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      console.error("Full error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      // Create a fallback local session for demo purposes
      console.log('API failed, creating local session');
      await createFallbackSession();
    }
  };

  const createNewSession = async () => {
    console.log('createNewSession called');
    console.log('Selected department:', selectedDepartment);
    console.log('User:', user);
    
    if (!user?.user_id) {
      console.error('Cannot create session: user not available');
      return;
    }

    try {
      const url = `${API_ENDPOINTS.BASE}${API_ENDPOINTS.SESSIONS.CREATE}`;
      console.log('Creating session at URL:', url);
      
      const requestData = {
        user_id: user.user_id,
        title: `${selectedDepartment} Chat`
      };
      console.log('Request data:', requestData);

      const response = await axios.post(url, requestData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Create session response:', response.data);

      const newSession = {
        session_id: response.data.session_id,
        title: response.data.title || `${selectedDepartment} Chat`,
        department: selectedDepartment,
        messages: [],
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };

      console.log('Adding new session:', newSession);
      setSessions(prev => {
        const updated = [...prev, newSession];
        console.log('Updated sessions list:', updated);
        return updated;
      });
      
      setActiveSessionId(newSession.session_id);
      console.log('Set active session ID to:', newSession.session_id);
      
      toast.success(`New chat created for ${selectedDepartment}`);
    } catch (error) {
      console.error("Error creating session via API:", error);
      console.error("Full error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Fallback to local session creation
      console.log('API failed, creating fallback local session');
      await createFallbackSession();
    }
  };

  // Fallback session creation for demo purposes
  const createFallbackSession = async () => {
    console.log('Creating fallback local session');
    
    const fallbackSession = {
      session_id: `local-${Date.now()}`,
      title: `Marketing Chat`,
      department: 'Marketing',
      // title: `${selectedDepartment} Chat`,
      // department: selectedDepartment,
      messages: [],
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };
    
    console.log('Fallback session:', fallbackSession);
    setSessions(prev => {
      const updated = [...prev, fallbackSession];
      console.log('Updated sessions with fallback:', updated);
      return updated;
    });
    
    setActiveSessionId(fallbackSession.session_id);
    console.log('Set active session ID to fallback:', fallbackSession.session_id);
    
    // toast.warning("Created local session (API unavailable)");
    toast.success("Welcome to Marketing AI Assistant!");
  };


const handleSendMessage = useCallback(async () => {
  if (userInput.trim() === '' || !activeSessionId) return;

  const messageText = userInput.trim();
  setUserInput('');
  setIsTyping(true);

  // Add user message
  setSessions(prevSessions =>
    prevSessions.map(session =>
      session.session_id === activeSessionId
        ? { ...session, messages: [...(session.messages || []), {
            sender: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
          }] }
        : session
    )
  );

  try {
    // IMPORTANT FIX: Only get files for the current active session
    const currentSessionFiles = uploadedFiles.filter(file => file.sessionId === activeSessionId);
    
    console.log('=== FILE DEBUG ===');
    console.log('All uploaded files:', uploadedFiles.length);
    console.log('Current session files:', currentSessionFiles.length);
    console.log('Active session ID:', activeSessionId);
    console.log('Current session files details:', currentSessionFiles.map(f => ({ 
      id: f.id, 
      name: f.name, 
      sessionId: f.sessionId 
    })));

    // Process only current session files
    const filesData = [];
    if (currentSessionFiles && currentSessionFiles.length > 0) {
      for (const file of currentSessionFiles) {
        if (file?.content && file?.name) {
          try {
            // Simple approach - convert Uint8Array directly to base64
            let base64Content = '';
            if (file.content instanceof Uint8Array) {
              const binaryString = Array.from(file.content, byte => String.fromCharCode(byte)).join('');
              base64Content = btoa(binaryString);
            }
            
            if (base64Content) {
              filesData.push({
                filename: file.name,
                content: base64Content,
                content_type: file.type || 'application/pdf',
                size: file.size || file.content.length
              });
            }
          } catch (e) {
            console.warn('Failed to process file:', file.name, e);
          }
        }
      }
    }

    console.log('Files being sent to backend:', filesData.length);
    console.log('File details being sent:', filesData.map(f => ({ filename: f.filename, size: f.size })));

    // UPDATED: Get agent preference from DEPARTMENT_AGENT_MAP, but allow null for intent-based routing
    const agentPreference = DEPARTMENT_AGENT_MAP[selectedDepartment];
    
    console.log('=== ROUTING DEBUG ===');
    console.log('Selected department:', selectedDepartment);
    console.log('Agent preference from map:', agentPreference);
    console.log('Message:', messageText);
    console.log('Will use intent-based routing:', agentPreference === null);

    const chatRequest = {
      session_id: activeSessionId,
      user_id: user.user_id,
      message: messageText,
      files: filesData.length > 0 ? filesData : undefined,
      agent_preference: agentPreference
    };

    // Add this debug line as requested
    console.log('Final chatRequest being sent:', JSON.stringify(chatRequest, null, 2));

    const response = await axios.post(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.CHAT}`, chatRequest);

    // Add response
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.session_id === activeSessionId
          ? { ...session, messages: [...session.messages, {
              sender: 'assistant',
              content: response.data.response,
              timestamp: new Date().toISOString(),
              response_id: response.data.response_id,
              sources: response.data.sources || [],
              agent_used: response.data.agent_used,
            }] }
          : session
      )
    );

    // Clear uploaded files for current session after successful send
    setUploadedFiles(prev => prev.filter(file => file.sessionId !== activeSessionId));

  } catch (error) {
    console.error("Error:", error);
    
    // Add error message
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.session_id === activeSessionId
          ? { ...session, messages: [...session.messages, {
              sender: 'assistant',
              content: `I encountered an error processing your request: ${error.response?.data?.detail || error.message}`,
              timestamp: new Date().toISOString()
            }] }
          : session
      )
    );
  } finally {
    setIsTyping(false);
  }
}, [userInput, activeSessionId, uploadedFiles, selectedDepartment, user.user_id]);

  const debounceSendMessage = useCallback(debounce(handleSendMessage, 300), [handleSendMessage]);

  const handleDeleteSession = async (sessionId) => {
    console.log('Deleting session:', sessionId);
    
    try {
      await axios.delete(`${API_ENDPOINTS.BASE}${API_ENDPOINTS.SESSIONS.DELETE(sessionId)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Session deleted via API');
    } catch (error) {
      console.error('API delete failed, proceeding with local delete:', error);
    }

    // Remove session from local state regardless of API success
    setSessions(prevSessions => {
      const filtered = prevSessions.filter(session => session.session_id !== sessionId);
      console.log('Sessions after delete:', filtered);
      return filtered;
    });

    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(session => session.session_id !== sessionId);
      if (remainingSessions.length > 0) {
        setActiveSessionId(remainingSessions[0].session_id);
        console.log('Switched to session:', remainingSessions[0].session_id);
      } else {
        setActiveSessionId(null);
        console.log('No remaining sessions, creating new one');
        await createNewSession();
      }
    }

    toast.success("Session deleted successfully");
  };

  const toggleDepartmentList = () => {
    setIsDepartmentListVisible(!isDepartmentListVisible);
  };

  const handleDepartmentSelection = (department) => {

    // Only allow Marketing
    if (department !== 'Marketing') {
      toast.info("Only Marketing is available in this version");
      setIsDepartmentListVisible(false);
      return;
    }
    if (department === selectedDepartment) {
      setIsDepartmentListVisible(false);
      return;
    }

    const existingSession = sessions.find(session => session.department === department);
    if (existingSession) {
      setActiveSessionId(existingSession.session_id);
      setSelectedDepartment(department);
      setIsDepartmentListVisible(false);
    } else {
      setSelectedDepartment(department);
      setIsDepartmentListVisible(false);
      createNewSession();
    }
  };

  // File upload handlers with fallbacks
  const handleFileUpload = async (file, fileData) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const enhancedFileData = {
        ...fileData,
        content: uint8Array,
        size: file.size,
        type: file.type,
        name: file.name,
        sessionId: activeSessionId
      };
      
      setUploadedFiles(prev => [...prev, enhancedFileData]);
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[enhancedFileData.id];
        return updated;
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      toast.error('Failed to process uploaded file');
    }
  };

  const handleUploadProgress = (fileData, progress, status) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileData.id]: { file: fileData, progress, status }
    }));
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleCancelUpload = (fileId) => {
    setUploadProgress(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  };

  const handleToolSelect = (tool) => {
    toast.info(`${tool.name} tool selected - Integration coming soon!`);
  };

  const handleAddSession = async () => {
    console.log('handleAddSession called');
    console.log('Current sessions count:', sessions.length);
    
    if (sessions.length < 10) {
      console.log('Creating new session from Add button');
      await createNewSession();
    } else {
      console.log('Maximum sessions reached');
      toast.warning("Maximum 10 sessions allowed");
    }
  };

  const handleEditSessionName = (id, newName) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.session_id === id ? { ...session, title: newName } : session
      )
    );
    setEditMode(prevEditMode => ({ ...prevEditMode, [id]: false }));
  };

  const toggleEditMode = (id) => {
    setEditMode(prevEditMode => ({
      ...prevEditMode,
      [id]: !prevEditMode[id],
    }));
  };

  const toggleLeftPanel = () => {
    setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
  };

  const activeSession = sessions.find(session => session.session_id === activeSessionId);

//   const handleSessionSwitch = (sessionId, department) => {
//   setActiveSessionId(sessionId);
//   setSelectedDepartment(department);
//   // Clear uploaded files when switching sessions
//   setUploadedFiles(prev => prev.filter(file => file.sessionId === sessionId));
// };
const handleSessionSwitch = (sessionId, department) => {
  console.log('=== SESSION SWITCH DEBUG ===');
  console.log('Switching from:', activeSessionId, 'to:', sessionId);
  console.log('Files before switch:', uploadedFiles.filter(f => f.sessionId === sessionId).length);
  
  setActiveSessionId(sessionId);
  setSelectedDepartment(department);
  
  // Files are already filtered by sessionId in the UI components, 
  // so we don't need to clear them here
};

  // Feedback handlers (simplified for demo)
  const handleRating = (response_id, isHelpful, query, response) => {
    setFeedbackState(prevState => ({
      ...prevState,
      [response_id]: { isVisible: true, isHelpful, query, response, comment: '' }
    }));
  };

  const handleCommentChange = (response_id, comment) => {
    setFeedbackState(prevState => ({
      ...prevState,
      [response_id]: { ...prevState[response_id], comment }
    }));
  };

  const submitFeedback = async (response_id) => {
    const feedback = feedbackState[response_id];
    if (!feedback) return;

    console.log('Feedback submitted:', { response_id, ...feedback });
    
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.session_id === activeSessionId
          ? {
              ...session,
              messages: session.messages.map(msg =>
                msg.response_id === response_id
                  ? { ...msg, feedbackSubmitted: true }
                  : msg
              )
            }
          : session
      )
    );

    setFeedbackState(prevState => ({
      ...prevState,
      [response_id]: { ...prevState[response_id], isVisible: false }
    }));
    
    toast.success("Thank you for your feedback!");
  };

  return (
    <div className="app">
      <ToastContainer />
      
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
          <button 
            className="logout-button" 
            onClick={() => toast.info("Demo Mode - Auth disabled")}
            style={{ opacity: 0.7 }}
          >
            <FaSignOutAlt /> Demo Mode
          </button>
        </div>
      </header>

      <Banner announcements={announcements} selectedDepartment={selectedDepartment} />

      <div className="main-body">
        {/* Left Sidebar */}
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
              {/* Debug info */}
              <div style={{ fontSize: '10px', color: '#999', padding: '5px' }}>
                Sessions: {sessions.length}, Active: {activeSessionId}
              </div>
              
              <ul>
                {sessions.length === 0 && (
                  <li style={{ color: '#999', fontSize: '12px', padding: '10px' }}>
                    No sessions found. Creating default session...
                  </li>
                )}
                {sessions.filter(session => session?.session_id).map((session) => {
                  // console.log('Rendering session:', session);
                  return (
                    <li
                      key={session.session_id}
                      className={`conversation-item ${
                        session.session_id === activeSessionId ? 'active-conversation' : ''
                      }`}
                      // onClick={() => {
                      //   console.log('Switching to session:', session.session_id);
                      //   setActiveSessionId(session.session_id);
                      //   setSelectedDepartment(session.department || 'Human Resources');
                      // }}
                      onClick={() => {
                        console.log('Switching to session:', session.session_id);
                        handleSessionSwitch(session.session_id, session.department || 'Human Resources');
                      }}
                    >
                      {editMode[session.session_id] ? (
                        <div className="edit-conversation">
                          <input
                            type="text"
                            defaultValue={session.title}
                            onBlur={(e) =>
                              handleEditSessionName(session.session_id, e.target.value)
                            }
                          />
                        </div>
                      ) : (
                        <>
                          <span>{session.title}</span>
                          <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.session_id);
                            }}
                          >
                            <Trash size={18} color="white" />
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              
              <button
                className="add-conversation-button"
                onClick={handleAddSession}
                style={{ cursor: 'pointer' }}
              >
                <FaPlus /> Add Conversation
              </button>

              {/* Add Tools Component - Only for Marketing */}
              {selectedDepartment === 'Marketing' && (
                <Tools 
                  selectedDepartment={selectedDepartment}
                  onToolSelect={handleToolSelect}
                />
              )}
            </>
          )}
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="chat-history" ref={chatHistoryRef}>
            {(activeSession?.messages || []).filter(msg => msg && typeof msg === 'object').map((msg, index)=> (
              <div key={index} className="message-row">
                {msg.sender === 'assistant' && (
                  <CircularLogo isBotMessage={true} />
                )}
                <div
                  className={`message ${
                    msg.sender === 'user' ? 'user-message' : 'bot-message'
                  }`}
                >
                  {/* Agent Indicator - Only show for assistant messages */}
                  {msg.sender === 'assistant' && msg.agent_used && (
                    <AgentIndicator 
                      agentType={msg.agent_used} 
                      isNewMessage={index === (activeSession?.messages || []).length - 1 && msg.sender === 'assistant'}
                    />
                  )}
                  <MessageContent message={msg} />
                  
                  {/* Sources Display */}
                  {msg.sender === 'assistant' && msg.sources && Array.isArray(msg.sources) && msg.sources.length > 0 && (
                    <div className="message-sources">
                      <div className="sources-header">Sources:</div>
                      <ul className="sources-list">
                        {msg.sources.map((source, idx) => {
                          let sourceText = 'Document';
                          try {
                            if (typeof source === 'string') {
                              sourceText = source;
                            } else if (source && typeof source === 'object') {
                              sourceText = source.document || source.title || 'Document';
                            }
                          } catch (e) {
                            sourceText = 'Document';
                          }
                          
                          return (
                            <li key={idx} className="source-item">
                              <span className="source-document">{sourceText}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}


                  <div className="timestamp">{new Date(msg.timestamp).toLocaleString()}</div>

                  {/* Feedback Section */}
                  {msg.sender === 'assistant' && msg.response_id && !msg.feedbackSubmitted && (
                    <div className="rating">
                      <span>Rate the response:</span>
                      <FaThumbsUp
                        className="thumbs-up"
                        onClick={() => handleRating(msg.response_id, true, msg.content, msg.content)}
                      />
                      <FaThumbsDown
                        className="thumbs-down"
                        onClick={() => handleRating(msg.response_id, false, msg.content, msg.content)}
                      />
                    </div>
                  )}

                  {/* Feedback Form */}
                  {msg.sender === 'assistant' && msg.response_id && feedbackState[msg.response_id]?.isVisible && (
                    <div className="feedback-form">
                      <textarea
                        placeholder="Add a comment (optional)"
                        value={feedbackState[msg.response_id].comment}
                        onChange={(e) => handleCommentChange(msg.response_id, e.target.value)}
                      ></textarea>
                      <button onClick={() => submitFeedback(msg.response_id)}>Submit Feedback</button>
                    </div>
                  )}

                  {/* Feedback Confirmation */}
                  {msg.sender === 'assistant' && msg.feedbackSubmitted && (
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
          
          {/* Uploaded Files List - Only for Marketing - Above chat input */}
          {/* {selectedDepartment === 'Marketing' && uploadedFiles.length > 0 && (
            <div className="chat-uploaded-files">
              <UploadedFiles 
                files={uploadedFiles}
                onRemoveFile={handleRemoveFile}
                maxVisible={3}
              />
            </div>
          )} */}
          {selectedDepartment === 'Marketing' && uploadedFiles.filter(file => file.sessionId === activeSessionId).length > 0 && (
              <div className="chat-uploaded-files">
                <UploadedFiles 
                  files={uploadedFiles.filter(file => file.sessionId === activeSessionId)}
                  onRemoveFile={handleRemoveFile}
                  maxVisible={3}
                />
              </div>
            )}

          {/* Progress bars for uploading files - Above chat input */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="chat-upload-progress">
              {Object.values(uploadProgress).map(({ file, progress, status }) => (
                <ProgressBar
                  key={file.id}
                  file={file}
                  progress={progress}
                  status={status}
                  onCancel={handleCancelUpload}
                />
              ))}
            </div>
          )}

          <div className="chat-input">
            {/* Add Upload Button for Marketing */}
            {selectedDepartment === 'Marketing' && (
              <UploadButton 
                onFileUpload={handleFileUpload}
                onUploadProgress={handleUploadProgress}
                disabled={isTyping}
              />
            )}
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
            <h3>Additional Features</h3>
            <p>Future enhancements and integrations will appear here.</p>
          </div>
        )}
      </div>
      
      <div className="footer-panel">
        <Footer />
      </div>
    </div>
  );
}

export default App;
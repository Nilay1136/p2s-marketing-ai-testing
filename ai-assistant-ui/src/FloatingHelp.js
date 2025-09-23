import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaQuestionCircle, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './FloatingHelp.css';

// Import the user guide content directly
const userGuideContent = `# AI Assistant UI - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Core Features](#core-features)
4. [Marketing AI Assistant](#marketing-ai-assistant)
5. [Chat Functionality](#chat-functionality)
6. [File Management](#file-management)
7. [Tools and Features](#tools-and-features)
8. [Document Viewer](#document-viewer)
9. [Tips for Efficient Usage](#tips-for-efficient-usage)
10. [Troubleshooting](#troubleshooting)
11. [Keyboard Shortcuts](#keyboard-shortcuts)

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Supported file types for uploads: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), PowerPoint (.ppt/.pptx), Text files

### First Launch
1. Navigate to the application URL
2. The interface will load with the Marketing AI Assistant
3. You'll see the main chat interface with sidebar navigation for marketing-specific tools and features

## Interface Overview

### Main Components

#### 1. Header Section
- **P2S Legence Logo**: Company branding (top-left)
- **Department Selector**: Toggle between available departments
- **Chat Management**: New chat and session management options

#### 2. Sidebar (Left Panel)
- **Department List**: Switch between different AI assistants
- **Chat History**: Previous conversation sessions
- **File Upload**: Document management area
- **Tools Section**: Department-specific tools and utilities

#### 3. Main Chat Area
- **Message History**: Conversation display with AI responses
- **Input Field**: Type your questions and commands
- **Send Button**: Submit messages (or press Enter)

#### 4. Status Indicators
- **Agent Indicator**: Shows which AI agent is responding
- **Progress Bars**: File upload status
- **Toast Notifications**: System messages and alerts

## Core Features

### Intelligent Marketing AI Assistant
The application provides a specialized AI assistant designed specifically for marketing professionals and tasks:

**Marketing Capabilities:**
- SOQ (Statement of Qualifications) creation and optimization
- Proposal generation and formatting
- Content creation and review
- Brand compliance checking
- Document analysis and insights
- Marketing strategy recommendations
- Campaign planning assistance

### Smart Chat Interface
- Natural language processing optimized for marketing terminology
- Context-aware responses for marketing scenarios
- Markdown formatting support for professional documents
- Code syntax highlighting for technical marketing content
- Real-time processing with marketing-focused AI models

## Marketing AI Assistant

The application is specifically designed for marketing professionals and provides:

### Core Marketing Features
- **SOQ Creation**: Generate professional Statements of Qualifications
- **Proposal Development**: Create compelling marketing proposals
- **Content Strategy**: Develop marketing content and campaigns
- **Brand Compliance**: Ensure consistency with brand guidelines
- **Document Analysis**: Analyze marketing materials and competitor content
- **Strategy Planning**: Get AI-powered marketing strategy recommendations

### Getting the Best Results
The Marketing AI Assistant is optimized to provide the most accurate and relevant responses when you:
- Focus on one specific marketing task per conversation session
- Upload only one primary document per session for analysis
- Provide clear context about your marketing objectives
- Reference specific marketing goals or requirements

## Chat Functionality

### Starting a Conversation
1. Type your question in the input field at the bottom
2. Press **Enter** or click the **Send button** (✈️)
3. The AI will process your request and provide a response
4. Responses support rich formatting including:
   - **Bold** and *italic* text
   - Bullet points and numbered lists
   - Code blocks and inline code
   - Tables and links

### Message Features
- **Thumbs Up/Down**: Rate AI responses for quality feedback
- **Copy**: Copy response content to clipboard
- **Agent Indicator**: See which specialized agent provided the response

### Best Practices for Questions
- Be specific and clear in your requests
- Provide context when asking about complex topics
- Use follow-up questions to refine responses
- Reference uploaded documents when relevant

## File Management

### Supported File Types
- **PDF Documents** (.pdf)
- **Microsoft Word** (.doc, .docx)
- **Microsoft Excel** (.xls, .xlsx)
- **Microsoft PowerPoint** (.ppt, .pptx)
- **Text Files** (.txt)

### File Upload Process
1. Click the **Upload Button** (📎) in the sidebar
2. Select **one primary file** from your computer (max 10MB per file)
3. Monitor upload progress with the progress bar
4. The uploaded file appears in the "Uploaded Files" section
5. Green checkmark indicates successful upload

### One File Per Session Recommendation
**For optimal AI performance and accuracy:**
- Upload **only one primary document** per chat session
- This allows the AI to focus deeply on that specific document
- Creates more accurate and contextual responses
- Reduces confusion and improves relevance
- Start a new session for analyzing different documents

### File Management
- **View Files**: Click on the uploaded file to preview
- **Remove Files**: Use the delete button (🗑️) to remove and replace with a different file
- **File Status**: Real-time upload progress and status indicators

### File Usage Tips
- Upload one primary document that you want to focus on for the entire session
- Reference the uploaded document directly in your chat messages
- Use descriptive filenames for better organization
- Keep file sizes under 10MB for optimal performance
- Start a new session when switching to analyze a different document
- For comparing multiple documents, upload them in separate sessions and compare insights

## Tools and Features

### Marketing Tools (Available)
When in the Marketing department, access specialized tools:

1. **SOQ Creator** 🔄 (Coming Soon)
   - Create Statements of Qualifications
   - Professional proposal formatting
   - Template-based generation

2. **Proposal Generator** 🔄 (Coming Soon)
   - Marketing proposal creation
   - Automated formatting
   - Content suggestions

3. **Social Media Tools** 🔄 (Coming Soon)
   - Brand compliance checking
   - Content scheduling
   - Guidelines enforcement

### Tool Access
- Tools appear in the left sidebar under your selected department
- Click on any tool to access its features
- Hover over disabled tools to see "Coming Soon" notifications

## Document Viewer

### Opening Documents
- Click on any uploaded file in the sidebar
- The document viewer opens in a modal window
- Navigate between multiple documents if available

### Viewer Features
- **PDF Viewer**: Full-featured PDF display with zoom and navigation
- **Document Info**: File size, type, and upload date
- **Navigation**: Switch between multiple uploaded documents
- **Close Button**: Return to main interface

### Viewer Controls
- **Zoom**: Use browser zoom or PDF viewer controls
- **Navigate**: Scroll or use PDF viewer page controls
- **Switch Documents**: Use navigation arrows if multiple files

## Tips for Efficient Usage

### 1. Organize Your Workflow
- Upload one primary document before starting your session
- Use clear, descriptive questions
- Build on previous responses for deeper insights

### 2. Leverage File Context
- Reference the uploaded document in your questions
- Ask for specific analysis of document content
- Request insights based on the document context

### 3. Use Formatting
- The AI responds with rich markdown formatting
- Copy formatted responses for use in other applications
- Use code blocks for technical content

### 4. Session Management
- Start new chats for different topics or documents
- Use descriptive session names for easy reference
- Review chat history for previous insights

### 5. Provide Feedback
- Use thumbs up/down to improve AI responses
- Be specific about what worked or didn't work
- Help train the system for better future responses

## Troubleshooting

### Common Issues and Solutions

#### File Upload Problems
- **File too large**: Ensure files are under 10MB
- **Unsupported format**: Check file type against supported list
- **Upload stuck**: Refresh the page and try again
- **Network error**: Check internet connection

#### Chat Issues
- **No response**: Check if the marketing assistant is active
- **Slow responses**: Large files may take longer to process
- **Formatting issues**: Try refreshing the browser

#### Interface Problems
- **Sidebar not opening**: Try clicking the hamburger menu again
- **Document viewer issues**: Ensure browser supports PDF viewing
- **Missing features**: Some tools are still in development

#### Browser Compatibility
- Use modern browsers for best experience
- Enable JavaScript and cookies
- Clear browser cache if experiencing issues
- Disable ad blockers that might interfere

### Getting Help
- Check this guide for common solutions
- Look for toast notifications with helpful messages
- Ensure you're using a supported browser
- Contact system administrator for persistent issues

## Keyboard Shortcuts

### Chat Interface
- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Escape**: Close modals/overlays

### File Management
- **Ctrl/Cmd + V**: Paste files (where supported)
- **Delete**: Remove selected files

### Navigation
- **Tab**: Navigate through interface elements
- **Escape**: Close sidebar or modals

## Security and Privacy

### Data Handling
- Files are processed securely
- Chat history is maintained per session
- No personal data is stored permanently without consent

### Best Practices
- Don't upload sensitive personal information
- Use appropriate files for business context
- Log out when using shared computers

## Future Updates

The Marketing AI Assistant is continuously evolving. Upcoming features include:

- **Advanced Marketing Tools**: SOQ Creator, Proposal Generator, and more
- **Enhanced File Support**: More file types and larger sizes
- **Collaboration Features**: Shared sessions and team workspaces
- **API Integration**: Connect with other business tools
- **Template Library**: Pre-built marketing templates

## Support

For additional support or feature requests:
- Check the latest documentation updates
- Contact your system administrator
- Provide feedback using the thumbs up/down buttons
- Report bugs through your organization's IT support channels

---

*This guide covers the current version of the Marketing AI Assistant. Features and functionality may be updated over time. Check for the latest version of this guide when new features are released.*`;

const FloatingHelp = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 200 }); // Start in middle-left area
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    setIsDragging(true);
    const rect = buttonRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep button within viewport bounds
    const buttonSize = 60;
    const maxX = window.innerWidth - buttonSize;
    const maxY = window.innerHeight - buttonSize;

    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  }, [isDragging, dragStart]);

  // Handle mouse up for dragging
  const handleMouseUp = useCallback((e) => {
    if (isDragging) {
      setIsDragging(false);
      // If it was just a click (not much movement), open modal
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - (position.x + dragStart.x), 2) +
        Math.pow(e.clientY - (position.y + dragStart.y), 2)
      );
      
      if (moveDistance < 5) { // Less than 5px movement = click
        openModal();
      }
    }
  }, [isDragging, position, dragStart]);

  // Add/remove event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Close modal when clicking the overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <>
      {/* Floating Help Button */}
      <button 
        ref={buttonRef}
        className={`floating-help-button ${isDragging ? 'dragging' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        title="Help & User Guide (Drag to move)"
        aria-label="Open help guide - draggable"
      >
        <FaQuestionCircle />
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="help-modal-overlay" onClick={handleOverlayClick}>
          <div className="help-modal">
            {/* Modal Header */}
            <div className="help-modal-header">
              <h2>Marketing AI Assistant - User Guide</h2>
              <button 
                className="help-modal-close"
                onClick={closeModal}
                aria-label="Close help guide"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="help-modal-content">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom heading styling
                  h1: ({children}) => <h1 className="help-h1">{children}</h1>,
                  h2: ({children}) => <h2 className="help-h2">{children}</h2>,
                  h3: ({children}) => <h3 className="help-h3">{children}</h3>,
                  h4: ({children}) => <h4 className="help-h4">{children}</h4>,
                  // Custom link styling
                  a: ({href, children}) => (
                    <a href={href} className="help-link" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  // Custom code styling
                  code: ({children, className}) => (
                    <code className={`help-code ${className || ''}`}>
                      {children}
                    </code>
                  ),
                  // Custom blockquote styling
                  blockquote: ({children}) => (
                    <blockquote className="help-blockquote">
                      {children}
                    </blockquote>
                  )
                }}
              >
                {userGuideContent}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingHelp;

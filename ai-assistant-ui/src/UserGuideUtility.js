import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaSearch, FaTimes, FaBook } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './UserGuideUtility.css';

// Import the user guide content
import userGuideContent from './userGuideContent';

const UserGuideUtility = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Parse the user guide into searchable sections
  const parseUserGuide = () => {
    const sections = [];
    const lines = userGuideContent.split('\n');
    let currentSection = null;
    let currentContent = [];

    lines.forEach((line, index) => {
      // Detect headings
      if (line.startsWith('## ')) {
        // Save previous section
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n'),
            wordCount: currentContent.join(' ').split(' ').length
          });
        }
        // Start new section
        currentSection = {
          id: `section-${sections.length}`,
          title: line.replace('## ', ''),
          level: 2,
          lineNumber: index
        };
        currentContent = [line];
      } else if (line.startsWith('### ')) {
        // Sub-section
        if (currentSection) {
          sections.push({
            ...currentSection,
            content: currentContent.join('\n'),
            wordCount: currentContent.join(' ').split(' ').length
          });
        }
        currentSection = {
          id: `section-${sections.length}`,
          title: line.replace('### ', ''),
          level: 3,
          lineNumber: index,
          parentTitle: currentSection?.title || ''
        };
        currentContent = [line];
      } else {
        currentContent.push(line);
      }
    });

    // Add the last section
    if (currentSection) {
      sections.push({
        ...currentSection,
        content: currentContent.join('\n'),
        wordCount: currentContent.join(' ').split(' ').length
      });
    }

    return sections;
  };

  const sections = parseUserGuide();

  // Search functionality
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const queryLower = query.toLowerCase();
    const results = [];

    sections.forEach(section => {
      const titleMatch = section.title.toLowerCase().includes(queryLower);
      const contentMatch = section.content.toLowerCase().includes(queryLower);
      
      if (titleMatch || contentMatch) {
        // Calculate relevance score
        let score = 0;
        if (titleMatch) score += 10;
        if (contentMatch) {
          const contentLower = section.content.toLowerCase();
          const queryWords = queryLower.split(' ');
          queryWords.forEach(word => {
            const wordCount = (contentLower.match(new RegExp(word, 'g')) || []).length;
            score += wordCount;
          });
        }

        // Get context snippet
        const contentLines = section.content.split('\n');
        let contextSnippet = '';
        for (let line of contentLines) {
          if (line.toLowerCase().includes(queryLower)) {
            contextSnippet = line.substring(0, 150) + '...';
            break;
          }
        }
        if (!contextSnippet) {
          contextSnippet = contentLines.slice(1, 3).join(' ').substring(0, 150) + '...';
        }

        results.push({
          ...section,
          score,
          contextSnippet,
          matchType: titleMatch ? 'title' : 'content'
        });
      }
    });

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);
    setSearchResults(results.slice(0, 10)); // Limit to top 10 results
    setIsSearching(false);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Quick help topics
  const quickHelpTopics = [
    { title: 'Getting Started', query: 'getting started' },
    { title: 'File Upload', query: 'file upload' },
    { title: 'One File Per Session', query: 'one file per session' },
    { title: 'Marketing Tools', query: 'marketing tools' },
    { title: 'Chat Features', query: 'chat functionality' },
    { title: 'SOQ Creator', query: 'SOQ creator' },
    { title: 'Troubleshooting', query: 'troubleshooting' },
    { title: 'Best Practices', query: 'tips efficient usage' }
  ];

  const handleQuickTopic = (query) => {
    setSearchQuery(query);
  };

  if (!isOpen) return null;

  return (
    <div className="user-guide-overlay">
      <div className="user-guide-modal">
        <div className="user-guide-header">
          <div className="user-guide-title">
            <FaBook className="guide-icon" />
            <h2>Marketing AI Assistant - Help Center</h2>
          </div>
          <button className="close-guide-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="user-guide-content">
          <div className="search-section">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {isSearching && <div className="search-loading">🔍</div>}
            </div>

            <div className="quick-topics">
              <h4>Quick Help Topics:</h4>
              <div className="topic-tags">
                {quickHelpTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="topic-tag"
                    onClick={() => handleQuickTopic(topic.query)}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="results-section">
            {searchQuery && searchResults.length > 0 && (
              <div className="search-results">
                <h4>Search Results ({searchResults.length}):</h4>
                {searchResults.map((result, index) => (
                  <div
                    key={result.id}
                    className={`search-result-item ${selectedSection?.id === result.id ? 'selected' : ''}`}
                    onClick={() => setSelectedSection(result)}
                  >
                    <div className="result-header">
                      <h5 className={`result-title level-${result.level}`}>
                        {result.parentTitle && `${result.parentTitle} > `}
                        {result.title}
                      </h5>
                      <span className={`match-type ${result.matchType}`}>
                        {result.matchType === 'title' ? 'Title Match' : 'Content Match'}
                      </span>
                    </div>
                    <p className="result-snippet">{result.contextSnippet}</p>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isSearching && (
              <div className="no-results">
                <FaQuestionCircle />
                <p>No help topics found for "{searchQuery}"</p>
                <p>Try different keywords or browse the quick topics above.</p>
              </div>
            )}

            {selectedSection && (
              <div className="selected-section">
                <div className="section-header">
                  <h3>{selectedSection.title}</h3>
                  <button 
                    className="close-section-btn"
                    onClick={() => setSelectedSection(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="section-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedSection.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {!searchQuery && !selectedSection && (
              <div className="welcome-section">
                <div className="welcome-content">
                  <FaBook className="welcome-icon" />
                  <h3>Welcome to the Marketing AI Assistant Help Center</h3>
                  <p>
                    Find answers to your questions about using the Marketing AI Assistant effectively.
                    Use the search bar above or click on any quick help topic to get started.
                  </p>
                  <div className="help-stats">
                    <div className="stat">
                      <strong>{sections.length}</strong>
                      <span>Help Sections</span>
                    </div>
                    <div className="stat">
                      <strong>{quickHelpTopics.length}</strong>
                      <span>Quick Topics</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGuideUtility;

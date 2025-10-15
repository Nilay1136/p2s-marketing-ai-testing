import React, { useState } from 'react';
import { 
  FaTools, 
  FaChartBar, 
  FaFileAlt, 
  FaSearch, 
  FaPalette, 
  FaRocket,
  FaChevronDown,
  FaChevronRight,
  FaCog,
  FaProjectDiagram
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Tools.css';

const Tools = ({ selectedDepartment, onToolSelect }) => {
  const [isToolsExpanded, setIsToolsExpanded] = useState(true);

  // Define tools based on department
  const departmentTools = {
    'Human Resources': [
      {
        id: 'hr-analytics',
        name: 'HR Analytics',
        icon: <FaChartBar />,
        description: 'Employee performance and metrics',
        enabled: false,
        comingSoon: true
      },
      {
        id: 'policy-search',
        name: 'Policy Search',
        icon: <FaSearch />,
        description: 'Search company policies and procedures',
        enabled: false,
        comingSoon: true
      },
      {
        id: 'document-generator',
        name: 'Document Generator',
        icon: <FaFileAlt />,
        description: 'Generate HR documents and templates',
        enabled: false,
        comingSoon: true
      }
    ],
    'Marketing': [
      {
        id: 'project-profiles',
        name: 'Project Profiles',
        icon: <FaProjectDiagram />,
        description: 'Upload RFP and analyze project type with matching projects',
        enabled: true,
        comingSoon: false
      },
      {
        id: 'SOQ-Creator',
        name: 'SOQ Creator',
        icon: <FaChartBar />,
        description: 'Create Statements of Qualifications (SOQs) for projects',
        enabled: false,
        comingSoon: true
      },
      {
        id: 'proposal-generator',
        name: 'Proposal Generator',
        icon: <FaFileAlt />,
        description: 'Generate marketing proposals and documents',
        enabled: false,
        comingSoon: true
      },
      {
        id: 'social-media',
        name: 'Social Media',
        icon: <FaPalette />,
        description: 'Ensure brand compliance and guidelines',
        enabled: false,
        comingSoon: true
      }
    ],
    'Project Management': [
      {
        id: 'project-tracker',
        name: 'Project Tracker',
        icon: <FaChartBar />,
        description: 'Track project progress and milestones',
        enabled: false,
        comingSoon: true
      },
      {
        id: 'resource-planner',
        name: 'Resource Planner',
        icon: <FaCog />,
        description: 'Plan and allocate project resources',
        enabled: false,
        comingSoon: true
      }
    ],
    'Engineering': [
      {
        id: 'code-analyzer',
        name: 'Code Analyzer',
        icon: <FaSearch />,
        description: 'Analyze code quality and performance',
        enabled: false,
        comingSoon: true
      },
      {
        id: 'doc-generator',
        name: 'Documentation Generator',
        icon: <FaFileAlt />,
        description: 'Generate technical documentation',
        enabled: false,
        comingSoon: true
      }
    ]
  };

  const currentTools = departmentTools[selectedDepartment] || [];

  const handleToolClick = (tool) => {
    if (!tool.enabled) {
      if (tool.comingSoon) {
        toast.info(`${tool.name} - Coming Soon!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.warning(`${tool.name} is currently unavailable.`, {
          position: "top-right",
          autoClose: 2000,
        });
      }
      return;
    }

    // Tool is enabled, call the callback
    if (onToolSelect) {
      onToolSelect(tool);
    }
  };

  const toggleToolsSection = () => {
    setIsToolsExpanded(!isToolsExpanded);
  };

  return (
    <div className="tools-container">
      <div className="tools-header" onClick={toggleToolsSection}>
        <div className="tools-title">
          <FaTools className="tools-icon" />
          <h3>Tools</h3>
        </div>
        <div className="tools-toggle">
          {isToolsExpanded ? <FaChevronDown /> : <FaChevronRight />}
        </div>
      </div>

      {isToolsExpanded && (
        <div className="tools-content">
          {currentTools.length > 0 ? (
            <div className="tools-list">
              {currentTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`tool-item ${!tool.enabled ? 'disabled' : ''} ${tool.comingSoon ? 'coming-soon' : ''}`}
                  onClick={() => handleToolClick(tool)}
                  title={tool.description}
                >
                  <div className="tool-icon">
                    {tool.icon}
                  </div>
                  <div className="tool-details">
                    <span className="tool-name">{tool.name}</span>
                    {tool.comingSoon && (
                      <span className="coming-soon-badge">Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tools">
              <p>No tools available for {selectedDepartment}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tools;
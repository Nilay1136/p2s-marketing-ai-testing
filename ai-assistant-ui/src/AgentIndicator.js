import React from 'react';
import { 
  FaFileAlt, 
  FaChartLine, 
  FaShare, 
  FaEnvelope, 
  FaCogs 
} from 'react-icons/fa';

const AgentIndicator = ({ agentType, isNewMessage = false }) => {
  // Agent configuration with icons, names, and colors
  const agentConfig = {
    'soq': {
      icon: <FaChartLine />,
      name: 'SOQ Outline Agent',
      description: 'Statement of Qualifications'
    },
    'social_posts': {
      icon: <FaShare />,
      name: 'Social Media Agent',
      description: 'Social Media Content'
    },
    'loi': {
      icon: <FaEnvelope />,
      name: 'LOI Generator Agent',
      description: 'Letter of Interest'
    },
    'project_approach': {
      icon: <FaCogs />,
      name: 'Project Approach Agent',
      description: 'Project Methodology'
    },
    'file_ingestion': {
      icon: <FaFileAlt />,
      name: 'Document Assistant',
      description: 'Document Analysis'
    }
  };

  const agent = agentConfig[agentType] || agentConfig['file_ingestion'];
  
  return (
    <div 
      className={`agent-indicator ${agentType} ${isNewMessage ? 'new-message' : ''}`}
      title={agent.description}
    >
      <div className="agent-icon">
        {agent.icon}
      </div>
      <span className="agent-name">
        {agent.name}
      </span>
    </div>
  );
};

export default AgentIndicator;
import React, { useState, useEffect, useRef } from 'react';
import './QuickInfo.css';
import { FaTimes, FaTable, FaRobot, FaPalette, FaFilter, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const QuickInfo = ({ onClose }) => {
    const [selectedComponent, setSelectedComponent] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleCardClick = (index) => {
        setSelectedComponent(selectedComponent === index ? null : index);
    };

    const components = [
        {
          icon: <FaTable />,
          name: '🧪 Periodic Table',
          description: 'Explore all elements with quick info on hover.',
          details: [
            '🔍 Click an element to select it for Chemistry Lab',
            '🖱️ Ctrl+Click to select multiple elements',
            '🖱️ Right-click to add/remove from selection',
            '👆 Hover to view more details',
            '🌈 Colors show element categories (see Legends)',
            '🔢 See atomic number, symbol, and name easily',
            '⚙️ Use the toggle to show/hide group and period numbers'
          ]
        },
        {
          icon: <FaPalette />,
          name: '🎨 Legends',
          description: 'Color keys for element types use hover to filter by category.',
          details: [
            '👆 Hover on a legend to highlight matching elements',
            '🧲 See metals, nonmetals, and metalloids clearly',
            '🌡️ Filter by physical state (solid, liquid, gas)',
            '☢️ Special tags for radioactive or synthetic elements'
          ]
        },
        {
          icon: <FaFilter />,
          name: '🔍 Filtering',
          description: 'Filter elements by multiple categories in one place.',
          details: [
            '📦 Filter by type: metals, nonmetals, blocks (s, p, d, f)',
            '⚛️ Filter by physical properties or discovery period',
            '⚡ Filter by electronegativity and more',
            '🔗 Combine filters for deeper exploration',
            '🧹 Manage filters directly in the menu',
            '❌ Use "Clear All" on bottom-right to reset filters'
          ]
        },
        {
          icon: <FaRobot />,
          name: '🤖 Chemistry Lab',
          description: 'Ask questions, explore properties, and compare elements with AI help.',
          details: [
            '❓ Ask about selected or filtered elements',
            '🌐 Opening Chemistry Lab with no selection picks all elements',
            '🧪 Select or filter elements to analyze or compare',
            '📊 Compare element properties using 14+ graphs',
            '📈 View trend charts and patterns (6 types)',
            '🧠 Get detailed property explanations',
            '🎯 Interactive graphs and visuals make it easy',
            '🔬 Select 2+ elements to see combinations',
            '🚀 Discover new insights through AI-powered exploration'
          ]
        }
      ];
      

      return (
        <div className="quick-info-overlay">
          <div className="quick-info-container" ref={containerRef}>
            <button className="close-button" onClick={onClose}>
              <FaTimes />
            </button>
            
            <h2>Component Guide</h2>
            {selectedComponent !== null ? (
              <div className="detailed-view">
                <button className="back-button" onClick={() => setSelectedComponent(null)}>
                  <FaArrowLeft /> Back to Overview
                </button>
                <div className="component-detail-card">
                  <div className="component-icon">{components[selectedComponent].icon}</div>
                  <h3>{components[selectedComponent].name}</h3>
                  <p>{components[selectedComponent].description}</p>
                  <div className="details-list">
                    <h4>Features & Usage:</h4>
                    <ul>
                      {components[selectedComponent].details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="components-grid">
                {components.map((component, index) => (
                  <div 
                    key={index} 
                    className="component-card" 
                    onClick={() => handleCardClick(index)}
                  >
                    <div className="component-icon">{component.icon}</div>
                    <h3>{component.name}</h3>
                    <p>{component.description}</p>
                    <p><FaArrowRight /> </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
};

export default QuickInfo;
import React, { useState, useEffect } from 'react';
import './PeriodicTable.css';
import elementData from '../pTable.json';
import ElementDetails from './ElementDetails';
import ElementChatbot from './ElementChatbot';
import TaskBar from './TaskBar';
import image from './Name.png';

const PeriodicTable = () => {
  // State for hover details
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  // State for active filters
  const [activeFilters, setActiveFilters] = useState([]);
  // State for showing group and period numbers
  const [showGroupPeriod, setShowGroupPeriod] = useState(false);
  // State for dropdown menus
  const [openDropdown, setOpenDropdown] = useState(null);
  // State for chatbot
  const [showChatbot, setShowChatbot] = useState(false);
  const [selectedElements, setSelectedElements] = useState([]);

  // Function to handle element selection
  const handleElementClick = (element, event) => {
    event.preventDefault();
    
    setSelectedElements(prevSelected => {
      const isAlreadySelected = prevSelected.some(el => el.atomic_number === element.atomic_number);
      
      if (event.ctrlKey || event.metaKey) {
        // Multi-select with Ctrl/Cmd key
        if (isAlreadySelected) {
          return prevSelected.filter(el => el.atomic_number !== element.atomic_number);
        } else {
          return [...prevSelected, element];
        }
      } else {
        // Single select without Ctrl/Cmd key
        if (isAlreadySelected && prevSelected.length === 1) {
          return []; // Deselect if it's the only selected element
        } else {
          return [element];
        }
      }
    });
  };
  
  // Get highlighted elements based on active filters
  const getHighlightedElements = () => {
    if (activeFilters.length === 0) return [];
    
    // Get all elements that match the current filters
    const filteredElements = elementData.filter(element => matchesFilter(element));
    
    // Limit to a reasonable number to avoid overwhelming the API
    if (filteredElements.length > 10) {
      return filteredElements.slice(0, 10);
    }
    
    return filteredElements;
  };

  // Create a mapping of elements by atomic number for easy access
  const elementMap = {};
  elementData.forEach(element => {
    elementMap[element.atomic_number] = element;
  });

  // Function to handle mouse enter on element
  const handleMouseEnter = (element, event) => {
    setHoveredElement(element);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  // Function to handle mouse leave
  const handleMouseLeave = () => {
    setHoveredElement(null);
  };

  // Function to handle mouse move
  const handleMouseMove = (event) => {
    if (hoveredElement) {
      setTooltipPosition({ x: event.clientX, y: event.clientY });
    }
  };
  
  // Function to handle right click
  const handleRightClick = (element, event) => {
    event.preventDefault();
    
    setSelectedElements(prevSelected => {
      const isAlreadySelected = prevSelected.some(el => el.atomic_number === element.atomic_number);
      
      if (isAlreadySelected) {
        return prevSelected.filter(el => el.atomic_number !== element.atomic_number);
      } else {
        return [...prevSelected, element];
      }
    });
  };
  
  // Function to close chatbot
  const handleCloseChatbot = () => {
    setShowChatbot(false);
  };

  // Function to determine which block an element belongs to
  const getElementBlock = (element) => {
    const z = element.atomic_number;
    if (!z) return null;
  
    // f-block
    if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) return 'f-block';
  
    // d-block
    if (
      (z >= 21 && z <= 30) ||
      (z >= 39 && z <= 48) ||
      (z >= 72 && z <= 80) ||
      (z >= 104 && z <= 112)
    ) return 'd-block';
  
    // s-block
    if (
      (z >= 1 && z <= 2) || // H, He
      (z >= 3 && z <= 4) ||
      (z >= 11 && z <= 12) ||
      (z >= 19 && z <= 20) ||
      (z >= 37 && z <= 38) ||
      (z >= 55 && z <= 56) ||
      (z >= 87 && z <= 88)
    ) return 's-block';
  
    // Otherwise p-block
    return 'p-block';
  };
  
  

  // Function to check if element matches any of the active filters
  const matchesFilter = (element) => {
    if (activeFilters.length === 0) return true; // No filters active
    
    return activeFilters.some(filter => {
      switch(filter) {
      case 'alkali-metals':
        return element.series && element.series.includes('alkali metal');
      case 'alkaline-earth-metals':
        return element.series && element.series.includes('alkaline earth');
      case 'transition-metals':
        return element.series && element.series.includes('transition');
      case 'post-transition-metals':
        return element.series && element.series.includes('post-transition');
      case 'metalloids':
        return element.series && element.series.includes('metalloid');
      case 'nonmetals':
        return element.series && element.series.includes('nonmetal') && !element.series.includes('noble gas');
      case 'noble-gases':
        return element.series && element.series.includes('noble gas');
      case 'lanthanides':
        return element.series && element.series.includes('lanthanide');
      case 'actinides':
        return element.series && element.series.includes('actinide');
      case 'solid':
        return element.phase === 'Solid';
      case 'liquid':
        return element.phase === 'Liquid';
      case 'gas':
        return element.phase === 'Gas';
      case 'discovered-before-1800':
        return element.discovered && element.discovered.year < 1800;
      case 'discovered-1800-1900':
        return element.discovered && element.discovered.year >= 1800 && element.discovered.year <= 1900;
      case 'discovered-after-1900':
        return element.discovered && element.discovered.year > 1900;
      case 'high-electronegativity':
        return element.electronegativity_pauling && element.electronegativity_pauling > 2.5;
      case 'low-electronegativity':
        return element.electronegativity_pauling && element.electronegativity_pauling < 1.5;
      case 'high-melting-point':
        return element.melting_point && element.melting_point > 1500;
      case 'low-melting-point':
        return element.melting_point && element.melting_point < 500;
      case 'conductors':
        return element.electrical_type === 'Conductor';
      case 'semiconductors':
        return element.series && element.series.includes('metalloid');
      case 'insulators':
        return element.series && (element.series.includes('nonmetal') || element.series.includes('noble gas'));
      case 'biological-role':
        return ['H', 'C', 'N', 'O', 'Na', 'Mg', 'P', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'I'].includes(element.symbol);
      case 'radioactive':
        return element.half_life && element.half_life !== 'Stable';
      case 'synthetic':
        return element.atomic_number >= 95;
      case 'abundant-crust':
        return element.abundance && element.abundance.crust > 0.1;
      case 'rare-earth':
        return element.series && element.series.includes('lanthanide');
      case 's-block':
        return getElementBlock(element) === 's-block';
      case 'p-block':
        return getElementBlock(element) === 'p-block';
      case 'd-block':
        return getElementBlock(element) === 'd-block';
      case 'f-block':
        return getElementBlock(element) === 'f-block';
      default:
        return true;
      }
    });
  };

  // Function to render an element card
  const renderElement = (atomicNumber, rowIndex, colIndex) => {
    if (!atomicNumber) return <div className="element empty"></div>;
    
    const element = elementMap[atomicNumber];
    if (!element) return <div className="element empty"></div>;
    
    // Determine element category for styling
    let category = '';
    if (element.series) {
      if (element.series.includes('alkali metal')) category = 'alkali';
      else if (element.series.includes('alkaline earth')) category = 'alkaline';
      else if (element.series.includes('transition')) category = 'transition';
      else if (element.series.includes('post-transition')) category = 'post-transition';
      else if (element.series.includes('metalloid')) category = 'metalloid';
      else if (element.series.includes('nonmetal')) category = 'nonmetal';
      else if (element.series.includes('noble gas')) category = 'noble';
      else if (element.series.includes('lanthanide')) category = 'lanthanide';
      else if (element.series.includes('actinide')) category = 'actinide';
    }
    
    // Check if element matches the filter
    const isHighlighted = matchesFilter(element);

    const isSelected = selectedElements.some(el => el.atomic_number === element.atomic_number);
    
    // Calculate group and period numbers
    // For main table (rows 0-6), the period is rowIndex + 1
    // For lanthanides and actinides (rows 8-9), special handling
    let period = rowIndex + 1;
    let group = colIndex + 1;
    
    // Special handling for lanthanides and actinides
    if (rowIndex >= 8) {
      period = rowIndex === 8 ? 6 : 7; // Lanthanides are period 6, actinides are period 7
      // These elements don't have traditional group numbers
      group = 0;
    }

    // Determine the class names
    let elementClasses = `element ${category}`;
    // Add filter classes (highlighted/faded)
    if (activeFilters.length > 0) {
      elementClasses += isHighlighted ? ' highlighted' : ' faded';
    }

    // Add selected class and fade non-selected elements if any are selected
    if (selectedElements.length > 0) {
      elementClasses += isSelected ? ' selected' : ' faded';
    }
    
    return (
      <div
        className={elementClasses}
        key={element.atomic_number}
        onClick={(e) => handleElementClick(element, e)}
        onContextMenu={(e) => handleRightClick(element, e)}
        onMouseEnter={(e) => handleMouseEnter(element, e)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="atomic-number">{element.atomic_number}</div>
        {showGroupPeriod && (
          <div className="group-period-indicators">
            {group && <div className="group-indicator">G{group}</div>}
            <div className="period-indicator">P{period}</div>
          </div>
        )}
        <div className="symbol">{element.symbol}</div>
        <div className="name">{element.name}</div>
      </div>
    );
  };

  // Layout of the periodic table
  // Each array represents a row, and each number represents the atomic number
  // 0 represents an empty cell
  const periodicTableLayout = [
    [1, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 4, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
    [11, 12, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
    [19, 20, 0,21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    [37, 38, 0,39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    [55, 56, 0,71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    [87, 88, 0,103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0,0, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 0, 0],
    [0, 0, 0, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 0, 0]
  ];

  // Handle filter click for multi-selection
  const handleFilterClick = (filter) => {
    setActiveFilters(prevFilters => {
      if (prevFilters.includes(filter)) {
        return prevFilters.filter(f => f !== filter); // Remove filter if already active
      } else {
        return [...prevFilters, filter]; // Add filter to active filters
      }
    });
  };
  
  // Toggle group and period numbers display
  const toggleGroupPeriod = () => {
    setShowGroupPeriod(prev => !prev);
  };
  
  // Handle dropdown toggle
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Function to handle opening the chatbot with selected elements
  const handleOpenChatbot = () => {
    if (selectedElements.length > 0) {
      setShowChatbot(true);
    }
  };

  return (
    <div className="periodic-table-container">
     
      <div className="periodic-table-wrapper">
        
        
        <div className="periodic-table-with-periods">
          

          {/* Name Image */}
          <img src={image} alt="Periodic Table Title" className="name-image" />


          {/* The periodic table */}
          <div className="periodic-table">
            {periodicTableLayout.map((row, rowIndex) => (
              <div className="row" key={rowIndex}>
                {row.map((atomicNumber, colIndex) => (
                  <div className="cell" key={`${rowIndex}-${colIndex}`}>
                    {renderElement(atomicNumber, rowIndex, colIndex)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </div>
      <ElementDetails 
        element={hoveredElement} 
        visible={hoveredElement !== null} 
        position={tooltipPosition} 
      />
      
      {showChatbot && selectedElements.length > 0 && (
        <ElementChatbot 
          selectedElements={selectedElements}
          onClose={handleCloseChatbot}
          showCombine={selectedElements.length > 1}
        />
      )}
      <TaskBar 
        activeFilters={activeFilters}
        handleFilterClick={handleFilterClick}
        setActiveFilters={setActiveFilters}
        showGroupPeriod={showGroupPeriod}
        toggleGroupPeriod={toggleGroupPeriod}
        openChatbot={handleOpenChatbot}
        getHighlightedElements={getHighlightedElements}
        selectedElements={selectedElements}
      />
    </div>
  );
};

export default PeriodicTable;
import React, { useState } from 'react';
import './PeriodicTable.css';
import elementData from '../pTable.json';
import ElementDetails from './ElementDetails';

const PeriodicTable = () => {
  // State for hover details
  const [hoveredElement, setHoveredElement] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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

  // Function to render an element card
  const renderElement = (atomicNumber) => {
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
    
    return (
      <div 
        className={`element ${category}`} 
        key={element.atomic_number}
        onMouseEnter={(e) => handleMouseEnter(element, e)}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        <div className="atomic-number">{element.atomic_number}</div>
        <div className="symbol">{element.symbol}</div>
        <div className="name">{element.name}</div>
      </div>
    );
  };

  // Layout of the periodic table
  // Each array represents a row, and each number represents the atomic number
  // 0 represents an empty cell
  const periodicTableLayout = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 7, 8, 9, 10],
    [11, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    [55, 56, 57, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    [87, 88, 89, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 0, 0],
    [0, 0, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 0, 0]
  ];

  return (
    <div className="periodic-table-container">
      <h1>Periodic Table of Elements</h1>
      <div className="periodic-table">
        {periodicTableLayout.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((atomicNumber, colIndex) => (
              <div className="cell" key={`${rowIndex}-${colIndex}`}>
                {renderElement(atomicNumber)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <ElementDetails 
        element={hoveredElement} 
        visible={hoveredElement !== null} 
        position={tooltipPosition} 
      />
      <div className="legend">
        <div className="legend-item"><span className="legend-color alkali"></span> Alkali metals</div>
        <div className="legend-item"><span className="legend-color alkaline"></span> Alkaline earth metals</div>
        <div className="legend-item"><span className="legend-color transition"></span> Transition metals</div>
        <div className="legend-item"><span className="legend-color post-transition"></span> Post-transition metals</div>
        <div className="legend-item"><span className="legend-color metalloid"></span> Metalloids</div>
        <div className="legend-item"><span className="legend-color nonmetal"></span> Nonmetals</div>
        <div className="legend-item"><span className="legend-color noble"></span> Noble gases</div>
        <div className="legend-item"><span className="legend-color lanthanide"></span> Lanthanides</div>
        <div className="legend-item"><span className="legend-color actinide"></span> Actinides</div>
      </div>
    </div>
  );
};

export default PeriodicTable;
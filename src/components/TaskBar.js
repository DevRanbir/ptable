import React, { useState, useEffect, useRef } from 'react';
import './TaskBar.css';
import { FaChevronDown, FaChevronUp, FaFilter, FaRobot, FaTable, FaPalette } from 'react-icons/fa';
import { FaInfoCircle } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const TaskBar = ({
  activeFilters,
  handleFilterClick,
  setActiveFilters,
  toggleGroupPeriod,
  openChatbot,
  selectedElements,
  setSelectedElements,
  elementData,
  setShowQuickInfo,
  showGroupPeriod
}) => {
  const [openSection, setOpenSection] = useState(null);
  const taskbarRef = useRef(null); // Create a ref for the taskbar element
  const [toggledLegends ] = useState([]);
  const [groupPeriodDisplay, setGroupPeriodDisplay] = useState('disabled');

  const getNameImageClass2 = () => {
    return showGroupPeriod === 'external' ? 'dot-lottie-react2 external' : 'dot-lottie-react2 internal';
  };


  const handleQuickInfoClick = () => {
    setShowQuickInfo(true);
  };

  const handleGroupPeriodChange = (option) => {
    setGroupPeriodDisplay(option);
    toggleGroupPeriod(option);
  };

  const handleChatbotClick = () => {
    if (activeFilters.length > 0) {
      // Get all elements that match the current filters
      const filteredElements = elementData.filter(element => {
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
              return element.block === 's';
            case 'p-block':
              return element.block === 'p';
            case 'd-block':
              return element.block === 'd';
            case 'f-block':
              return element.block === 'f';
            default:
              return false;
          }
        });
      });
      setSelectedElements(filteredElements);
    } else if (selectedElements.length === 0) {
      // If no filters and no selections, select all elements
      setSelectedElements(elementData);
    }
    openChatbot();
  };

  // Handle legend item hover
  const handleLegendHover = (category, isHovering) => {
    if (!toggledLegends.includes(category)) {
      // Pass the category, whether it's a toggle action (false for hover), and the hover state
      handleFilterClick(category, false, isHovering);
    }
  };

  // Toggle section open/close
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Effect to handle clicks outside the taskbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the taskbar element
      if (taskbarRef.current && !taskbarRef.current.contains(event.target)) {
        setOpenSection(null); // Close the dropdown
      }
    };

    // Add event listener when a section is open
    if (openSection !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup: Remove event listener when component unmounts or section closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSection]); // Re-run effect when openSection changes


  return (
    <div className="taskbar" ref={taskbarRef}> {/* Attach the ref to the taskbar div */}
      <DotLottieReact
                src="https://lottie.host/e6c0bd4e-c611-432f-ab2a-9bedea410baa/NjaNHCwt2O.lottie"
                loop 
                autoplay
                className={getNameImageClass2()}
      />
      <div className="taskbar-content">
        {/* Left section - Legends */}
        <div className="taskbar-left">

            {/* Legends Section */}
          <div className="taskbar-item">
            
            <button
              className={`taskbar-button ${openSection === 'legends' ? 'active' : ''}`}
              onClick={() => toggleSection('legends')}
              title="Element Legends"
            >
              <FaPalette />
              <span className="button-text">Legends</span>
              {openSection === 'legends' ? <FaChevronDown /> : <FaChevronUp />}
            </button>

            {openSection === 'legends' && (
              <div className="taskbar-dropdown legends-dropdown">
                <div className="legends-container">
                  <h4>Element Categories</h4>
                  <div className="legend-items">

                    <div
                      className={`legend-item ${toggledLegends.includes('alkali-metals') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('alkali-metals', true)}
                      onMouseLeave={() => handleLegendHover('alkali-metals', false)}
                    >
                      {/* Move checkbox inside the color span */}
                      <span className="legend-color alkali">
                        <input
                          type="checkbox"
                          checked={toggledLegends.includes('alkali-metals')}
                          readOnly
                        />
                      </span>
                      <span>Alkali Metals</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('alkaline-earth-metals') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('alkaline-earth-metals', true)}
                      onMouseLeave={() => handleLegendHover('alkaline-earth-metals', false)}
                    >
                      {/* Move checkbox inside the color span */}
                      <span className="legend-color alkaline">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('alkaline-earth-metals')}
                          readOnly
                        />
                      </span>
                      <span>Alkaline Earth Metals</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('transition-metals') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('transition-metals', true)}
                      onMouseLeave={() => handleLegendHover('transition-metals', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color transition">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('transition-metals')}
                          readOnly
                        />
                       </span>
                      <span>Transition Metals</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('post-transition-metals') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('post-transition-metals', true)}
                      onMouseLeave={() => handleLegendHover('post-transition-metals', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color post-transition">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('post-transition-metals')}
                          readOnly
                        />
                       </span>
                      <span>Post-Transition Metals</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('metalloids') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('metalloids', true)}
                      onMouseLeave={() => handleLegendHover('metalloids', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color metalloid">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('metalloids')}
                          readOnly
                        />
                       </span>
                      <span>Metalloids</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('nonmetals') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('nonmetals', true)}
                      onMouseLeave={() => handleLegendHover('nonmetals', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color nonmetal">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('nonmetals')}
                          readOnly
                        />
                       </span>
                      <span>Nonmetals</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('noble-gases') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('noble-gases', true)}
                      onMouseLeave={() => handleLegendHover('noble-gases', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color noble">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('noble-gases')}
                          readOnly
                        />
                       </span>
                      <span>Noble Gases</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('lanthanides') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('lanthanides', true)}
                      onMouseLeave={() => handleLegendHover('lanthanides', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color lanthanide">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('lanthanides')}
                          readOnly
                        />
                       </span>
                      <span>Lanthanides</span>
                    </div>
                    <div
                      className={`legend-item ${toggledLegends.includes('actinides') ? 'active' : ''}`}
                      onMouseEnter={() => handleLegendHover('actinides', true)}
                      onMouseLeave={() => handleLegendHover('actinides', false)}
                    >
                       {/* Move checkbox inside the color span */}
                       <span className="legend-color actinide">
                         <input
                          type="checkbox"
                          checked={toggledLegends.includes('actinides')}
                          readOnly
                        />
                       </span>
                      <span>Actinides</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters Section */}
          <div className="taskbar-item">
          <button
            className={`taskbar-button ${openSection === 'filters' ? 'active' : ''} ${activeFilters.length > 0 ? 'has-active' : ''}`}
            onClick={() => toggleSection('filters')}
            title="Filter Elements"
          >
            <FaFilter />
            <span className="button-text">Filters</span>
            {activeFilters.length > 0 && <span className="filter-count">{activeFilters.length}</span>}
            {openSection === 'filters' ? <FaChevronDown /> : <FaChevronUp />}
          </button>

          {openSection === 'filters' && (
            <div className="taskbar-dropdown2 filters-dropdown">
              <div className="filter-categories">
                <div className="filter-category">
                  <h4>Block Filters</h4>
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${activeFilters.includes('s-block') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('s-block')}
                    >s-block</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('p-block') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('p-block')}
                    >p-block</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('d-block') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('d-block')}
                    >d-block</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('f-block') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('f-block')}
                    >f-block</button>
                  </div>
                </div>

                <div className="filter-category">
                  <h4>Element Categories</h4>
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${activeFilters.includes('alkali-metals') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('alkali-metals')}
                    >Alkali Metals</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('alkaline-earth-metals') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('alkaline-earth-metals')}
                    >Alkaline Earth Metals</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('transition-metals') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('transition-metals')}
                    >Transition Metals</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('post-transition-metals') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('post-transition-metals')}
                    >Post-Transition Metals</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('metalloids') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('metalloids')}
                    >Metalloids</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('nonmetals') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('nonmetals')}
                    >Nonmetals</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('noble-gases') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('noble-gases')}
                    >Noble Gases</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('lanthanides') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('lanthanides')}
                    >Lanthanides</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('actinides') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('actinides')}
                    >Actinides</button>
                  </div>
                </div>

                <div className="filter-category">
                  <h4>Physical Properties</h4>
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${activeFilters.includes('solid') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('solid')}
                    >Solid at Room Temperature</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('liquid') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('liquid')}
                    >Liquid at Room Temperature</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('gas') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('gas')}
                    >Gas at Room Temperature</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('high-electronegativity') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('high-electronegativity')}
                    >High Electronegativity</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('low-electronegativity') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('low-electronegativity')}
                    >Low Electronegativity</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('high-melting-point') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('high-melting-point')}
                    >High Melting Point</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('low-melting-point') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('low-melting-point')}
                    >Low Melting Point</button>
                  </div>
                </div>

                <div className="filter-category">
                  <h4>Other Properties</h4>
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${activeFilters.includes('conductors') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('conductors')}
                    >Conductors</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('semiconductors') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('semiconductors')}
                    >Semiconductors</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('insulators') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('insulators')}
                    >Insulators</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('biological-role') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('biological-role')}
                    >Biological Role</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('radioactive') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('radioactive')}
                    >Radioactive Elements</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('synthetic') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('synthetic')}
                    >Synthetic Elements</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('abundant-crust') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('abundant-crust')}
                    >Abundant in Earth's Crust</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('rare-earth') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('rare-earth')}
                    >Rare Earth Elements</button>
                  </div>
                </div>

                <div className="filter-category">
                  <h4>Historical</h4>
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${activeFilters.includes('discovered-before-1800') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('discovered-before-1800')}
                    >Discovered Before 1800</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('discovered-1800-1900') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('discovered-1800-1900')}
                    >Discovered 1800–1900</button>
                    <button
                      className={`filter-btn ${activeFilters.includes('discovered-after-1900') ? 'active' : ''}`}
                      onClick={() => handleFilterClick('discovered-after-1900')}
                    >Discovered After 1900</button>
                  </div>
                </div>
              </div>

              {/* Active filters display */}
              <div className="active-filters">
                  <span>Active Filters: </span>
                  {activeFilters.map(filter => (
                    <span key={filter} className="active-filter-tag">
                      {filter.replace(/-/g, ' ')}
                      <button onClick={() => handleFilterClick(filter)}>×</button>
                    </span>
                  ))}
                  <button
                    className="clear-filters"
                    onClick={() => setActiveFilters([])}
                  >Clear All</button>
                </div>
            </div>
          )}
            </div>
          
          
        </div>

        {/* Center section - Title */}
        <div className="taskbar-center">
          Periodic Table of Elements
        </div>

        {/* Right section - Filters and Chatbot */}
        <div className="taskbar-right">

          {/* Group/Period Display Section */}
          <div className="taskbar-item">
            <button
              className={`taskbar-button ${openSection === 'group-period' ? 'active' : ''}`}
              onClick={() => toggleSection('group-period')}
              title="Group/Period Display"
            >
              <FaTable />
              <span className="button-text">Group/Period</span>
              {openSection === 'group-period' ? <FaChevronDown /> : <FaChevronUp />}
            </button>

            {openSection === 'group-period' && (
              <div className="taskbar-dropdown3 group-period-dropdown">
                <div className="group-period-container">
                  <h4>Display Options</h4>
                  <div className="group-period-options">
                    <div
                      className={`option-item ${groupPeriodDisplay === 'disabled' ? 'active' : ''}`}
                      onClick={() => handleGroupPeriodChange('disabled')}
                    >
                      <input
                        type="radio"
                        checked={groupPeriodDisplay === 'disabled'}
                        readOnly
                      />
                      <span>Disabled</span>
                    </div>
                    <div
                      className={`option-item ${groupPeriodDisplay === 'internal' ? 'active' : ''}`}
                      onClick={() => handleGroupPeriodChange('internal')}
                    >
                      <input
                        type="radio"
                        checked={groupPeriodDisplay === 'internal'}
                        readOnly
                      />
                      <span>Internal (Inside Elements)</span>
                    </div>
                    <div
                      className={`option-item ${groupPeriodDisplay === 'external' ? 'active' : ''}`}
                      onClick={() => handleGroupPeriodChange('external')}
                    >
                      <input
                        type="radio"
                        checked={groupPeriodDisplay === 'external'}
                        readOnly
                      />
                      <span>External (Table Layout)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          
          {/* Chatbot Button */}
          <div className="taskbar-item">
            <button
              className="taskbar-button chatbot-button"
              onClick={handleChatbotClick}
              title="Open Chemistry Teacher Assistant"
            >
              <FaRobot />
              <span className="button-text">Chemistry Lab</span>
            </button>
          </div>

          {/* Quick Info Button */}
          <div className="taskbar-item">
            <button
              className="taskbar-button info-button"
              onClick={handleQuickInfoClick}
              title="View Components Guide"
            >
              <FaInfoCircle />
            </button>
            <DotLottieReact
              src="https://lottie.host/51287b2a-828c-49f1-be68-1972275667f7/HnvhE8dKwZ.lottie"
              loop
              autoplay
              className='imp'
            />
          </div>

        </div>
      </div>
      </div>
    );
};

export default TaskBar;

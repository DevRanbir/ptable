import React, { useState, useEffect, useRef } from 'react';
import './ElementDetails.css';

const ElementDetails = ({ element, visible, position }) => {
  const [elementImage, setElementImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const detailsRef = useRef(null);
  
  useEffect(() => {
    // Fetch element image from Wikipedia when element changes
    if (element && visible) {
      fetchElementImage(element.name);
    }
  }, [element, visible]);
  
  useEffect(() => {
    // Calculate position to ensure tooltip stays within viewport
    if (visible && detailsRef.current) {
      const detailsRect = detailsRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Default position (directly above the hovered element)
      let style = {
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -110%)',
        marginTop: '-20px'
      };
      
      // Check if tooltip goes out of the top of the screen
      if (position.y - detailsRect.height < 10) {
        // Position below instead
        style.transform = 'translate(-50%, 0)';
        style.marginTop = '10px';
      }
      
      // Check horizontal overflow
      if (position.x - (detailsRect.width / 2) < 10) {
        // Adjust if too far left
        style.left = detailsRect.width / 2 + 10;
      } else if (position.x + (detailsRect.width / 2) > viewportWidth - 10) {
        // Adjust if too far right
        style.left = viewportWidth - detailsRect.width / 2 - 10;
      }
      
      setTooltipStyle(style);
    }
  }, [position, visible]);

  const fetchElementImage = async (elementName) => {
    setLoading(true);
    try {
      // Wikipedia API search for the element
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(elementName)}&pithumbsize=200&origin=*`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      // Extract the image URL from the response
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
        setElementImage(pages[pageId].thumbnail.source);
      } else {
        // If no image found, set to null
        setElementImage(null);
      }
    } catch (error) {
      console.error('Error fetching element image:', error);
      setElementImage(null);
    } finally {
      setLoading(false);
    }
  };

  if (!element || !visible) return null;

  // Format discovery information
  const discoveryInfo = element.discovered ? 
    `${element.discovered.year || ''}${element.discovered.by ? ` by ${element.discovered.by}` : ''}${element.discovered.location ? ` in ${element.discovered.location}` : ''}` : 
    'Unknown';

  return (
    <div className="element-details" style={tooltipStyle} ref={detailsRef}>
      <div className="element-header">
        <div className="element-symbol">{element.symbol}</div>
        <div className="element-name-number">
          <h2>{element.name}</h2>
          <span className="atomic-number">{element.atomic_number}</span>
        </div>
      </div>
      
      <div className="element-content">
        <div className="details-section">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Atomic Mass:</span>
              <span className="detail-value">{element.atomic_mass}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{element.series}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phase:</span>
              <span className="detail-value">{element.phase}</span>
            </div>
            {element.electron_configuration && (
              <div className="detail-item">
                <span className="detail-label">e⁻ Config:</span>
                <span className="detail-value electron-config">{element.electron_configuration}</span>
              </div>
            )}
            {element.discovered && (
              <div className="detail-item discovery">
                <span className="detail-label">Discovered:</span>
                <span className="detail-value">{discoveryInfo}</span>
              </div>
            )}
          </div>
        </div>
        
        {elementImage && !loading && (
          <div className="image-section">
            <img 
              src={elementImage} 
              alt={`${element.name}`} 
              className="element-image"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementDetails;
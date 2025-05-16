import React from 'react';
import './ElementDetails.css';

const ElementDetails = ({ element, visible, position }) => {
  if (!element || !visible) return null;

  const style = {
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  return (
    <div className="element-details" style={style}>
      <h2>{element.name} ({element.symbol})</h2>
      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Atomic Number:</span>
          <span className="detail-value">{element.atomic_number}</span>
        </div>
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
        <div className="detail-item">
          <span className="detail-label">Electron Configuration:</span>
          <span className="detail-value">{element.electron_configuration}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Discovered:</span>
          <span className="detail-value">
            {element.discovered ? `${element.discovered.year} by ${element.discovered.by}` : 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ElementDetails;
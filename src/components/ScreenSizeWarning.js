import React, { useState, useEffect } from 'react';
import './ScreenSizeWarning.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ScreenSizeWarning = () => {
  const [showWarning, setShowWarning] = useState(true);
  const [isHighAspectRatio, setIsHighAspectRatio] = useState(false);
  const [canHide, setCanHide] = useState(false);

  useEffect(() => {
    const checkAspectRatio = () => {
      const aspectRatio = window.innerHeight / window.innerWidth;
      setIsHighAspectRatio(aspectRatio > 1.6);
    };

    checkAspectRatio();
    window.addEventListener('resize', checkAspectRatio);

    // Always show for at least 5 seconds
    const minDisplayTimer = setTimeout(() => {
      setCanHide(true);
    }, 5000);

    // Additional auto-hide logic for specific screen sizes
    if (window.innerWidth >= 480 && window.innerWidth < 768) {
      const hideTimer = setTimeout(() => {
        if (canHide) {
          setShowWarning(false);
        }
      }, 5100); // Slight delay after canHide is set to true
      return () => {
        clearTimeout(hideTimer);
        clearTimeout(minDisplayTimer);
      };
    }

    return () => {
      window.removeEventListener('resize', checkAspectRatio);
      clearTimeout(minDisplayTimer);
    };
  }, [canHide]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!showWarning) return null;

  return (
    <div className={`screen-size-warning ${!canHide ? 'force-show' : ''}`}>
      <div className="warning-content">
        <h2>Optimize Your Experience</h2>
        <p>For the best viewing experience of our Interactive Periodic Table, please:</p>
        
        <div className="action-buttons">
          <button className="action-button" onClick={toggleFullScreen}>
            <div className="animation-container fullscreen-animation">
              <DotLottieReact
                src="https://lottie.host/74bc7a0a-6608-466d-929b-091863a848f0/6XVOzdm2I6.lottie"
                loop
                autoplay
              />
            </div>
            <span>Enter Fullscreen</span>
          </button>
          
          {isHighAspectRatio && (
            <div className="action-button">
              <div className="animation-container rotate-animation">
                <DotLottieReact
                  src="https://lottie.host/6f8275eb-40b5-4b6a-8103-3bc7f76e12e7/Xj9iwHCMwZ.lottie"
                  loop
                  autoplay
                />
              </div>
              <span>Rotate Your Device</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenSizeWarning;
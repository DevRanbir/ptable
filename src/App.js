
import React from 'react';
import './App.css';
import PeriodicTable from './components/PeriodicTable';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function App() {
  return (
    <div className="App">
      <PeriodicTable />
      <DotLottieReact
          src="https://lottie.host/e6c0bd4e-c611-432f-ab2a-9bedea410baa/NjaNHCwt2O.lottie"
          loop 
          autoplay
          className="dot-lottie-react"
    />
    </div>
  );
}

export default App;

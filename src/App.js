
import React from 'react';
import './App.css';
import PeriodicTable from './components/PeriodicTable';
import ScreenSizeWarning from './components/ScreenSizeWarning';

function App() {
  return (
    <div className="App">
      <PeriodicTable />
      <ScreenSizeWarning />
    </div>
  );
}

export default App;

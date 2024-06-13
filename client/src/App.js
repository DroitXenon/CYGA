import React, { useState, useEffect } from 'react';
import './App.css';
import IncidentList from './components/IncidentList';
import IncidentDetails from './components/IncidentDetails';

function App() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentData, setIncidentData] = useState([]);

  useEffect(() => {
    // Fetch incident data from the API
    fetch('http://localhost:5001/api/attacks')
      .then(response => response.json())
      .then(data => setIncidentData(data))
      .catch(error => console.error('Error fetching incident data:', error));
  }, []);

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleBackClick = () => {
    setSelectedIncident(null);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button className="menu-button">☰</button>
        <button className="back-button" onClick={handleBackClick}>←</button>
        <button className="home-button" onClick={handleBackClick}>🏠</button>
      </div>
      <div className="content">
        {selectedIncident ? (
          <IncidentDetails incident={selectedIncident} />
        ) : (
          <IncidentList incidents={incidentData} onIncidentClick={handleIncidentClick} />
        )}
      </div>
    </div>
  );
}

export default App;

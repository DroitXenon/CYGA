import React, { useState, useEffect } from 'react';
import './App.css';
import IncidentList from './components/IncidentList';
import IncidentDetails from './components/IncidentDetails';

function App() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentData, setIncidentData] = useState([]);
  
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = (query = '') => {
    fetch(`http://localhost:5001/api/search?query=${query}`)
      .then(response => response.json())
      .then(data => setIncidentData(data))
      .catch(error => console.error('Error fetching incident data:', error));
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  const handleBackClick = () => {
    setSelectedIncident(null);
  };

  const handleSort = (column, order) => {
    fetch(`http://localhost:5001/api/sort?column=${column}&order=${order}`)
      .then(response => response.json())
      .then(data => setIncidentData(data))
      .catch(error => console.error('Error sorting incident data:', error));
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
          <IncidentList incidents={incidentData} onIncidentClick={handleIncidentClick} onSort={handleSort} fetchIncidents={fetchIncidents} />
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import IncidentList from './components/IncidentList';
import IncidentDetails from './components/IncidentDetails';

function App() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentData, setIncidentData] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = () => {
    fetch(`http://localhost:5001/api/incidents`)
      .then(response => response.json())
      .then(data => setIncidentData(Array.isArray(data) ? data : []))
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
      .then(data => setIncidentData(Array.isArray(data) ? data : []))
      .catch(error => console.error('Error sorting incident data:', error));
  };

  const handleSearch = () => {
    console.log('Search keyword:', searchKeyword);
    if (searchKeyword.trim() === '') {
      fetchIncidents();
    } else {
      fetch(`http://localhost:5001/api/search?keyword=${searchKeyword}`)
        .then(response => response.json())
        .then(data => {
          console.log('Search results:', data);
          setIncidentData(Array.isArray(data) ? data : []);
        })
        .catch(error => console.error('Error searching incident data:', error));
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <button className="menu-button">☰</button>
        <button className="back-button" onClick={handleBackClick}>←</button>
        <button className="home-button" onClick={handleBackClick}>H</button>
      </div>
      <div className="content">
        <input
            type="text"
            placeholder="Search..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        {selectedIncident ? (
          <IncidentDetails incident={selectedIncident} />
        ) : (
          <IncidentList incidents={incidentData} onIncidentClick={handleIncidentClick} onSort={handleSort} />
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useRef, useState, useEffect } from 'react';
import { Container, AppBar, Toolbar, Typography, Button, IconButton, Box, Modal, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IncidentList from './components/IncidentList';
import IncidentDetails from './components/IncidentDetails';
import './App.css';
import Globe from 'globe.gl';

function App() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentData, setIncidentData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newIncident, setNewIncident] = useState({
    SourceIP: '',
    SourcePort: '',
    DestinationIP: '',
    DestinationPort: '',
    UserInfo: '',
    DeviceInfo: '',
    GeoLocation: '',
    Protocol: '',
    PacketLength: '',
    PacketType: '',
    TrafficType: '',
    Segment: '',
    AnomalyScores: '',
    ActionTaken: '',
    SeverityLevel: '',
    LogSource: '',
    AttackType: '',
    Timestamp: '',
    AttackSignature: ''
  });
  const [selectedIncidentIds, setSelectedIncidentIds] = useState([]);

  const globeEl = useRef();

  useEffect(() => {
    const globe = Globe()
      (globeEl.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-day.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('#ffffff')
    globe.pointOfView({ altitude: 2.5 });
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

  const handleAddIncident = () => {
    fetch(`http://localhost:5001/api/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIncident)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Incident added:', data);
        fetchIncidents();
        setIsAddModalOpen(false);
      })
      .catch(error => console.error('Error adding incident:', error));
  };

  const handleDeleteIncidents = () => {
    selectedIncidentIds.forEach(id => {
      fetch(`http://localhost:5001/api/delete/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => {
          console.log('Incident deleted:', data);
          fetchIncidents();
        })
        .catch(error => console.error('Error deleting incident:', error));
    });
    setSelectedIncidentIds([]);
  };

  const handleSelectIncident = (id) => {
    setSelectedIncidentIds(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(selectedId => selectedId !== id) : [...prevSelected, id]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncident({ ...newIncident, [name]: value });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="App">
      <AppBar position="absolute">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleBackClick} sx= {{ mr: 2 }}>
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" >
            CYGA Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <div style={{ position: 'relative', height: '100vh', marginTop: '64px' }}>
        <div ref={globeEl} style={{ position: 'relative', left: 250, width: '100%', height: '100%' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '40%', backgroundColor: 'white', borderRight: '3px solid #ccc', padding: '25px' }}>
          <Box>
            {selectedIncident ? (
              <IncidentDetails incident={selectedIncident} />
            ) : (
              <IncidentList 
                incidents={incidentData} 
                onIncidentClick={handleIncidentClick} 
                onSort={handleSort} 
                onSelectIncident={handleSelectIncident} 
                selectedIncidentIds={selectedIncidentIds} 
                fetchIncidents={fetchIncidents}
                setIncidentData={setIncidentData}
                handleAddIncident={() => setIsAddModalOpen(true)}
                handleDeleteIncidents={handleDeleteIncidents}
              />
            )}
          </Box>
        </div>
      </div>


      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <Box
          sx={{
            p: 3,
            mx: 'auto',
            mt: 5,
            maxWidth: 500,
            maxHeight: '80vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add
          </Typography>
          {Object.keys(newIncident).map((field) => (
            <TextField
              key={field}
              label={field}
              name={field}
              value={newIncident[field]}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
          ))}
          <Button variant="contained" color="primary" onClick={handleAddIncident} sx={{ mt: 2 }}>
            Add Incident
          </Button>
        </Box>
      </Modal>

    </div>
  );
}

export default App;

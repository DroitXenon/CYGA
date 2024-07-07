import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, Box, Modal, TextField, Typography, Button } from '@mui/material';
import IncidentList from './IncidentList';
import IncidentDetails from './IncidentDetails';
import Globe from 'globe.gl';

function MainPage() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentData, setIncidentData] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    SourceIP: '',
    SourcePort: '',
    SourceLatitude: '',
    SourceLongitude: '',
    DestinationIP: '',
    DestinationPort: '',
    DestinationLatitude: '',
    DestinationLongitude: '',
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
  const globeInstance = useRef(null);

  useEffect(() => {
    window.handleMainPageBackClick = handleBackClick;
    globeInstance.current = Globe()
      (globeEl.current)
      .width(window.innerWidth * 1.4)
      .height(window.innerHeight - 64)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png');

    globeInstance.current.pointOfView({
      lat: parseFloat(43.466667),
      lng: parseFloat(-80.516670),
      altitude: 3
    }, 1500);
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
    const { SourceLatitude, SourceLongitude, DestinationLatitude, DestinationLongitude } = incident;
    const arcsData = [
      {
        startLat: parseFloat(SourceLatitude),
        startLng: parseFloat(SourceLongitude),
        endLat: parseFloat(DestinationLatitude),
        endLng: parseFloat(DestinationLongitude),
      }
    ];
    globeInstance.current
      .arcsData(arcsData)
      .arcColor(() => ['#0252FB', '#C0D3FA'])
      .arcDashLength(0.5)
      .arcDashGap(0.5)
      .arcDashInitialGap(() => Math.random())
      .arcStroke(() => 0.7)
      .arcDashAnimateTime(1500);
    globeInstance.current.pointOfView({
      lat: parseFloat(DestinationLatitude),
      lng: parseFloat(DestinationLongitude),
      altitude: 2
    }, 2000);
  };

  const handleBackClick = () => {
    setSelectedIncident(null);
    globeInstance.current.arcsData([]);
    globeInstance.current.pointOfView({
      lat: parseFloat(43.466667),
      lng: parseFloat(-80.516670),
      altitude: 3
    }, 2000);
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

  return (
    <div >
      <div ref={globeEl}></div>
      <Card sx={{ position: 'absolute', top: 100, left: 50, width: '40%', height: 'calc(100vh - 150px)' }}>
        <CardContent>
          <Box className="table-container">
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
        </CardContent>
      </Card>
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
            Add Incident
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

export default MainPage;
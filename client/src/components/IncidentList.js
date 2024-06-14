import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, TableSortLabel, Checkbox, TextField, Button, Box, Modal, Typography } from '@mui/material';

function IncidentList({ incidents, onIncidentClick, onSort, onSelectIncident, selectedIncidentIds, fetchIncidents, setIncidentData, handleAddIncident, handleDeleteIncidents }) {
  const [sortColumn, setSortColumn] = useState('Timestamp');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleSort = (column) => {
    const order = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(column);
    setSortOrder(order);
    onSort(column, order);
  };

  const handleSearch = () => {
    if (searchKeyword.trim() === '') {
      fetchIncidents();
    } else {
      fetch(`http://localhost:5001/api/search?keyword=${searchKeyword}`)
        .then(response => response.json())
        .then(data => {
          setIncidentData(Array.isArray(data) ? data : []);
        })
        .catch(error => console.error('Error searching incident data:', error));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIncident({ ...newIncident, [name]: value });
  };

  const handleAddModalOpen = () => setIsAddModalOpen(true);
  const handleAddModalClose = () => setIsAddModalOpen(false);

  const handleAddButtonClick = () => {
    handleAddIncident(newIncident);
    setIsAddModalOpen(false);
    setNewIncident({
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
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Search..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="contained" color="primary" onClick={handleAddModalOpen} sx={{ ml: 2 }}>
          Add
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDeleteIncidents} sx={{ ml: 2 }}>
          Delete
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'Timestamp'}
                  direction={sortOrder.toLowerCase()}
                  onClick={() => handleSort('Timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'AttackType'}
                  direction={sortOrder.toLowerCase()}
                  onClick={() => handleSort('AttackType')}
                >
                  Attack Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortColumn === 'AttackSignature'}
                  direction={sortOrder.toLowerCase()}
                  onClick={() => handleSort('AttackSignature')}
                >
                  Attack Signature
                </TableSortLabel>
              </TableCell>
              <TableCell>Select</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(incidents) && incidents.length > 0 ? (
              incidents.map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell onClick={() => onIncidentClick(incident)}>{incident.Timestamp}</TableCell>
                  <TableCell onClick={() => onIncidentClick(incident)}>{incident.AttackType}</TableCell>
                  <TableCell onClick={() => onIncidentClick(incident)}>{incident.AttackSignature}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={selectedIncidentIds.includes(incident.id)}
                      onChange={() => onSelectIncident(incident.id)}
                      inputProps={{ 'aria-label': 'Select incident' }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>No incidents found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isAddModalOpen} onClose={handleAddModalClose}>
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
            Add New Incident
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
          <Button variant="contained" color="primary" onClick={handleAddButtonClick} sx={{ mt: 2 }}>
            Add Incident
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default IncidentList;

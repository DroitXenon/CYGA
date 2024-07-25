import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, TableSortLabel, Checkbox, TextField, Button, Box, ButtonGroup} from '@mui/material';

function IncidentList({ incidents, onIncidentClick, onSort, onSelectIncident, selectedIncidentIds, fetchIncidents, setIncidentData, handleAddIncident, handleDeleteIncidents }) {
  const [sortColumn, setSortColumn] = useState('Timestamp');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // Realize the sorting
  // The sorting is implemented by sending a GET request to the server with the column name and order as query parameters.
  const handleSort = (column) => {
    const order = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(column);
    setSortOrder(order);
    onSort(column, order);
  };


  // Realize the search
  // The search is implemented by sending a GET request to the server with the search keyword as a query parameter.
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <TextField
          variant="standard"
          placeholder="Search"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          sx={{ mr: 2 }}
        />
        <ButtonGroup variant="outlined" size="medium">
          <Button onClick={handleSearch} >
            Search
          </Button>
          <Button onClick={handleAddIncident} >
            Add
          </Button>
          <Button color="secondary" onClick={handleDeleteIncidents}>
            Delete
          </Button>
        </ButtonGroup>
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
    </Box>
  );
}

export default IncidentList;

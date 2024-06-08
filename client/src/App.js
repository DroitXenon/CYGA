import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Table, TableSortLabel, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Checkbox, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const App = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState({ ip: '', attackType: '', incidentId: '' });
  const [filters, setFilters] = useState({ severity: '', attackType: '' });
  const [sort, setSort] = useState({ column: '', order: '' });
  const [selectedRows, setSelectedRows] = useState([]);

  const fetchData = async () => {
    const response = await axios.get('http://localhost:5001/api/attacks');
    setData(response.data);
  };

  const handleSearch = async () => {
    const response = await axios.get('http://localhost:5001/api/search', { params: query });
    setData(response.data);
  };

  const handleFilter = async () => {
    const response = await axios.get('http://localhost:5001/api/filter', { params: filters });
    setData(response.data);
   
  };

  const handleSort = async (column) => {
    const order = sort.order === 'ASC' ? 'DESC' : 'ASC';
    setSort({ column, order });
    const response = await axios.get('http://localhost:5001/api/sort', { params: { column, order } });
    setData(response.data);
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const handleDelete = async () => {
    await Promise.all(selectedRows.map((id) => axios.delete(`http://localhost:5001/api/delete/${id}`)));
    fetchData();
    setSelectedRows([]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Cyber Geolocation Analysis</h1>

      <div className="search">
        <TextField
          label="ID"
          variant="outlined"
          value={query.incidentId}
          onChange={(e) => setQuery({ ...query, incidentId: e.target.value })}
          style={{ width: '75px' }}
        />
        <TextField
          label="User"
          variant="outlined"
          value={query.userInfo}
          onChange={(e) => setQuery({ ...query, userInfo: e.target.value })}
          style={{ width: '75px' }}
        />
        
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </div>

      <div className="filter">
      <FormControl variant="outlined" style={{ width: '150px' }}>
          <InputLabel>Attack Type</InputLabel>
          <Select
            value={filters.attackType}
            onChange={(e) => setFilters({ ...filters, attackType: e.target.value })}
            label="Attack Type"
          >
            <MenuItem value=""><em>Select Attack Type</em></MenuItem>
            <MenuItem value="DDoS">DDoS</MenuItem>
            <MenuItem value="Phishing">Phishing</MenuItem>
            <MenuItem value="Malware">Malware</MenuItem>
          </Select>
        </FormControl>
        <FormControl variant="outlined" style={{ width: '150px' }}>
          <InputLabel>Severity</InputLabel>
          <Select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            label="Severity"
          >
            <MenuItem value=""><em>Select Severity</em></MenuItem>
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleFilter}>Filter</Button>
      </div>

      <Button variant="contained" color="secondary" onClick={handleDelete} disabled={selectedRows.length === 0}>
        Delete Selected
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              {['id', 'Timestamp', 'SourceIP', 'SourcePort', 'DestinationIP', 'DestinationPort', 'AttackType', 'AttackSignature', 'UserInfo', 'DeviceInfo', 'GeoLocation', 'Protocol', 'PacketLength', 'PacketType', 'TrafficType', 'Segment', 'AnomalyScores', 'ActionTaken', 'SeverityLevel', 'LogSource'].map((column) => (
                <TableCell key={column} sortDirection={sort.column === column ? sort.order : false}>
                  <TableSortLabel
                    active={sort.column === column}
                    direction={sort.column === column ? sort.order : 'asc'}
                    onClick={() => handleSort(column)}
                  >
                    {column}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id} selected={selectedRows.includes(item.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(item.id)}
                    onChange={() => handleSelectRow(item.id)}
                  />
                </TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.Timestamp}</TableCell>
                <TableCell>{item.SourceIP}</TableCell>
                <TableCell>{item.SourcePort}</TableCell>
                <TableCell>{item.DestinationIP}</TableCell>
                <TableCell>{item.DestinationPort}</TableCell>
                <TableCell>{item.AttackType}</TableCell>
                <TableCell>{item.AttackSignature}</TableCell>
                <TableCell>{item.UserInfo}</TableCell>
                <TableCell>{item.DeviceInfo}</TableCell>
                <TableCell>{item.GeoLocation}</TableCell>
                <TableCell>{item.Protocol}</TableCell>
                <TableCell>{item.PacketLength}</TableCell>
                <TableCell>{item.PacketType}</TableCell>
                <TableCell>{item.TrafficType}</TableCell>
                <TableCell>{item.Segment}</TableCell>
                <TableCell>{item.AnomalyScores}</TableCell>
                <TableCell>{item.ActionTaken}</TableCell>
                <TableCell>{item.SeverityLevel}</TableCell>
                <TableCell>{item.LogSource}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default App;

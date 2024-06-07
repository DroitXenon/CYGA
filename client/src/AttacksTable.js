import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Paper,
  TableSortLabel,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { OpenAI } from 'openai';

const AttacksTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    idFrom: '',
    idTo: '',
    severity: '',
    protocol: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5001/api/attacks')
      .then(response => {
        console.log('Data fetched:', response.data);
        setData(response.data);
        setFilteredData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
        setError(error);
      });
  }, []);

  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      const newSelectedRows = new Set(prev);
      if (newSelectedRows.has(id)) {
        newSelectedRows.delete(id);
      } else {
        newSelectedRows.add(id);
      }
      return newSelectedRows;
    });
  };

  const handleAction = async () => {
    const selectedData = data.filter(item => selectedRows.has(item.id));
    console.log('Selected rows data:', selectedData);

    const openai = new OpenAI({ apiKey: 'Replace with your own API key', dangerouslyAllowBrowser: true });

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a cybersecurity expert.',
          },
          {
            role: 'user',
            content: `Analyze the following attack data: ${JSON.stringify(selectedData)}`,
          },
        ],
      });

      const result = response.choices[0].message.content;
      setAnalysisResult(result);
      console.log('Analysis result:', result);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableData;
  }, [filteredData, sortConfig]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchQuery(value);
    applyFiltersAndSearch(value, filters);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    applyFiltersAndSearch(searchQuery, { ...filters, [name]: value });
  };

  const applyFiltersAndSearch = (searchValue, filterValues) => {
    let filtered = data;

    if (searchValue) {
      filtered = filtered.filter(item => 
        item.Timestamp.toLowerCase().includes(searchValue) ||
        item.SourceIP.toLowerCase().includes(searchValue) ||
        item.DestinationIP.toLowerCase().includes(searchValue) ||
        item.SourcePort.toString().includes(searchValue) ||
        item.DestinationPort.toString().includes(searchValue) ||
        item.AttackType.toLowerCase().includes(searchValue) ||
        item.AttackSignature.toLowerCase().includes(searchValue) ||
        item.ActionTaken.toLowerCase().includes(searchValue) ||
        item.SeverityLevel.toLowerCase().includes(searchValue) ||
        item.UserInfo.toLowerCase().includes(searchValue) ||
        item.DeviceInfo.toLowerCase().includes(searchValue) ||
        item.GeoLocation.toLowerCase().includes(searchValue) ||
        item.Protocol.toLowerCase().includes(searchValue) ||
        item.PacketLength.toString().includes(searchValue) ||
        item.PacketType.toLowerCase().includes(searchValue) ||
        item.TrafficType.toLowerCase().includes(searchValue) ||
        item.Segment.toLowerCase().includes(searchValue) ||
        item.AnomalyScores.toLowerCase().includes(searchValue) ||
        item.LogSource.toLowerCase().includes(searchValue)
      );
    }

    if (filterValues.severity) {
      filtered = filtered.filter(item => item.SeverityLevel.toLowerCase() === filterValues.severity.toLowerCase());
    }
    if (filterValues.attacktype) {
      filtered = filtered.filter(item => item.AttackType.toLowerCase() === filterValues.attacktype.toLowerCase());
    }

    setFilteredData(filtered);
  };

  return (
    <div>
      <h1>Cyber Geolocation Analysis</h1>
      <TextField 
        label="Search" 
        variant="outlined" 
        value={searchQuery} 
        onChange={handleSearch} 
        style={{ marginBottom: '20px', marginRight: '20px' }}
      />
      <FormControl variant="outlined" style={{ marginBottom: '20px', marginRight: '20px', width: '200px' }}>
        <InputLabel>AttackType</InputLabel>
        <Select
          name="AttackType"
          value={filters.AttackType}
          onChange={handleFilterChange}
          label="AttackType"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="malware">Malware</MenuItem>
          <MenuItem value="trojan">Trojan</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" style={{ marginBottom: '20px', marginRight: '20px', width: '200px' }}>
        <InputLabel>Severity</InputLabel>
        <Select
          name="severity"
          value={filters.severity}
          onChange={handleFilterChange}
          label="Severity"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>
      {error && <p>Error fetching data: {error.message}</p>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell sortDirection={sortConfig.key === 'id' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'id'}
                  direction={sortConfig.key === 'id' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'Timestamp' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'Timestamp'}
                  direction={sortConfig.key === 'Timestamp' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('Timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'SourceIP' ? sortConfig.direction
                  : false}>
                <TableSortLabel
                  active={sortConfig.key === 'SourceIP'}
                  direction={sortConfig.key === 'SourceIP' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('SourceIP')}
                >
                  Source IP
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'DestinationIP' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'DestinationIP'}
                  direction={sortConfig.key === 'DestinationIP' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('DestinationIP')}
                >
                  Destination IP
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'AttackType' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'AttackType'}
                  direction={sortConfig.key === 'AttackType' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('AttackType')}
                >
                  Attack Type
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'SeverityLevel' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'SeverityLevel'}
                  direction={sortConfig.key === 'SeverityLevel' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('SeverityLevel')}
                >
                  Severity
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'Protocol' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'Protocol'}
                  direction={sortConfig.key === 'Protocol' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('Protocol')}
                >
                  Protocol
                </TableSortLabel>
              </TableCell>
              <TableCell>Action Taken</TableCell>
              <TableCell>Anomaly Scores</TableCell>
              <TableCell>Packet Length</TableCell>
              <TableCell>Packet Type</TableCell>
              <TableCell>Traffic Type</TableCell>
              <TableCell>Segment</TableCell>
              <TableCell>User Info</TableCell>
              <TableCell>Device Info</TableCell>
              <TableCell>GeoLocation</TableCell>
              <TableCell>Log Source</TableCell>
              <TableCell>Attack Signature</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(item.id)}
                    onChange={() => handleRowSelect(item.id)}
                  />
                </TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.Timestamp}</TableCell>
                <TableCell>{item.SourceIP}</TableCell>
                <TableCell>{item.DestinationIP}</TableCell>
                <TableCell>{item.AttackType}</TableCell>
                <TableCell>{item.SeverityLevel}</TableCell>
                <TableCell>{item.Protocol}</TableCell>
                <TableCell>{item.ActionTaken}</TableCell>
                <TableCell>{item.AnomalyScores}</TableCell>
                <TableCell>{item.PacketLength}</TableCell>
                <TableCell>{item.PacketType}</TableCell>
                <TableCell>{item.TrafficType}</TableCell>
                <TableCell>{item.Segment}</TableCell>
                <TableCell>{item.UserInfo}</TableCell>
                <TableCell>{item.DeviceInfo}</TableCell>
                <TableCell>{item.GeoLocation}</TableCell>
                <TableCell>{item.LogSource}</TableCell>
                <TableCell>{item.AttackSignature}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" color="primary" onClick={handleAction}>
        Analysis
      </Button>
      {analysisResult && (
        <Box mt={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Analysis Result
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {analysisResult}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </div>
  );
};

export default AttacksTable;

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
  Box
} from '@mui/material';
import { OpenAI } from 'openai';

const AttacksTable = () => {
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5001/api/attacks')
      .then(response => {
        console.log('Data fetched:', response.data);
        setData(response.data);
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
    let sortableData = [...data];
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
  }, [data, sortConfig]);

  return (
    <div>
      <h1>Cybersecurity Attacks Data</h1>
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
              <TableCell sortDirection={sortConfig.key === 'SourceIP' ? sortConfig.direction : false}>
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

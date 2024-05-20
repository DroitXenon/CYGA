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

    const openai = new OpenAI({ apiKey: 'Replace with your own API key', dangerouslyAllowBrowser: true });;

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
              <TableCell sortDirection={sortConfig.key === 'timestamp' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'timestamp'}
                  direction={sortConfig.key === 'timestamp' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('timestamp')}
                >
                  Timestamp
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'source_ip' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'source_ip'}
                  direction={sortConfig.key === 'source_ip' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('source_ip')}
                >
                  Source IP
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'attack_type' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'attack_type'}
                  direction={sortConfig.key === 'attack_type' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('attack_type')}
                >
                  Attack Type
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'target' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'target'}
                  direction={sortConfig.key === 'target' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('target')}
                >
                  Target
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={sortConfig.key === 'severity' ? sortConfig.direction : false}>
                <TableSortLabel
                  active={sortConfig.key === 'severity'}
                  direction={sortConfig.key === 'severity' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('severity')}
                >
                  Severity
                </TableSortLabel>
              </TableCell>
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
                <TableCell>{item.timestamp}</TableCell>
                <TableCell>{item.source_ip}</TableCell>
                <TableCell>{item.attack_type}</TableCell>
                <TableCell>{item.target}</TableCell>
                <TableCell>{item.severity}</TableCell>
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

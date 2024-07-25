// This file is for R10: Network Feature

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

function NetworkPage() {
  const [protocolStats, setProtocolStats] = useState([]);
  const [trafficTypeStats, setTrafficTypeStats] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/network-stats')
      .then(response => response.json())
      .then(data => {
        setProtocolStats(data.protocolStats);
        setTrafficTypeStats(data.trafficTypeStats);
      })
      .catch(error => console.error('Error fetching network stats:', error));
  }, []);

  return (
    <Box className="network" sx={{ display: 'flex', flexDirection: 'row' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ mb: 3, flex: 1 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Protocols
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50%' }}>Protocol</TableCell>
                <TableCell sx={{ width: '50%' }}>Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {protocolStats.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ width: '50%' }}>{row.Protocol}</TableCell>
                  <TableCell sx={{ width: '50%' }}>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Paper sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Traffic Types
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '50%' }}>Traffic Type</TableCell>
                <TableCell sx={{ width: '50%' }}>Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trafficTypeStats.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ width: '50%' }}>{row.TrafficType}</TableCell>
                  <TableCell sx={{ width: '50%' }}>{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Box sx={{ flex: 1, ml: 3 }}>
        <Typography variant="h6" sx={{ p: 2 }}>
          Protocol Counts
        </Typography>
        <BarChart
          xAxis={[{ data: protocolStats.map(stat => stat.Protocol), scaleType: 'band' }]}
          series={[
            {
              data: protocolStats.map(stat => stat.count),
              label: 'Protocol Counts'
            }
          ]}
          height={300}
        />
        <Typography variant="h6" sx={{ p: 2 }}>
          Traffic Type Counts
        </Typography>
        <BarChart
          xAxis={[{ data: trafficTypeStats.map(stat => stat.TrafficType), scaleType: 'band' }]}
          series={[
            {
              data: trafficTypeStats.map(stat => stat.count),
              label: 'Traffic Type Counts'
            }
          ]}
          height={300}
        />
      </Box>
    </Box>
  );
}

export default NetworkPage;

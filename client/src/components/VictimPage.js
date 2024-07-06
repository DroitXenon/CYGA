import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';

function VictimPage() {
  const [deviceInfoStats, setDeviceInfoStats] = useState([]);
  const [geoLocationStats, setGeoLocationStats] = useState([]);
  const [victims, setVictims] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/victim-stats')
      .then(response => response.json())
      .then(data => {
        setDeviceInfoStats(data.deviceInfoStats);
        setGeoLocationStats(data.geoLocationStats);
      })
      .catch(error => console.error('Error fetching victim stats:', error));

    fetch('http://localhost:5001/api/victims')
      .then(response => response.json())
      .then(data => setVictims(data))
      .catch(error => console.error('Error fetching victims:', error));
  }, []);

  return (
    <Box className='victim' sx={{ flexDirection: 'row', height: 'calc(100vh - 160px)' }}>
      <Box sx={{ flex: 3, overflowY: 'auto', height: '100%' }}>
        <Paper>
          <Typography variant="h6" sx={{ p: 2 }}>
            Victim Details
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Victim ID</TableCell>
                <TableCell>Destination IP</TableCell>
                <TableCell>Destination Port</TableCell>
                <TableCell>Device Info</TableCell>
                <TableCell>Geo Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {victims.map((victim, index) => (
                <TableRow key={index}>
                  <TableCell>{victim.id}</TableCell>
                  <TableCell>{victim.DestinationIP}</TableCell>
                  <TableCell>{victim.DestinationPort}</TableCell>
                  <TableCell>{victim.DeviceInfo}</TableCell>
                  <TableCell>{victim.GeoLocation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Box sx={{ flex: 1, ml: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Paper sx={{ overflowY: 'auto', height: 'calc(50% - 16px)', width: '100%' }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Most Attacked Devices
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device Info</TableCell>
                {/* <TableCell>Count</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {deviceInfoStats.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.DeviceInfo}</TableCell>
                  {/* <TableCell>{row.count}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Paper sx={{ overflowY: 'auto', mt: 'auto', height: 'calc(50% - 16px)', width: '100%' }}>
          <Typography variant="h6" sx={{ p: 2 }}>
           Most Attacked Locations
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Geo Location</TableCell>
                {/* <TableCell>Count</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {geoLocationStats.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.GeoLocation}</TableCell>
                  {/* <TableCell>{row.count}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    </Box>
  );
}

export default VictimPage;

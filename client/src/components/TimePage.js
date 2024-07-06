import React, { useState, useEffect } from 'react';
import { Card, CardContent, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Paper, Grid } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LineChart } from '@mui/x-charts/LineChart';
import dayjs from 'dayjs';

function TimePage() {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [attackCounts, setAttackCounts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/attack-count')
      .then(response => response.json())
      .then(data => setAttackCounts(data))
      .catch(error => console.error('Error fetching attack counts over time:', error));
  }, []);

  const handleFetchIncidents = () => {
    fetch('http://localhost:5001/api/incidents-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: dayjs(startTime).format('YYYY/MM/DD HH:mm'), endTime: dayjs(endTime).format('YYYY/MM/DD HH:mm') })
    })
      .then(response => response.json())
      .then(data => setIncidents(data))
      .catch(error => console.error('Error fetching incidents by time:', error));
  };

  const years = attackCounts.map(item => item.year);
  const attackCountsData = attackCounts.map(item => item.attackCount);

  return (
    <Box className='time' sx={{ flexDirection: 'row', height: 'calc(100vh - 160px)' }}>
        <Box width={'50%'}>
            <LineChart
                grid={{ vertical: true, horizontal: true }}
                series={[
                {
                    data: attackCountsData,
                    label: 'Attack Counts',
                    // area: true
                }
                ]}
                xAxis={[{
                data: years,
                }]}
            />
        </Box>
        <Box width={'50%'}>
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                    sx={{ flex: 3}}
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    />
                    <DatePicker
                    sx={{ flex: 3,ml: 2}}
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
                <Button variant="outlined" color="primary" onClick={handleFetchIncidents} sx={{flex: 1, ml:2, height:'55px'}} >
                    Fetch
                </Button>
            </Box>
            <Card sx={{ overflowY: 'auto', height: '90%', mt: 2 }}>
                <Table>
                    <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Attack Type</TableCell>
                        <TableCell>Attack Signature</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {incidents.map((incident) => (
                        <TableRow key={incident.id}>
                        <TableCell>{incident.id}</TableCell>
                        <TableCell>{incident.Timestamp}</TableCell>
                        <TableCell>{incident.AttackType}</TableCell>
                        <TableCell>{incident.AttackSignature}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                   
            </Card>
        </Box>        
    </Box> 
  );
}

export default TimePage;
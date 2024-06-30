import React, { useState } from 'react';
import { Fab, Modal, Box, Typography, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import TransferList from './TransferList';
import CssBaseline from '@mui/material/CssBaseline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PersonIcon from '@mui/icons-material/Person';
import SkateboardingIcon from '@mui/icons-material/Skateboarding';
import PublicIcon from '@mui/icons-material/Public';
import BackHandIcon from '@mui/icons-material/BackHand';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(3),
  textAlign: 'left',
  color: theme.palette.text.primary,
}));

function IncidentDetails({ incident }) {
  const [analysisReport, setAnalysisReport] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewDataModalOpen, setIsViewDataModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [viewData, setViewData] = useState([]);

  const columnOptions = [
    'SourceIP', 'SourcePort', 'SourceLatitude', 'SourceLongitude',
    'DestinationIP', 'DestinationPort', 'DestinationLatitude', 'DestinationLongitude',
    'UserInfo', 'DeviceInfo', 'GeoLocation', 'Protocol', 'PacketLength', 'PacketType',
    'TrafficType', 'Segment', 'AnomalyScores', 'ActionTaken', 'SeverityLevel', 'LogSource'
  ];

  const handleAnalyze = () => {
    fetch(`http://localhost:5001/api/analysis/${incident.id}`)
      .then(response => response.json())
      .then(data => {
        setAnalysisReport(data);
        setIsAnalysisModalOpen(true);
      })
      .catch(error => console.error('Error fetching analysis report:', error));
  };

  const handleCreateView = () => {
    fetch(`http://localhost:5001/api/create-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns: selectedColumns })
    })
      .then(response => response.json())
      .then(data => {
        console.log('View created:', data);
        fetchViewData();
      })
      .catch(error => console.error('Error creating view:', error));
  };

  const fetchViewData = () => {
    fetch(`http://localhost:5001/api/view-data`)
      .then(response => response.json())
      .then(data => {
        setViewData(Array.isArray(data) ? data : []);
        setIsViewDataModalOpen(true);
      })
      .catch(error => console.error('Error fetching view data:', error));
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisReport(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  const handleCloseViewDataModal = () => {
    setIsViewDataModalOpen(false);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', height: '60vh' }}>
        <Typography variant="h4" align='center' sx={{ mt: 4, mb: 4 }}>Details</Typography>
        <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 2 }} sx={{ height: 'calc(100% - 64px)' }}>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <PersonIcon /><br />
              <Typography variant="h6">Attacker</Typography>
              Source IP: {incident.SourceIP}<br />
              Source Port: {incident.SourcePort}<br />
              Source Latitude: {incident.SourceLatitude}<br />
              Source Longitude: {incident.SourceLongitude}
            </Item>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <SkateboardingIcon /><br />
              <Typography variant="h6">Victim</Typography>
              Destination IP: {incident.DestinationIP}<br />
              Destination Port: {incident.DestinationPort}<br />
              User Information: {incident.UserInfo}<br />
              Geolocation: {incident.GeoLocation}
            </Item>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <PublicIcon /><br />
              <Typography variant="h6">Network Traffic</Typography>
              Protocol: {incident.Protocol}<br />
              Packet Length: {incident.PacketLength}<br />
              Packet Type: {incident.PacketType}<br />
              Traffic Type: {incident.TrafficType}<br />
              Segment: {incident.Segment}
            </Item>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <BackHandIcon /><br />
              <Typography variant="h6">Response</Typography>
              Anomaly Scores: {incident.AnomalyScores}<br />
              Action Taken: {incident.ActionTaken}<br />
              Severity Level: {incident.SeverityLevel}<br />
              Log Source: {incident.LogSource}
            </Item>
          </Grid>
        </Grid>
        <Box sx={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', flexGrow: 1 }}>
          <Fab color="primary" aria-label="view" size='medium' onClick={() => setIsViewModalOpen(true)}>
            <VisibilityIcon />
          </Fab>
          <Fab color="secondary" aria-label="edit" size='medium' sx={{ ml: 1 }}>
            <EditIcon />
          </Fab>
          <Fab variant="extended" onClick={handleAnalyze} sx={{ ml: 1 }}>
            <AnalyticsIcon sx={{ mr: 1 }} />
            Analysis
          </Fab>
        </Box>
        <Modal open={isAnalysisModalOpen} onClose={handleCloseAnalysisModal} align='center'>
          <Box
            sx={{
              p: 3,
              mx: 'auto',
              mt: '20vh',
              maxWidth: 500,
              maxHeight: '80vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5">
              Report
            </Typography>
            {analysisReport ? (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body1" align='left'>{analysisReport.report}</Typography>
              </Paper>
            ) : (
              <Typography variant="body1" align='left'>Loading analysis report...</Typography>
            )}
            <Button variant="outlined" color="primary" onClick={handleCloseAnalysisModal} sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Modal>
        <Modal open={isViewModalOpen} onClose={handleCloseViewModal} align='center'>
          <Box
            sx={{
              p: 3,
              mx: 'auto',
              mt: '20vh',
              maxWidth: 500,
              maxHeight: '80vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5">
              Select Columns for View
            </Typography>
            <TransferList
              options={columnOptions}
              selectedOptions={selectedColumns}
              setSelectedOptions={setSelectedColumns}
            />
            <Button variant="contained" color="primary" onClick={handleCreateView} sx={{ mt: 2 }}>
              Create View
            </Button>
          </Box>
        </Modal>
        <Modal open={isViewDataModalOpen} onClose={handleCloseViewDataModal} align='center'>
          <Box
            sx={{
              p: 3,
              mx: 'auto',
              mt: '20vh',
              maxWidth: 800,
              maxHeight: '80vh',
              overflow: 'auto',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
            }}
          >
            <Typography variant="h5">
              View Data
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {selectedColumns.map((column) => (
                      <TableCell key={column}>{column}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {viewData.map((row, index) => (
                    <TableRow key={index}>
                      {selectedColumns.map((column) => (
                        <TableCell key={column}>{row[column]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <Button variant="outlined" color="primary" onClick={handleCloseViewDataModal} sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}

export default IncidentDetails;

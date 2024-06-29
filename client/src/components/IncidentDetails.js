import React, { useState } from 'react';
import { SpeedDial, SpeedDialIcon, SpeedDialAction,  Button, Box, Typography, Modal, Paper } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function IncidentDetails({ incident }) {
  const [analysisReport, setAnalysisReport] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const handleAnalyze = () => {
    fetch(`http://localhost:5001/api/analysis/${incident.id}`)
      .then(response => response.json())
      .then(data => {
        setAnalysisReport(data);
        setIsAnalysisModalOpen(true);
      })
      .catch(error => console.error('Error fetching analysis report:', error));
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setAnalysisReport(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ textAlign: 'center'}}>
        {/* <Typography variant="h5" sx={{ mt: 2 }}>Details</Typography> */}
        <Box className="incident-details" sx={{ textAlign: 'left', mt: 2}}>
          <Box>
            <Typography variant="h6">Attacker</Typography>
            <Typography>Source IP: {incident.SourceIP}</Typography>
            <Typography>Source Port: {incident.SourcePort}</Typography>
            <Typography>Source Latitude: {incident.SourceLatitude}</Typography>
            <Typography>Source Longitude: {incident.SourceLongitude} </Typography>
          </Box>
          <Box>
            <Typography variant="h6">Victim</Typography>
            <Typography>Target IP: {incident.DestinationIP}</Typography>
            <Typography>Target Port: {incident.DestinationPort}</Typography>
            <Typography>User Information: {incident.UserInfo}</Typography>
            <Typography>Geolocation: {incident.GeoLocation}</Typography>
          </Box>
          <Box>
            <Typography variant="h6">Network Traffic</Typography>
            <Typography>Protocol: {incident.Protocol}</Typography>
            <Typography>Packet Length: {incident.PacketLength}</Typography>
            <Typography>Packet Type: {incident.PacketType}</Typography>
            <Typography>Traffic Type: {incident.TrafficType}</Typography>
            <Typography>Segment: {incident.Segment}</Typography>
          </Box>
          <Box>
            <Typography variant="h6">Response</Typography>
            <Typography>Anomaly Scores: {incident.AnomalyScores}</Typography>
            <Typography>Action Taken: {incident.ActionTaken}</Typography>
            <Typography>Severity Level: {incident.SeverityLevel}</Typography>
            <Typography>Log Source: {incident.LogSource}</Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <SpeedDial
            ariaLabel="SpeedDial"
            sx={{ position: 'absolute', bottom: 10, right: 10 }}
            icon={<SpeedDialIcon />}
            FabProps={{ color: 'outline' }}
          >
            <SpeedDialAction
              icon={<AnalyticsIcon />}
              tooltipTitle="Analysis"
              onClick={handleAnalyze}
            />
          </SpeedDial>
        </Box>
        

        <Modal open={isAnalysisModalOpen} onClose={handleCloseAnalysisModal}>
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
              Report
            </Typography>
            {analysisReport ? (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body1">{analysisReport.report}</Typography>
              </Paper>
            ) : (
              <Typography variant="body1">Loading analysis report...</Typography>
            )}
            <Button variant="contained" color="primary" onClick={handleCloseAnalysisModal} sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
}

export default IncidentDetails;

import React, { useState } from 'react';
import { Fab, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Box, Typography, Modal, Paper, Icon } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import PersonIcon from '@mui/icons-material/Person';
import SkateboardingIcon from '@mui/icons-material/Skateboarding';
import PublicIcon from '@mui/icons-material/Public';
import BackHandIcon from '@mui/icons-material/BackHand';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(3),
    textAlign: 'left',
    color: theme.palette.text.primary,
  }));

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ width: '100%', height: '60vh' }}>
        <Typography variant="h4" align='center' sx={{ mt: 4, mb: 4 }}>Details</Typography>
        <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 2 }} sx={{ height: 'calc(100% - 64px)' }}>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <Icon component={SkateboardingIcon} /><br />
              <Typography variant="h6">Attacker</Typography>
              Source IP: {incident.SourceIP}<br />
              Source Port: {incident.SourcePort}<br />
              Source Latitude: {incident.DestinationLatitude}<br />
              Source Longitude: {incident.DestinationLongitude}
            </Item>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <Icon component={PersonIcon} /><br />
              <Typography variant="h6">Victim</Typography>
              Target IP: {incident.DestinationIP}<br />
              Target Port: {incident.DestinationPort}<br />
              User Information: {incident.UserInfo}<br />
              Geolocation: {incident.GeoLocation}<br />
            </Item>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <Icon component={PublicIcon} /><br />
              <Typography variant="h6">Network Traffic</Typography>
              Protocol: {incident.Protocol}<br />
              Packet Length: {incident.PacketLength}<br />
              Packet Type: {incident.PacketType}<br />
              Traffic Type: {incident.TrafficType}<br />
              Segment: {incident.Segment}<br />
            </Item>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex' }}>
            <Item sx={{ flex: 1 }}>
              <Icon component={BackHandIcon} /><br />
              <Typography variant="h6">Response</Typography>
              Anomaly Scores: {incident.AnomalyScores}<br />
              Action Taken: {incident.ActionTaken}<br />
              Severity Level: {incident.SeverityLevel}<br />
              Log Source: {incident.LogSource}<br />
            </Item>
          </Grid>
        </Grid>
        <Box sx={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', flexGrow: 1 }}>
          <Fab color="primary" aria-label="add" size='medium'>
            <VisibilityIcon />
          </Fab>
          <Fab variant="extended" onClick={handleAnalyze} sx={{ ml: 2 }}>
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
      </Box>
    </ThemeProvider>
  );
}

export default IncidentDetails;
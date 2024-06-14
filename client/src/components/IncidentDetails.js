import React, { useState } from 'react';
import { Button, Box, Typography, Modal, Paper } from '@mui/material';

function IncidentDetails({ incident }) {
  const [analysisReport, setAnalysisReport] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const handleAnalyze = () => {
    fetch(`http://localhost:5001/api/incident/${incident.id}/analysis`)
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
    <div className="incident-details">
      <div>
        <h3>Attacker</h3>
        <p>Source IP: {incident.SourceIP}</p>
        <p>Source Port: {incident.SourcePort}</p>
      </div>
      <div>
        <h3>Victim</h3>
        <p>Target IP: {incident.DestinationIP}</p>
        <p>Target Port: {incident.DestinationPort}</p>
        <p>User Information: {incident.UserInfo}</p>
        <p>Geolocation: {incident.GeoLocation}</p>
      </div>
      <div>
        <h3>Network Traffic</h3>
        <p>Protocol: {incident.Protocol}</p>
        <p>Packet Length: {incident.PacketLength}</p>
        <p>Packet Type: {incident.PacketType}</p>
        <p>Traffic Type: {incident.TrafficType}</p>
        <p>Segment: {incident.Segment}</p>
      </div>
      <div>
        <h3>Response</h3>
        <p>Anomaly Scores: {incident.AnomalyScores}</p>
        <p>Action Taken: {incident.ActionTaken}</p>
        <p>Severity Level: {incident.SeverityLevel}</p>
        <p>Log Source: {incident.LogSource}</p>
      </div>
      <Button variant="contained" color="primary" onClick={handleAnalyze} sx={{ mt: 2 }}>
        Analysis
      </Button>

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
    </div>
  );
}

export default IncidentDetails;

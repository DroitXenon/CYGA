import React from 'react';

function IncidentDetails({ incident }) {
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
    </div>
  );
}

export default IncidentDetails;

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
    </div>
  );
}

export default IncidentDetails;

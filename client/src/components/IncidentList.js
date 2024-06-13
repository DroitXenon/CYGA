import React from 'react';

function IncidentList({ incidents, onIncidentClick }) {
  return (
    <ul className="incident-list">
      {incidents.map(incident => (
        <li key={incident.id} onClick={() => onIncidentClick(incident)}>
          Incident ID: {incident.id}, Attack Type: {incident.AttackType}
        </li>
      ))}
    </ul>
  );
}

export default IncidentList;

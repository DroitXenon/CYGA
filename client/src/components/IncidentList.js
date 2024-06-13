import React from 'react';

function IncidentList({ incidents, onIncidentClick }) {
  return (
    <table className="incident-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Attack Type</th>
          <th>Attack Signature</th>
        </tr>
      </thead>
      <tbody>
        {incidents.map(incident => (
          <tr key={incident.id} onClick={() => onIncidentClick(incident)}>
            <td>{incident.Timestamp}</td>
            <td>{incident.AttackType}</td>
            <td>{incident.AttackSignature}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default IncidentList;

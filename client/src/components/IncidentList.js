import React, { useState } from 'react';

function IncidentList({ incidents, onIncidentClick, onSort }) {
  const [sortColumn, setSortColumn] = useState('Timestamp');
  const [sortOrder, setSortOrder] = useState('ASC');

  const handleSort = (column) => {
    const order = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(column);
    setSortOrder(order);
    onSort(column, order);
  };

  return (
    <table className="incident-table">
      <thead>
        <tr>
          <th onClick={() => handleSort('Timestamp')}>Timestamp</th>
          <th onClick={() => handleSort('AttackType')}>Attack Type</th>
          <th onClick={() => handleSort('AttackSignature')}>Attack Signature</th>
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

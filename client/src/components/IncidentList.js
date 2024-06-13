import React, { useState } from 'react';

function IncidentList({ incidents, onIncidentClick, onSort, fetchIncidents }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents(searchQuery);
  };

  const handleSort = (column) => {
    const order = 'ASC';  // Default to ascending order, you can add logic to toggle order here
    onSort(column, order);
  };

  return (
    <div>
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search incidents..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button type="submit">Search</button>
      </form>
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
    </div>
  );
}

export default IncidentList;

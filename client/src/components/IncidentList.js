import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper, TableSortLabel, Checkbox } from '@mui/material';

function IncidentList({ incidents, onIncidentClick, onSort, onSelectIncident, selectedIncidentIds }) {
  const [sortColumn, setSortColumn] = useState('Timestamp');
  const [sortOrder, setSortOrder] = useState('ASC');

  const handleSort = (column) => {
    const order = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortColumn(column);
    setSortOrder(order);
    onSort(column, order);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortColumn === 'Timestamp'}
                direction={sortOrder.toLowerCase()}
                onClick={() => handleSort('Timestamp')}
              >
                Timestamp
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortColumn === 'AttackType'}
                direction={sortOrder.toLowerCase()}
                onClick={() => handleSort('AttackType')}
              >
                Attack Type
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortColumn === 'AttackSignature'}
                direction={sortOrder.toLowerCase()}
                onClick={() => handleSort('AttackSignature')}
              >
                Attack Signature
              </TableSortLabel>
            </TableCell>
            <TableCell>Select</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(incidents) && incidents.length > 0 ? (
            incidents.map((incident) => (
              <TableRow key={incident.id} hover>
                <TableCell onClick={() => onIncidentClick(incident)}>{incident.Timestamp}</TableCell>
                <TableCell onClick={() => onIncidentClick(incident)}>{incident.AttackType}</TableCell>
                <TableCell onClick={() => onIncidentClick(incident)}>{incident.AttackSignature}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={selectedIncidentIds.includes(incident.id)}
                    onChange={() => onSelectIncident(incident.id)}
                    inputProps={{ 'aria-label': 'Select incident' }}
                  />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>No incidents found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default IncidentList;

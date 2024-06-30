require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
// const openai = require('openai');

const app = express();
const port = 5001;
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

let db;

async function initializeDatabase() {
  db = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
  });

  await db.query('CREATE DATABASE IF NOT EXISTS cyga;');
  await db.query('USE cyga;');

  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS attacker (
      id INT AUTO_INCREMENT PRIMARY KEY,
      SourceIP VARCHAR(255),
      SourcePort INT,
      SourceLatitude VARCHAR(255),
      SourceLongitude VARCHAR(255)
    );`,
    `CREATE TABLE IF NOT EXISTS victim (
      id INT AUTO_INCREMENT PRIMARY KEY,
      DestinationIP VARCHAR(255),
      DestinationPort INT,
      DestinationLatitude VARCHAR(255),
      DestinationLongitude VARCHAR(255),
      UserInfo VARCHAR(255),
      DeviceInfo VARCHAR(255),
      GeoLocation VARCHAR(255),
      attackerId INT,
      FOREIGN KEY (attackerId) REFERENCES attacker(id)
    );`,
    `CREATE TABLE IF NOT EXISTS network_traffic (
      id INT AUTO_INCREMENT PRIMARY KEY,
      Protocol VARCHAR(255),
      PacketLength INT,
      PacketType VARCHAR(255),
      TrafficType VARCHAR(255),
      Segment VARCHAR(255),
      victimId INT,
      FOREIGN KEY (victimId) REFERENCES victim(id)
    );`,
    `CREATE TABLE IF NOT EXISTS response (
      id INT AUTO_INCREMENT PRIMARY KEY,
      AnomalyScores VARCHAR(255),
      ActionTaken VARCHAR(255),
      SeverityLevel VARCHAR(255),
      LogSource VARCHAR(255),
      networkTrafficId INT,
      FOREIGN KEY (networkTrafficId) REFERENCES network_traffic(id)
    );`,
    `CREATE TABLE IF NOT EXISTS incident (
      id INT AUTO_INCREMENT PRIMARY KEY,
      AttackType VARCHAR(255),
      Timestamp VARCHAR(255),
      AttackSignature VARCHAR(255),
      responseId INT,
      FOREIGN KEY (responseId) REFERENCES response(id)
    );`
  ];

  for (const query of tableQueries) {
    await db.execute(query);
  }

  console.log('Database initialized and tables created.');
  importCSV();
}

async function importCSV() {
  const filePath = path.join(__dirname, '../shared/constants/updated_sample_data.csv');
  const csvData = [];

  fs.createReadStream(filePath).pipe(csv()).on('data', (row) => {
    const attackerRow = [
      row['Source IP Address'], 
      row['Source Port'],
      row['Source Latitude'],
      row['Source Longitude']
    ];
    const victimRow = [
      row['Destination IP Address'],
      row['Destination Port'],
      row['Destination Latitude'],
      row['Destination Longitude'],
      row['User Information'],
      row['Device Information'],
      row['Geo-location Data']
    ];
    const networkTrafficRow = [
      row['Protocol'],
      row['Packet Length'],
      row['Packet Type'],
      row['Traffic Type'],
      row['Network Segment']
    ];
    const responseRow = [
      row['Anomaly Scores'],
      row['Action Taken'],
      row['Severity Level'],
      row['Log Source']
    ];
    const incidentRow = [
      row['Attack Type'],
      row['Timestamp'],
      row['Attack Signature']
    ];
    csvData.push({ attackerRow, victimRow, networkTrafficRow, responseRow, incidentRow });
  }).on('end', async () => {
    if (csvData.length > 0) {
      await db.beginTransaction();

      const attackerIds = await bulkInsert('attacker', ['SourceIP', 'SourcePort', 'SourceLatitude', 'SourceLongitude'], csvData.map(row => row.attackerRow));
      const victimIds = await bulkInsert('victim', ['DestinationIP', 'DestinationPort', 'DestinationLatitude', 'DestinationLongitude', 'UserInfo', 'DeviceInfo', 'GeoLocation', 'attackerId'], csvData.map((row, index) => [...row.victimRow, attackerIds[index]]));
      const networkTrafficIds = await bulkInsert('network_traffic', ['Protocol', 'PacketLength', 'PacketType', 'TrafficType', 'Segment', 'victimId'], csvData.map((row, index) => [...row.networkTrafficRow, victimIds[index]]));
      const responseIds = await bulkInsert('response', ['AnomalyScores', 'ActionTaken', 'SeverityLevel', 'LogSource', 'networkTrafficId'], csvData.map((row, index) => [...row.responseRow, networkTrafficIds[index]]));
      await bulkInsert('incident', ['AttackType', 'Timestamp', 'AttackSignature', 'responseId'], csvData.map((row, index) => [...row.incidentRow, responseIds[index]]));
      await db.commit();
      console.log('CSV imported.');
    } else {
      console.log('No valid data.');
    }
  });
}

async function bulkInsert(table, columns, rows) {
  const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ?`;
  const [result] = await db.query(query, [rows]);
  const ids = Array.from({ length: rows.length }, (_, i) => result.insertId + i);
  return ids;
}

initializeDatabase();

// Base query
const baseQuery = `
  SELECT *
  FROM incident i
  JOIN response r ON i.responseId = r.id
  JOIN network_traffic n ON r.networkTrafficId = n.id
  JOIN victim v ON n.victimId = v.id
  JOIN attacker a ON v.attackerId = a.id
`;

app.get('/api/incidents', async (req, res) => {
  const [results] = await db.query(baseQuery);
  res.json(results);
});

app.get('/api/search', async (req, res) => {
  const { keyword } = req.query;
  const searchQuery = `
    ${baseQuery}
    WHERE i.AttackType LIKE ? OR i.AttackSignature LIKE ? OR i.Timestamp LIKE ?
  `;
  const searchValue = `%${keyword}%`;
  const [results] = await db.query(searchQuery, [searchValue, searchValue, searchValue]);
  res.json(results);
});

app.get('/api/sort', async (req, res) => {
  const { column, order } = req.query;
  const query = `${baseQuery} ORDER BY ?? ${order}`;
  const [results] = await db.query(query, [column]);
  res.json(results);
});

// openai.apiKey = process.env.OPENAI_API_KEY; 

app.get('/api/analysis/:id', async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT *,
      CASE
        WHEN n.PacketLength < 500 THEN 'Low'
        WHEN n.PacketLength BETWEEN 500 AND 1000 THEN 'Medium'
        ELSE 'High'
      END AS ReportLevel
    FROM incident i
    JOIN response r ON i.responseId = r.id
    JOIN network_traffic n ON r.networkTrafficId = n.id
    JOIN victim v ON n.victimId = v.id
    JOIN attacker a ON v.attackerId = a.id
    WHERE i.id = ?
  `;
  const [results] = await db.query(query, [id]);
  const incident = results[0];
  const reportLevel = incident.ReportLevel;

  let reportStatement;
  switch (reportLevel) {
    case 'Low':
      reportStatement = `has a low severity level based on the network traffic packet length. It is recommended to review the traffic and ensure no unusual patterns are ignored.`;
      break;
    case 'Medium':
      reportStatement = `has a medium severity level based on the network traffic packet length. Further investigation is required to determine if there is any malicious activity.`;
      break;
    case 'High':
      reportStatement = `has a high severity level based on the network traffic packet length. Immediate action is required to mitigate potential threats and protect the network.`;
      break;
    default:
      reportStatement = `'s severity level of the incident could not be determined. Please review the incident manually.`;
  }

  const report = {
    report: `Incident ID: ${id} ${reportStatement}`
  };

  res.json(report);
});


app.delete('/api/delete/:id', async (req, res) => {
  const { id } = req.params;
  const deleteQuery = `
    DELETE i, r, n, v, a
    FROM incident i
    JOIN response r ON i.responseId = r.id
    JOIN network_traffic n ON r.networkTrafficId = n.id
    JOIN victim v ON n.victimId = v.id
    JOIN attacker a ON v.attackerId = a.id
    WHERE i.id = ?
  `;
  await db.query(deleteQuery, [id]);
  res.json({ message: 'Record deleted.' });
});

app.post('/api/add', async (req, res) => {
  const {
    SourceIP, SourcePort, SourceLatitude, SourceLongitude,
    DestinationIP, DestinationPort, DestinationLatitude, DestinationLongitude, UserInfo, DeviceInfo, GeoLocation,
    Protocol, PacketLength, PacketType, TrafficType, Segment,
    AnomalyScores, ActionTaken, SeverityLevel, LogSource,
    AttackType, Timestamp, AttackSignature
  } = req.body;

  await db.beginTransaction();

  const insertAttackerQuery = 'INSERT INTO attacker (SourceIP, SourcePort, SourceLatitude, SourceLongitude) VALUES (?, ?, ?, ?)';
  const [attackerResult] = await db.query(insertAttackerQuery, [SourceIP, SourcePort, SourceLatitude, SourceLongitude]);
  const attackerId = attackerResult.insertId;

  const insertVictimQuery = 'INSERT INTO victim (DestinationIP, DestinationPort, DestinationLatitude, DestinationLongitude, UserInfo, DeviceInfo, GeoLocation, attackerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const [victimResult] = await db.query(insertVictimQuery, [DestinationIP, DestinationPort, DestinationLatitude, DestinationLongitude, UserInfo, DeviceInfo, GeoLocation, attackerId]);
  const victimId = victimResult.insertId;

  const insertNetworkTrafficQuery = 'INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment, victimId) VALUES (?, ?, ?, ?, ?, ?)';
  const [networkTrafficResult] = await db.query(insertNetworkTrafficQuery, [Protocol, PacketLength, PacketType, TrafficType, Segment, victimId]);
  const networkTrafficId = networkTrafficResult.insertId;

  const insertResponseQuery = 'INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId) VALUES (?, ?, ?, ?, ?)';
  const [responseResult] = await db.query(insertResponseQuery, [AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId]);
  const responseId = responseResult.insertId;

  const insertIncidentQuery = 'INSERT INTO incident (AttackType, Timestamp, AttackSignature, responseId) VALUES (?, ?, ?, ?)';
  await db.query(insertIncidentQuery, [AttackType, Timestamp, AttackSignature, responseId]);

  await db.commit();
  res.json({ message: 'Record added.' });
});

app.post('/api/create-view', async (req, res) => {
  const { columns } = req.body;

  if (!columns || columns.length === 0) {
    return res.status(400).json({ error: 'No columns specified' });
  }

  const columnList = ['v.id', ...columns].join(', ');
  const query = `
    CREATE VIEW view_table AS
    SELECT ${columnList}
    FROM incident i
    JOIN response r ON i.responseId = r.id
    JOIN network_traffic n ON r.networkTrafficId = n.id
    JOIN victim v ON n.victimId = v.id
    JOIN attacker a ON v.attackerId = a.id;
  `;

  await db.query('DROP VIEW IF EXISTS view_table;');
  await db.query(query);
  console.log('View Table created.');
  res.json({ message: 'View Table created.' });
});

app.get('/api/view-data', async (req, res) => {
  const [results] = await db.query('SELECT * FROM view_table');
  res.json(results);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

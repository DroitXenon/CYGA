require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const openai = require('openai');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
};

let db;

async function initializeDatabase() {
  try {
    db = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await db.query('CREATE DATABASE IF NOT EXISTS web_traffic');
    await db.query('USE web_traffic');

    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS attacker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        SourceIP VARCHAR(255),
        SourcePort INT
      );`,
      `CREATE TABLE IF NOT EXISTS victim (
        id INT AUTO_INCREMENT PRIMARY KEY,
        DestinationIP VARCHAR(255),
        DestinationPort INT,
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

    console.log('Database initialized and tables created...');
    importCSV();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function importCSV() {
  try {
    const filePath = path.join(__dirname, '../shared/constants/sample_data.csv');
    const csvData = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const attackerRow = [row['Source IP Address'], row['Source Port']];
        const victimRow = [
          row['Destination IP Address'],
          row['Destination Port'],
          row['User Information'],
          row['Device Information'],
          row['Geo-location Data']
        ];
        const networkTrafficRow = [
          row.Protocol,
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
          row.Timestamp,
          row['Attack Signature']
        ];
        csvData.push({ attackerRow, victimRow, networkTrafficRow, responseRow, incidentRow });
      })
      .on('end', async () => {
        console.log('CSV data:', csvData);
        if (csvData.length > 0) {
          try {
            await db.beginTransaction();

            const attackerIds = await bulkInsert('attacker', ['SourceIP', 'SourcePort'], csvData.map(row => row.attackerRow));
            const victimIds = await bulkInsert('victim', ['DestinationIP', 'DestinationPort', 'UserInfo', 'DeviceInfo', 'GeoLocation', 'attackerId'], csvData.map((row, index) => [...row.victimRow, attackerIds[index]]));
            const networkTrafficIds = await bulkInsert('network_traffic', ['Protocol', 'PacketLength', 'PacketType', 'TrafficType', 'Segment', 'victimId'], csvData.map((row, index) => [...row.networkTrafficRow, victimIds[index]]));
            const responseIds = await bulkInsert('response', ['AnomalyScores', 'ActionTaken', 'SeverityLevel', 'LogSource', 'networkTrafficId'], csvData.map((row, index) => [...row.responseRow, networkTrafficIds[index]]));
            await bulkInsert('incident', ['AttackType', 'Timestamp', 'AttackSignature', 'responseId'], csvData.map((row, index) => [...row.incidentRow, responseIds[index]]));

            await db.commit();
            console.log('CSV data imported...');
          } catch (err) {
            await db.rollback();
            console.error('Error importing CSV data:', err);
          }
        } else {
          console.log('No valid data to import.');
        }
      });
  } catch (err) {
    console.error('Error importing CSV:', err);
  }
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
  SELECT i.*, r.*, n.*, v.*, a.*
  FROM incident i
  JOIN response r ON i.responseId = r.id
  JOIN network_traffic n ON r.networkTrafficId = n.id
  JOIN victim v ON n.victimId = v.id
  JOIN attacker a ON v.attackerId = a.id
`;

app.get('/api/incidents', async (req, res) => {
  try {
    const [results] = await db.query(baseQuery);
    res.json(results);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  try {
    const searchQuery = `
      ${baseQuery}
      WHERE i.AttackType LIKE ? OR i.AttackSignature LIKE ? OR i.Timestamp LIKE ?
    `;
    const searchValue = `%${keyword}%`;
    console.log('Search keyword:', keyword);
    const [results] = await db.query(searchQuery, [searchValue, searchValue, searchValue]);
    console.log('Search results:', results);
    res.json(results);
  } catch (err) {
    console.error('Error searching incidents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sort', async (req, res) => {
  const { column, order } = req.query;
  const validColumns = ['Timestamp', 'AttackType', 'AttackSignature'];
  const validOrder = ['ASC', 'DESC'];

  if (!validColumns.includes(column) || !validOrder.includes(order)) {
    return res.status(400).json({ error: 'Invalid sort parameters' });
  }

  try {
    const query = `${baseQuery} ORDER BY ?? ${order}`;
    const [results] = await db.query(query, [column]);
    res.json(results);
  } catch (err) {
    console.error('Error sorting incidents:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/incident/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `${baseQuery} WHERE i.id = ?`;
    const [results] = await db.query(query, [id]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching incident:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/incident/:id/analysis', async (req, res) => {
  const { id } = req.params;

  const report = {
    report: `Report for Incident ID: ${id}, The incident underscores the need for robust intrusion detection systems, regular security assessments, and employee training to mitigate and respond to such threats effectively.`
  };
  
  res.json(report);

  openai.apiKey = process.env.OPENAI_API_KEY;

  // Fetch incident details from the database
  db.query(`${baseQuery} WHERE i.id = ?`, [id], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    const incident = results[0];

    // Create a prompt for the OpenAI API
    const prompt = `
      Analyze the following incident data and generate a detailed cyberattack report:
      
      Attacker:
      - Source IP: ${incident.SourceIP}
      - Source Port: ${incident.SourcePort}
      
      Victim:
      - Target IP: ${incident.DestinationIP}
      - Target Port: ${incident.DestinationPort}
      - User Information: ${incident.UserInfo}
      - Geolocation: ${incident.GeoLocation}
      
      Network Traffic:
      - Protocol: ${incident.Protocol}
      - Packet Length: ${incident.PacketLength}
      - Packet Type: ${incident.PacketType}
      - Traffic Type: ${incident.TrafficType}
      - Segment: ${incident.Segment}
      
      Response:
      - Anomaly Scores: ${incident.AnomalyScores}
      - Action Taken: ${incident.ActionTaken}
      - Severity Level: ${incident.SeverityLevel}
      - Log Source: ${incident.LogSource}
      
      Provide a comprehensive analysis of the network traffic and response data, and offer insights into the nature of the attack and recommended mitigation steps.
    `;

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a cybersecurity analyst." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const report = response.choices[0].text.trim();

      res.json({ report });
    } catch (error) {
      console.error('Error generating analysis report:', error);
      res.status(500).json({ error: 'Error generating analysis report' });
    }
  });
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
  try {
    await db.query(deleteQuery, [id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/add', async (req, res) => {
  const {
    SourceIP, SourcePort,
    DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation,
    Protocol, PacketLength, PacketType, TrafficType, Segment,
    AnomalyScores, ActionTaken, SeverityLevel, LogSource,
    AttackType, Timestamp, AttackSignature
  } = req.body;

  try {
    await db.beginTransaction();

    const insertAttackerQuery = 'INSERT INTO attacker (SourceIP, SourcePort) VALUES (?, ?)';
    const [attackerResult] = await db.query(insertAttackerQuery, [SourceIP, SourcePort]);
    const attackerId = attackerResult.insertId;

    const insertVictimQuery = 'INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId) VALUES (?, ?, ?, ?, ?, ?)';
    const [victimResult] = await db.query(insertVictimQuery, [DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId]);
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
    res.json({ message: 'Record added successfully' });
  } catch (err) {
    await db.rollback();
    console.error('Error adding record:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

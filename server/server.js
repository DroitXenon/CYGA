const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'web_traffic'
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

db.query('CREATE DATABASE IF NOT EXISTS web_traffic', (err) => {
  if (err) throw err;
  console.log('Database created or already exists...');

  db.query('USE web_traffic', (err) => {
    if (err) throw err;

    const createAttackerTableQuery = `
      CREATE TABLE IF NOT EXISTS attacker (
        id INT AUTO_INCREMENT PRIMARY KEY,
        SourceIP VARCHAR(255),
        SourcePort INT
      );
    `;

    const createVictimTableQuery = `
      CREATE TABLE IF NOT EXISTS victim (
        id INT AUTO_INCREMENT PRIMARY KEY,
        DestinationIP VARCHAR(255),
        DestinationPort INT,
        UserInfo VARCHAR(255),
        DeviceInfo VARCHAR(255),
        GeoLocation VARCHAR(255)
      );
    `;

    const createNetworkTrafficTableQuery = `
      CREATE TABLE IF NOT EXISTS network_traffic (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Protocol VARCHAR(255),
        PacketLength INT,
        PacketType VARCHAR(255),
        TrafficType VARCHAR(255),
        Segment VARCHAR(255)
      );
    `;

    const createResponseTableQuery = `
      CREATE TABLE IF NOT EXISTS response (
        id INT AUTO_INCREMENT PRIMARY KEY,
        AnomalyScores VARCHAR(255),
        ActionTaken VARCHAR(255),
        SeverityLevel VARCHAR(255),
        LogSource VARCHAR(255)
      );
    `;

    const createAttackTableQuery = `
      CREATE TABLE IF NOT EXISTS attack (
        id INT AUTO_INCREMENT PRIMARY KEY,
        AttackType VARCHAR(255),
        Timestamp VARCHAR(255),
        AttackSignature VARCHAR(255)
      );
    `;

    // Execute table creation queries
    db.query(createAttackerTableQuery, (err, result) => {
      if (err) throw err;
      console.log('Attacker table created or already exists...');
      
      db.query(createVictimTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Victim table created or already exists...');
        
        db.query(createNetworkTrafficTableQuery, (err, result) => {
          if (err) throw err;
          console.log('Network Traffic table created or already exists...');
          
          db.query(createResponseTableQuery, (err, result) => {
            if (err) throw err;
            console.log('Response table created or already exists...');
            
            db.query(createAttackTableQuery, (err, result) => {
              if (err) throw err;
              console.log('Attack table created or already exists...');

              const importCSV = () => {
                const filePath = path.join(__dirname, '../shared/constants/test.csv');
                const csvData = [];

                fs.createReadStream(filePath)
                  .pipe(csv())
                  .on('data', (row) => {
                    // Process each row and populate the tables
                    const attackerRow = [
                      row['Source IP Address'], 
                      row['Source Port']
                    ];
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
                    const attackRow = [
                      row['Attack Type'],
                      row.Timestamp,
                      row['Attack Signature']
                    ];
                    csvData.push({ attackerRow, victimRow, networkTrafficRow, responseRow, attackRow });
                  })
                  .on('end', () => {
                    console.log('CSV data:', csvData);
                    if (csvData.length > 0) {
                      const insertAttackerQuery = 'INSERT INTO attacker (SourceIP, SourcePort) VALUES ?';
                      const attackerData = csvData.map(row => row.attackerRow);

                      db.query(insertAttackerQuery, [attackerData], (err, result) => {
                        if (err) throw err;
                        console.log('Attacker data imported...');

                        const attackerIdMapping = csvData.map((row, index) => ({
                          ...row,
                          attackerId: result.insertId + index
                        }));

                        const victimData = attackerIdMapping.map(row => row.victimRow);
                        const insertVictimQuery = 'INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation) VALUES ?';

                        db.query(insertVictimQuery, [victimData], (err, result) => {
                          if (err) throw err;
                          console.log('Victim data imported...');

                          const networkTrafficData = attackerIdMapping.map(row => row.networkTrafficRow);
                          const insertNetworkTrafficQuery = 'INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment) VALUES ?';

                          db.query(insertNetworkTrafficQuery, [networkTrafficData], (err, result) => {
                            if (err) throw err;
                            console.log('Network Traffic data imported...');

                            const responseData = attackerIdMapping.map(row => row.responseRow);
                            const insertResponseQuery = 'INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource) VALUES ?';

                            db.query(insertResponseQuery, [responseData], (err, result) => {
                              if (err) throw err;
                              console.log('Response data imported...');

                              const attackData = attackerIdMapping.map(row => row.attackRow);
                              const insertAttackQuery = 'INSERT INTO attack (AttackType, Timestamp, AttackSignature) VALUES ?';

                              db.query(insertAttackQuery, [attackData], (err, result) => {
                                if (err) throw err;
                                console.log('Attack data imported...');
                              });
                            });
                          });
                        });
                      });
                    } else {
                      console.log('No valid data to import.');
                    }
                  });
              };

              importCSV();
            });
          });
        });
      });
    });
  });
});

app.get('/api/attacks', (req, res) => {
  const query = `
    SELECT a.SourceIP, a.SourcePort,
           v.DestinationIP, v.DestinationPort, v.UserInfo, v.DeviceInfo, v.GeoLocation,
           n.Protocol, n.PacketLength, n.PacketType, n.TrafficType, n.Segment,
           r.AnomalyScores, r.ActionTaken, r.SeverityLevel, r.LogSource,
           t.AttackType, t.Timestamp, t.AttackSignature
    FROM attack t
    JOIN response r ON t.id = r.id
    JOIN network_traffic n ON t.id = n.id
    JOIN victim v ON t.id = v.id
    JOIN attacker a ON t.id = a.id
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

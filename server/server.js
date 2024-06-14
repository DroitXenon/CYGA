const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { userInfo } = require('os');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
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
        GeoLocation VARCHAR(255),
        attackerId INT,
        FOREIGN KEY (attackerId) REFERENCES attacker(id)
      );
    `;

    const createNetworkTrafficTableQuery = `
      CREATE TABLE IF NOT EXISTS network_traffic (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Protocol VARCHAR(255),
        PacketLength INT,
        PacketType VARCHAR(255),
        TrafficType VARCHAR(255),
        Segment VARCHAR(255),
        victimId INT,
        FOREIGN KEY (victimId) REFERENCES victim(id)
      );
    `;

    const createResponseTableQuery = `
      CREATE TABLE IF NOT EXISTS response (
        id INT AUTO_INCREMENT PRIMARY KEY,
        AnomalyScores VARCHAR(255),
        ActionTaken VARCHAR(255),
        SeverityLevel VARCHAR(255),
        LogSource VARCHAR(255),
        networkTrafficId INT,
        FOREIGN KEY (networkTrafficId) REFERENCES network_traffic(id)
      );
    `;

    const createIncidentTableQuery = `
      CREATE TABLE IF NOT EXISTS incident (
        id INT AUTO_INCREMENT PRIMARY KEY,
        AttackType VARCHAR(255),
        Timestamp VARCHAR(255),
        AttackSignature VARCHAR(255),
        responseId INT,
        FOREIGN KEY (responseId) REFERENCES response(id)
      );
    `;

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
            
            db.query(createIncidentTableQuery, (err, result) => {
              if (err) throw err;
              console.log('Incident table created or already exists...');

              const importCSV = () => {
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

                        const victimData = attackerIdMapping.map(row => [...row.victimRow, row.attackerId]);
                        const insertVictimQuery = 'INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId) VALUES ?';

                        db.query(insertVictimQuery, [victimData], (err, result) => {
                          if (err) throw err;
                          console.log('Victim data imported...');

                          const networkTrafficData = attackerIdMapping.map(row => [...row.networkTrafficRow, row.attackerId]);
                          const insertNetworkTrafficQuery = 'INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment, victimId) VALUES ?';

                          db.query(insertNetworkTrafficQuery, [networkTrafficData], (err, result) => {
                            if (err) throw err;
                            console.log('Network Traffic data imported...');

                            const responseData = attackerIdMapping.map(row => [...row.responseRow, row.attackerId]);
                            const insertResponseQuery = 'INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId) VALUES ?';

                            db.query(insertResponseQuery, [responseData], (err, result) => {
                              if (err) throw err;
                              console.log('Response data imported...');

                              const incidentData = attackerIdMapping.map(row => [...row.incidentRow, row.attackerId]);
                              const insertIncidentQuery = 'INSERT INTO incident (AttackType, Timestamp, AttackSignature, responseId) VALUES ?';

                              db.query(insertIncidentQuery, [incidentData], (err, result) => {
                                if (err) throw err;
                                console.log('Incident data imported...');
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

// Base query for fetching all related data
const baseQuery = `
  SELECT i.*, r.*, n.*, v.*, a.*
  FROM incident i
  JOIN response r ON i.responseId = r.id
  JOIN network_traffic n ON r.networkTrafficId = n.id
  JOIN victim v ON n.victimId = v.id
  JOIN attacker a ON v.attackerId = a.id
`;


app.get('/api/incidents', (req, res) => {
  db.query(baseQuery, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Sort feature
app.get('/api/sort', (req, res) => {
  const { column, order } = req.query;
  const validColumns = ['Timestamp', 'AttackType', 'AttackSignature'];
  const validOrder = ['ASC', 'DESC'];

  if (!validColumns.includes(column) || !validOrder.includes(order)) {
    return res.status(400).json({ error: 'Invalid sort parameters' });
  }

  const query = baseQuery + ` ORDER BY ?? ${order}`;
  db.query(query, [column], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Incident details page
app.get('/api/incident/:id', (req, res) => {
  const { id } = req.params;
  const query = baseQuery + ` WHERE i.id = ?`;

  db.query(query, [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Analysis feature (placeholder)
app.get('/api/incident/:id/analysis', (req, res) => {
  res.json({ message: 'Analysis feature coming soon...' });
});

// Delete feature
app.delete('/api/delete/:id', (req, res) => {
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

  db.query(deleteQuery, [id], (err, results) => {
    if (err) throw err;
    res.json({ message: 'Record deleted successfully' });
  });
});

// Add feature
app.post('/api/add', (req, res) => {
  const {
    SourceIP, SourcePort,
    DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation,
    Protocol, PacketLength, PacketType, TrafficType, Segment,
    AnomalyScores, ActionTaken, SeverityLevel, LogSource,
    AttackType, Timestamp, AttackSignature
  } = req.body;

  db.beginTransaction((err) => {
    if (err) throw err;

    const insertAttackerQuery = 'INSERT INTO attacker (SourceIP, SourcePort) VALUES (?, ?)';
    db.query(insertAttackerQuery, [SourceIP, SourcePort], (err, result) => {
      if (err) {
        return db.rollback(() => {
          throw err;
        });
      }
      const attackerId = result.insertId;

      const insertVictimQuery = 'INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId) VALUES (?, ?, ?, ?, ?, ?)';
      db.query(insertVictimQuery, [DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId], (err, result) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }
        const victimId = result.insertId;

        const insertNetworkTrafficQuery = 'INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment, victimId) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(insertNetworkTrafficQuery, [Protocol, PacketLength, PacketType, TrafficType, Segment, victimId], (err, result) => {
          if (err) {
            return db.rollback(() => {
              throw err;
            });
          }
          const networkTrafficId = result.insertId;

          const insertResponseQuery = 'INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId) VALUES (?, ?, ?, ?, ?)';
          db.query(insertResponseQuery, [AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId], (err, result) => {
            if (err) {
              return db.rollback(() => {
                throw err;
              });
            }
            const responseId = result.insertId;

            const insertIncidentQuery = 'INSERT INTO incident (AttackType, Timestamp, AttackSignature, responseId) VALUES (?, ?, ?, ?)';
            db.query(insertIncidentQuery, [AttackType, Timestamp, AttackSignature, responseId], (err, result) => {
              if (err) {
                return db.rollback(() => {
                  throw err;
                });
              }

              db.commit((err) => {
                if (err) {
                  return db.rollback(() => {
                    throw err;
                  });
                }
                res.json({ message: 'Record added successfully' });
              });
            });
          });
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

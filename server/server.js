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
        uid INT AUTO_INCREMENT PRIMARY KEY,
        SourceIP VARCHAR(255),
        SourcePort INT
        FOREIGN KEY(UID) REFERENCES USER(UID)
      );
    `;

    const createVictimTableQuery = `
      CREATE TABLE IF NOT EXISTS victim (
        uid INT AUTO_INCREMENT PRIMARY KEY,
        DestinationIP VARCHAR(255),
        DestinationPort INT,
        UserInfo VARCHAR(255),
        DeviceInfo VARCHAR(255),
        GeoLocation VARCHAR(255)
        FOREIGN KEY(UID) REFERENCES USER(UID)
      );
    `;

    const createNetworkTrafficTableQuery = `
      CREATE TABLE IF NOT EXISTS network_traffic (
        nid INT AUTO_INCREMENT PRIMARY KEY,
        Protocol VARCHAR(255),
        PacketLength INT,
        PacketType VARCHAR(255),
        TrafficType VARCHAR(255),
        Segment VARCHAR(255)
        FOREIGN KEY(UID) REFERENCES VICTIM(UID)
      );
    `;

    const createResponseTableQuery = `
      CREATE TABLE IF NOT EXISTS response (
        rid INT AUTO_INCREMENT PRIMARY KEY,
        AnomalyScores VARCHAR(255),
        ActionTaken VARCHAR(255),
        SeverityLevel VARCHAR(255),
        LogSource VARCHAR(255)
        FOREIGN KEY(IID) REFERENCES INCIDENT(IID)
      );
    `;

    const createIncidentTableQuery = `
      CREATE TABLE IF NOT EXISTS incident (
        iid INT AUTO_INCREMENT PRIMARY KEY,
        IncidentType VARCHAR(255),
        Timestamp VARCHAR(255),
        IncidentSignature VARCHAR(255)
        FOREIGN KEY(UID) REFERENCES ATTACKER(UID)
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
            
            db.query(createIncidentTableQuery, (err, result) => {
              if (err) throw err;
              console.log('Incident table created or already exists...');

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
                    const incidentRow = [
                      row['Incident Type'],
                      row.Timestamp,
                      row['Incident Signature']
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

                        const attackerUidMapping = csvData.map((row, index) => ({
                          ...row,
                          attackerUid: result.insertUid + index
                        }));

                        const victimData = attackerUidMapping.map(row => row.victimRow);
                        const insertVictimQuery = 'INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation) VALUES ?';

                        db.query(insertVictimQuery, [victimData], (err, result) => {
                          if (err) throw err;
                          console.log('Victim data imported...');

                          const networkTrafficData = attackerUidMapping.map(row => row.networkTrafficRow);
                          const insertNetworkTrafficQuery = 'INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment) VALUES ?';

                          db.query(insertNetworkTrafficQuery, [networkTrafficData], (err, result) => {
                            if (err) throw err;
                            console.log('Network Traffic data imported...');

                            const responseData = attackerUidMapping.map(row => row.responseRow);
                            const insertResponseQuery = 'INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource) VALUES ?';

                            db.query(insertResponseQuery, [responseData], (err, result) => {
                              if (err) throw err;
                              console.log('Response data imported...');

                              const incidentData = incidentIidMapping.map(row => row.incidentRow);
                              const insertIncidentQuery = 'INSERT INTO incident (IncidentType, Timestamp, IncidentSignature) VALUES ?';

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

app.get('/api/attacks', (req, res) => {
  const query = `
    SELECT a.SourceIP, a.SourcePort,
           v.DestinationIP, v.DestinationPort, v.UserInfo, v.DeviceInfo, v.GeoLocation,
           n.Protocol, n.PacketLength, n.PacketType, n.TrafficType, n.Segment,
           r.AnomalyScores, r.ActionTaken, r.SeverityLevel, r.LogSource,
           t.IncidentType, t.Timestamp, t.IncidentSignature
    FROM incident t
    JOIN response r ON t.rid = r.rid
    JOIN network_traffic n ON t.nid = n.nid
    JOIN victim v ON t.uid = v.uid
    JOIN attacker a ON t.uid = a.uid
  `;
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// server.js
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
  user: 'root', // replace with your own user
  password: '', // replace with your own password
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

    // Create a comprehensive table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS comprehensive_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Timestamp VARCHAR(255),
        SourceIP VARCHAR(255),
        DestinationIP VARCHAR(255),
        SourcePort INT,
        DestinationPort INT,
        Protocol VARCHAR(255),
        PacketLength INT,
        PacketType VARCHAR(255),
        TrafficType VARCHAR(255),
        AnomalyScores VARCHAR(255),
        AttackType VARCHAR(255),
        AttackSignature VARCHAR(255),
        ActionTaken VARCHAR(255),
        SeverityLevel VARCHAR(255),
        UserInfo VARCHAR(255),
        DeviceInfo VARCHAR(255),
        NetworkSegment VARCHAR(255),
        GeoLocation VARCHAR(255),
        LogSource VARCHAR(255)
      );
    `;

    db.query(createTableQuery, (err, result) => {
      if (err) throw err;
      console.log('Comprehensive table created or already exists...');
      
      const importCSV = () => {
        // Path to the CSV file
        const filePath = path.join(__dirname, '../shared/constants/test.csv');
        const csvData = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            // Process each row and populate the comprehensive table
            const comprehensiveRow = [
              row.Timestamp,
              row['Source IP Address'],
              row['Destination IP Address'],
              row['Source Port'],
              row['Destination Port'],
              row.Protocol,
              row['Packet Length'],
              row['Packet Type'],
              row['Traffic Type'],
              row['Anomaly Scores'],
              row['Attack Type'],
              row['Attack Signature'],
              row['Action Taken'],
              row['Severity Level'],
              row['User Information'],
              row['Device Information'],
              row['Network Segment'],
              row['Geo-location Data'],
              row['Log Source']
            ];
            csvData.push(comprehensiveRow);
          })
          .on('end', () => {
            console.log('CSV data:', csvData);
            if (csvData.length > 0) {
              const insertQuery = `
                INSERT INTO comprehensive_data (
                  Timestamp, SourceIP, DestinationIP, SourcePort, DestinationPort, Protocol,
                  PacketLength, PacketType, TrafficType, AnomalyScores, AttackType, AttackSignature,
                  ActionTaken, SeverityLevel, UserInfo, DeviceInfo, NetworkSegment, GeoLocation, LogSource
                ) VALUES ?
              `;
              db.query(insertQuery, [csvData], (err, result) => {
                if (err) throw err;
                console.log('CSV data imported into comprehensive_data table...');
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

app.get('/api/attacks', (req, res) => {
  const query = 'SELECT * FROM comprehensive_data';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

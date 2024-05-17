const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');
const fs = require('fs');
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

    const importCSV = () => {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS cybersecurity_attacks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          timestamp VARCHAR(255),
          source_ip VARCHAR(255),
          attack_type VARCHAR(255),
          target VARCHAR(255),
          severity INT
        )
      `;

      db.query(createTableQuery, (err, result) => {
        if (err) throw err;
        console.log('Table created or already exists...');

        const filePath = '/Users/droitxenon/Developer/project/cyberex/shared/constants/cybersecurity_attacks.csv';
        const csvData = [];

        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            const timestamp = row['Timestamp'] || null;
            const source_ip = row['Source IP Address'] || null;
            const attack_type = row['Attack Type'] || null;
            const target = row['Destination IP Address'] || null;
            const severity = row['Severity Level'] === 'Low' ? 1 : row['Severity Level'] === 'Medium' ? 2 : row['Severity Level'] === 'High' ? 3 : null;

            if (timestamp && source_ip && attack_type && target && severity !== null) {
              csvData.push([timestamp, source_ip, attack_type, target, severity]);
            } else {
              console.log('Invalid row:', row); 
            }
          })
          .on('end', () => {
            console.log('CSV data:', csvData);
            if (csvData.length > 0) {
              const insertQuery = `
                INSERT INTO cybersecurity_attacks (timestamp, source_ip, attack_type, target, severity)
                VALUES ?
              `;

              db.query(insertQuery, [csvData], (err, result) => {
                if (err) throw err;
                console.log('CSV data imported...');
              });
            } else {
              console.log('No valid data to import.');
            }
          });
      });
    };

    importCSV();
  });
});

app.get('/api/attacks', (req, res) => {
  const query = 'SELECT * FROM cybersecurity_attacks';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

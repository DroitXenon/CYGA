# CYGA - Cyber Geolocation Analysis

Welcome to the  repository for CYGA, the Cyber Geolocation Analysis tool designed to show real-time data and insights. CYGA is designed for tracking, analyzing, and responding to cyber threats with precision and efficiency. This project is a web application built with React and Material-UI on the front end, Node.js and Express on the back end, and MySQL for the database. 
<img src="shared/constants/logo.png" alt="CYGA Logo" width="300"/>


## Features

- **Timestamping:** Every event is recorded with a precise timestamp, ensuring that you can track the sequence of events down to the millisecond.

- **Location Finding:** Quickly pinpoint the geographical origin of an attack with our advanced geolocation algorithms.

- **Attack Type Identification:** Our system classifies the nature of the attack, providing you with immediate insight into the potential threat.

- **Attack Analysis:** In-depth analysis of each attack helps you understand the attacker's methods and motives.

- **Data Statistics:** Comprehensive statistics offer a macro and micro view of the cyber threat landscape, aiding in strategic decision-making.

## Prerequisites
- React for Front-end Development
- Node.js and Express.js for Back-end Development
- MySQL for Database Management
- OpenAI API key (Optional)

## Installation

### Backend Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/DroitXenon/.git
    cd CYGA/server
    ```

2. **Install the dependencies:**

    ```bash
    npm install
    ```

3. **Create the MySQL database:**

    ```sql
    CREATE DATABASE web_traffic;
    ```

4. **Update the MySQL connection details in `server.js`:**

    ```javascript
    const db = mysql.createConnection({
      host: 'localhost',
      user: 'Change to Your Own User',
      password: 'Change to Your Own Password', 
      database: 'web_traffic'
    });
    ```

5. **Start the backend server:**

    ```bash
    node server.js
    ```

### Frontend Setup

1. **Navigate to the frontend directory:**

    ```bash
    cd ../client
    ```

2. **Update the OpenAI API Key in `server.js`:**

    ```javascript
    const openai = new OpenAI({ apiKey: 'Replace with your own API key', dangerouslyAllowBrowser: true });;
    ```

2. **Install the dependencies:**

    ```bash
    npm install
    ```

3. **Start the React application:**

    ```bash
    npm start
    ```

## Usage

1. Open your browser and go to `http://localhost:3000`.
2. View the cybersecurity attack data in the table.
3. Click on the column headers to sort the data.
4. Select rows using the checkboxes.
5. Click the "Analysis" button to analyze the selected rows using the OpenAI API.
6. View the analysis results displayed below the table.

## Technologies Used

- **Frontend:**
  - React
  - Material-UI

- **Backend:**
  - Node.js
  - Express

- **Database:**
  - MySQL

- **API:**
  - OpenAI API

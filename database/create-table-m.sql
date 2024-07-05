-- File for C2

CREATE DATABASE IF NOT EXISTS test;
USE test;

CREATE TABLE IF NOT EXISTS attacker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    SourceIP VARCHAR(255),
    SourcePort INT,
    SourceLatitude VARCHAR(255),
    SourceLongitude VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS victim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    DestinationIP VARCHAR(255) NOT NULL,
    DestinationPort INT NOT NULL,
    UserInfo VARCHAR(255) NOT NULL,
    DeviceInfo VARCHAR(255),
    GeoLocation VARCHAR(255) NOT NULL,
    attackerId INT,
    FOREIGN KEY (attackerId) REFERENCES attacker(id)
);

CREATE TABLE IF NOT EXISTS network_traffic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Protocol VARCHAR(255),
    PacketLength INT NOT NULL,
    PacketType VARCHAR(255) NOT NULL,
    TrafficType VARCHAR(255),
    Segment VARCHAR(255),
    victimId INT,
    FOREIGN KEY (victimId) REFERENCES victim(id)
);

CREATE TABLE IF NOT EXISTS response (
    id INT AUTO_INCREMENT PRIMARY KEY,
    AnomalyScores VARCHAR(255),
    ActionTaken VARCHAR(255),
    SeverityLevel VARCHAR(255),
    LogSource VARCHAR(255),
    networkTrafficId INT,
    FOREIGN KEY (networkTrafficId) REFERENCES network_traffic(id)
);

CREATE TABLE IF NOT EXISTS incident (
    id INT AUTO_INCREMENT PRIMARY KEY,
    AttackType VARCHAR(255),
    Timestamp VARCHAR(255) NOT NULL,
    AttackSignature VARCHAR(255),
    responseId INT,
    FOREIGN KEY (responseId) REFERENCES response(id)
);

CREATE TABLE IF NOT EXISTS attacker (
    id INT AUTO_INCREMENT PRIMARY KEY,
    SourceIP VARCHAR(255),
    SourcePort INT
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

CREATE TABLE IF NOT EXISTS incident (
    id INT AUTO_INCREMENT PRIMARY KEY,
    AttackType VARCHAR(255),
    Timestamp VARCHAR(255),
    AttackSignature VARCHAR(255),
    responseId INT,
    FOREIGN KEY (responseId) REFERENCES response(id)
);

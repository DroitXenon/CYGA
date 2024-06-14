-- First need to have a valid dataset (example)
INSERT INTO attacker (SourceIP, SourcePort) VALUES ('192.168.0.1', 5001);

INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId)
VALUES ('84.9.164.252', 17616, 'Justin Wang', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.2; Trident/5.0)', 'Waterloo, Canada', 1);

INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment, victimId)
VALUES ('ICMP', 503, 'Data', 'HTTP', 'Segment A', 1);

INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId)
VALUES ('60', 'Logged', 'Low', 'Server', 1);

INSERT INTO incident (AttackType, Timestamp, AttackSignature, responseId)
VALUES ('Malware', '2024-06-01 06:33:58', 'Known Pattern B', 1);

-- Show all the data (Not a feature)
SELECT * FROM attacker;
SELECT * FROM victim;
SELECT * FROM network_traffic;
SELECT * FROM response;
SELECT * FROM incident;

-- There are five features:
-- 1.Search 
SELECT *
FROM incident i
JOIN response r ON i.responseId = r.id
JOIN network_traffic n ON r.networkTrafficId = n.id
JOIN victim v ON n.victimId = v.id
JOIN attacker a ON v.attackerId = a.id
WHERE i.AttackType LIKE '%Malware%' 
    OR i.AttackSignature LIKE '%Known Pattern B%' 
    OR i.Timestamp LIKE '2024-06-01 06:33:58';
    -- (Here '' is a place holder, user can change to other words to search)

-- 2.Sort 
SELECT *
FROM incident i
JOIN response r ON i.responseId = r.id
JOIN network_traffic n ON r.networkTrafficId = n.id
JOIN victim v ON n.victimId = v.id
JOIN attacker a ON v.attackerId = a.id
ORDER BY i.Timestamp ASC; 
    -- (Can change the atrribute and order user want to re-order)

-- 3.Add
INSERT INTO attacker (SourceIP, SourcePort) 
    VALUES ('192.168.0.2', 5000);
INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId)
    VALUES ('15.9.371.480', 85265, 'Talia Zhang', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.2; Trident/5.0)', 'Waterloo, Canada', 2);
INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment, victimId)
    VALUES ('ICMP', 4040, 'Data', 'HTTP', 'Segment B', 2);
INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId)
    VALUES ('60', 'Logged', 'High', 'Server', 2);
INSERT INTO incident (AttackType, Timestamp, AttackSignature, responseId)
    VALUES ('Malware', '2024-06-02 03:55:01', 'Known Pattern A', 2);
    -- (Can change whatever user want in VALUES(?,?))

-- 4. Delete
DELETE i, r, n, v, a
FROM incident i
JOIN response r ON i.responseId = r.id
JOIN network_traffic n ON r.networkTrafficId = n.id
JOIN victim v ON n.victimId = v.id
JOIN attacker a ON v.attackerId = a.id
WHERE i.id = 2;
    --(Can change 2 to the IID user want)

-- 5. Analysis
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
WHERE i.id = ?;

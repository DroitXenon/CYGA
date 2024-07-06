-- File for C3 (Impl Part)
-- By using our server.js file, a databae cyga will automatically provided in mysql 

-- Show all the data (Not a feature)
SELECT * FROM attacker;
SELECT * FROM victim;
SELECT * FROM network_traffic;
SELECT * FROM response;
SELECT * FROM incident;

-- There are six features:
-- 1. Filter
-- Search 
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

-- Sort 
SELECT *
FROM incident i
JOIN response r ON i.responseId = r.id
JOIN network_traffic n ON r.networkTrafficId = n.id
JOIN victim v ON n.victimId = v.id
JOIN attacker a ON v.attackerId = a.id
ORDER BY i.Timestamp ASC; 
    -- (Can change the atrribute and order user want to re-order)

-- 2. Analysis
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
WHERE i.id = 1;
    --(Can change 2 to the IID user want)

-- 3. View
CREATE VIEW view_table AS
SELECT AttackType,SeverityLevel
FROM incident i
JOIN response r ON i.responseId = r.id
JOIN network_traffic n ON r.networkTrafficId = n.id
JOIN victim v ON n.victimId = v.id
JOIN attacker a ON v.attackerId = a.id;
    --(Can change {AttackType,SeverityLevel} to the attributes column user want)

-- 4. Timestamp
SELECT *
FROM incident i
WHERE Timestamp < '2021/3/8 20:13'
    AND Timestamp > '2020/9/7 4:50';

-- 5. NetWork
-- Summary Protocol attribute
SELECT Protocol, COUNT(*) as count
FROM network_traffic
GROUP BY Protocol;

-- Summary TrafficType attribute
SELECT TrafficType, COUNT(*) as count
FROM network_traffic
GROUP BY TrafficType;

-- 6. Victim
-- Find the top three devices used for cyber attacks 
SELECT DeviceInfo, COUNT(*) as count
FROM victim
GROUP BY DeviceInfo
ORDER BY count DESC
LIMIT 3;

-- Find top three location with the most attacks
SELECT GeoLocation, COUNT(*) as count
FROM victim
GROUP BY GeoLocation
ORDER BY count DESC
LIMIT 3;
INSERT INTO attacker (SourceIP, SourcePort) VALUES ('192.168.0.1', 5001);

INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation, attackerId)
VALUES ('84.9.164.252', 17616, 'Justin Wang', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.2; Trident/5.0)', 'Waterloo, Canada', 1);

INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment, victimId)
VALUES ('ICMP', 503, 'Data', 'HTTP', 'Segment A', 1);

INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource, networkTrafficId)
VALUES ('60', 'Logged', 'Low', 'Server', 1);

INSERT INTO incident (AttackType, Timestamp, AttackSignature, responseId)
VALUES ('Malware', '2024-06-01 06:33:58', 'Known Pattern B', 1);

SELECT * FROM attacker;
SELECT * FROM victim;
SELECT * FROM network_traffic;
SELECT * FROM response;
SELECT * FROM incident;

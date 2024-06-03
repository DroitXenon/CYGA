INSERT INTO attacker (SourceIP, SourcePort) VALUES ('192.168.0.1', 5001);

INSERT INTO victim (DestinationIP, DestinationPort, UserInfo, DeviceInfo, GeoLocation)
VALUES ('84.9.164.252', 17616, 'Justin Wang', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.2; Trident/5.0)', 'Waterloo, Canada');

INSERT INTO network_traffic (Protocol, PacketLength, PacketType, TrafficType, Segment)
VALUES ('ICMP', 503, 'Data', 'HTTP', 'Segment A');

INSERT INTO response (AnomalyScores, ActionTaken, SeverityLevel, LogSource)
VALUES ('60', 'Logged', 'Low', 'Server');

INSERT INTO incident (AttackType, Timestamp, AttackSignature)
VALUES ('Malware', '2024-06-01 06:33:58', 'Known Pattern B');

SELECT * FROM attacker;
SELECT * FROM victim;
SELECT * FROM network_traffic;
SELECT * FROM response;
SELECT * FROM incident;

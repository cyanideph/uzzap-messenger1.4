-- Migration: 001_initial_schema
-- Description: Seed data for UzZap application
-- Created: 2025-04-05

-- Seed data for regions and provinces in the Philippines
INSERT INTO regions (id, name, description) VALUES
('NCR', 'National Capital Region', 'Metro Manila'),
('R1', 'Ilocos Region', 'Northwestern Luzon'),
('R2', 'Cagayan Valley', 'Northeastern Luzon'),
('R3', 'Central Luzon', 'Central plains of Luzon'),
('R4A', 'CALABARZON', 'Southern Luzon'),
('R4B', 'MIMAROPA', 'Southwestern Tagalog'),
('R5', 'Bicol Region', 'Southeastern Luzon'),
('R6', 'Western Visayas', 'Western Visayas islands'),
('R7', 'Central Visayas', 'Central Visayas islands'),
('R8', 'Eastern Visayas', 'Eastern Visayas islands'),
('R9', 'Zamboanga Peninsula', 'Western Mindanao'),
('R10', 'Northern Mindanao', 'Northern Mindanao'),
('R11', 'Davao Region', 'Southeastern Mindanao'),
('R12', 'SOCCSKSARGEN', 'South-central Mindanao'),
('R13', 'Caraga', 'Northeastern Mindanao'),
('BARMM', 'Bangsamoro', 'Autonomous Region in Muslim Mindanao'),
('CAR', 'Cordillera Administrative Region', 'Northern Luzon highlands');

-- NCR Provinces/Cities
INSERT INTO provinces (id, name, region_id) VALUES
('NCR-1', 'Manila', 'NCR'),
('NCR-2', 'Quezon City', 'NCR'),
('NCR-3', 'Makati', 'NCR'),
('NCR-4', 'Pasig', 'NCR'),
('NCR-5', 'Taguig', 'NCR');

-- Central Luzon Provinces
INSERT INTO provinces (id, name, region_id) VALUES
('R3-1', 'Bulacan', 'R3'),
('R3-2', 'Pampanga', 'R3'),
('R3-3', 'Bataan', 'R3'),
('R3-4', 'Nueva Ecija', 'R3'),
('R3-5', 'Tarlac', 'R3'),
('R3-6', 'Zambales', 'R3'),
('R3-7', 'Aurora', 'R3');

-- Central Visayas Provinces
INSERT INTO provinces (id, name, region_id) VALUES
('R7-1', 'Cebu', 'R7'),
('R7-2', 'Bohol', 'R7'),
('R7-3', 'Negros Oriental', 'R7'),
('R7-4', 'Siquijor', 'R7');

-- Create chatrooms for each province
INSERT INTO chatrooms (id, province_id, name, description)
SELECT id, id, name || ' Chatroom', 'Official chatroom for ' || name
FROM provinces;

export type Province = {
  id: string;
  name: string;
  region_id: string;
};

export type Region = {
  id: string;
  name: string;
  provinces: Province[];
};

export const regions: Region[] = [
  {
    id: 'NCR',
    name: 'National Capital Region',
    provinces: [
      { id: 'NCR-1', name: 'Manila', region_id: 'NCR' },
      { id: 'NCR-2', name: 'Quezon City', region_id: 'NCR' },
      { id: 'NCR-3', name: 'Caloocan', region_id: 'NCR' },
      { id: 'NCR-4', name: 'Las Piñas', region_id: 'NCR' },
      { id: 'NCR-5', name: 'Makati', region_id: 'NCR' },
      { id: 'NCR-6', name: 'Malabon', region_id: 'NCR' },
      { id: 'NCR-7', name: 'Mandaluyong', region_id: 'NCR' },
      { id: 'NCR-8', name: 'Marikina', region_id: 'NCR' },
      { id: 'NCR-9', name: 'Muntinlupa', region_id: 'NCR' },
      { id: 'NCR-10', name: 'Navotas', region_id: 'NCR' },
      { id: 'NCR-11', name: 'Parañaque', region_id: 'NCR' },
      { id: 'NCR-12', name: 'Pasay', region_id: 'NCR' },
      { id: 'NCR-13', name: 'Pasig', region_id: 'NCR' },
      { id: 'NCR-14', name: 'Pateros', region_id: 'NCR' },
      { id: 'NCR-15', name: 'San Juan', region_id: 'NCR' },
      { id: 'NCR-16', name: 'Taguig', region_id: 'NCR' },
      { id: 'NCR-17', name: 'Valenzuela', region_id: 'NCR' },
    ],
  },
  {
    id: 'CAR',
    name: 'Cordillera Administrative Region',
    provinces: [
      { id: 'CAR-1', name: 'Abra', region_id: 'CAR' },
      { id: 'CAR-2', name: 'Apayao', region_id: 'CAR' },
      { id: 'CAR-3', name: 'Benguet', region_id: 'CAR' },
      { id: 'CAR-4', name: 'Ifugao', region_id: 'CAR' },
      { id: 'CAR-5', name: 'Kalinga', region_id: 'CAR' },
      { id: 'CAR-6', name: 'Mountain Province', region_id: 'CAR' },
    ],
  },
  {
    id: 'R1',
    name: 'Ilocos Region',
    provinces: [
      { id: 'R1-1', name: 'Ilocos Norte', region_id: 'R1' },
      { id: 'R1-2', name: 'Ilocos Sur', region_id: 'R1' },
      { id: 'R1-3', name: 'La Union', region_id: 'R1' },
      { id: 'R1-4', name: 'Pangasinan', region_id: 'R1' },
    ],
  },
  {
    id: 'R2',
    name: 'Cagayan Valley',
    provinces: [
      { id: 'R2-1', name: 'Batanes', region_id: 'R2' },
      { id: 'R2-2', name: 'Cagayan', region_id: 'R2' },
      { id: 'R2-3', name: 'Isabela', region_id: 'R2' },
      { id: 'R2-4', name: 'Nueva Vizcaya', region_id: 'R2' },
      { id: 'R2-5', name: 'Quirino', region_id: 'R2' },
    ],
  },
  {
    id: 'R3',
    name: 'Central Luzon',
    provinces: [
      { id: 'R3-1', name: 'Aurora', region_id: 'R3' },
      { id: 'R3-2', name: 'Bataan', region_id: 'R3' },
      { id: 'R3-3', name: 'Bulacan', region_id: 'R3' },
      { id: 'R3-4', name: 'Nueva Ecija', region_id: 'R3' },
      { id: 'R3-5', name: 'Pampanga', region_id: 'R3' },
      { id: 'R3-6', name: 'Tarlac', region_id: 'R3' },
      { id: 'R3-7', name: 'Zambales', region_id: 'R3' },
    ],
  },
  {
    id: 'R4A',
    name: 'CALABARZON',
    provinces: [
      { id: 'R4A-1', name: 'Batangas', region_id: 'R4A' },
      { id: 'R4A-2', name: 'Cavite', region_id: 'R4A' },
      { id: 'R4A-3', name: 'Laguna', region_id: 'R4A' },
      { id: 'R4A-4', name: 'Quezon', region_id: 'R4A' },
      { id: 'R4A-5', name: 'Rizal', region_id: 'R4A' },
    ],
  },
  {
    id: 'R4B',
    name: 'MIMAROPA',
    provinces: [
      { id: 'R4B-1', name: 'Marinduque', region_id: 'R4B' },
      { id: 'R4B-2', name: 'Occidental Mindoro', region_id: 'R4B' },
      { id: 'R4B-3', name: 'Oriental Mindoro', region_id: 'R4B' },
      { id: 'R4B-4', name: 'Palawan', region_id: 'R4B' },
      { id: 'R4B-5', name: 'Romblon', region_id: 'R4B' },
    ],
  },
  {
    id: 'R5',
    name: 'Bicol Region',
    provinces: [
      { id: 'R5-1', name: 'Albay', region_id: 'R5' },
      { id: 'R5-2', name: 'Camarines Norte', region_id: 'R5' },
      { id: 'R5-3', name: 'Camarines Sur', region_id: 'R5' },
      { id: 'R5-4', name: 'Catanduanes', region_id: 'R5' },
      { id: 'R5-5', name: 'Masbate', region_id: 'R5' },
      { id: 'R5-6', name: 'Sorsogon', region_id: 'R5' },
    ],
  },
  {
    id: 'R6',
    name: 'Western Visayas',
    provinces: [
      { id: 'R6-1', name: 'Aklan', region_id: 'R6' },
      { id: 'R6-2', name: 'Antique', region_id: 'R6' },
      { id: 'R6-3', name: 'Capiz', region_id: 'R6' },
      { id: 'R6-4', name: 'Guimaras', region_id: 'R6' },
      { id: 'R6-5', name: 'Iloilo', region_id: 'R6' },
      { id: 'R6-6', name: 'Negros Occidental', region_id: 'R6' },
    ],
  },
  {
    id: 'R7',
    name: 'Central Visayas',
    provinces: [
      { id: 'R7-1', name: 'Bohol', region_id: 'R7' },
      { id: 'R7-2', name: 'Cebu', region_id: 'R7' },
      { id: 'R7-3', name: 'Negros Oriental', region_id: 'R7' },
      { id: 'R7-4', name: 'Siquijor', region_id: 'R7' },
    ],
  },
  {
    id: 'R8',
    name: 'Eastern Visayas',
    provinces: [
      { id: 'R8-1', name: 'Biliran', region_id: 'R8' },
      { id: 'R8-2', name: 'Eastern Samar', region_id: 'R8' },
      { id: 'R8-3', name: 'Leyte', region_id: 'R8' },
      { id: 'R8-4', name: 'Northern Samar', region_id: 'R8' },
      { id: 'R8-5', name: 'Samar', region_id: 'R8' },
      { id: 'R8-6', name: 'Southern Leyte', region_id: 'R8' },
    ],
  },
  {
    id: 'R9',
    name: 'Zamboanga Peninsula',
    provinces: [
      { id: 'R9-1', name: 'Zamboanga del Norte', region_id: 'R9' },
      { id: 'R9-2', name: 'Zamboanga del Sur', region_id: 'R9' },
      { id: 'R9-3', name: 'Zamboanga Sibugay', region_id: 'R9' },
    ],
  },
  {
    id: 'R10',
    name: 'Northern Mindanao',
    provinces: [
      { id: 'R10-1', name: 'Bukidnon', region_id: 'R10' },
      { id: 'R10-2', name: 'Camiguin', region_id: 'R10' },
      { id: 'R10-3', name: 'Lanao del Norte', region_id: 'R10' },
      { id: 'R10-4', name: 'Misamis Occidental', region_id: 'R10' },
      { id: 'R10-5', name: 'Misamis Oriental', region_id: 'R10' },
    ],
  },
  {
    id: 'R11',
    name: 'Davao Region',
    provinces: [
      { id: 'R11-1', name: 'Davao de Oro', region_id: 'R11' },
      { id: 'R11-2', name: 'Davao del Norte', region_id: 'R11' },
      { id: 'R11-3', name: 'Davao del Sur', region_id: 'R11' },
      { id: 'R11-4', name: 'Davao Occidental', region_id: 'R11' },
      { id: 'R11-5', name: 'Davao Oriental', region_id: 'R11' },
    ],
  },
  {
    id: 'R12',
    name: 'SOCCSKSARGEN',
    provinces: [
      { id: 'R12-1', name: 'Cotabato', region_id: 'R12' },
      { id: 'R12-2', name: 'Sarangani', region_id: 'R12' },
      { id: 'R12-3', name: 'South Cotabato', region_id: 'R12' },
      { id: 'R12-4', name: 'Sultan Kudarat', region_id: 'R12' },
    ],
  },
  {
    id: 'R13',
    name: 'Caraga',
    provinces: [
      { id: 'R13-1', name: 'Agusan del Norte', region_id: 'R13' },
      { id: 'R13-2', name: 'Agusan del Sur', region_id: 'R13' },
      { id: 'R13-3', name: 'Dinagat Islands', region_id: 'R13' },
      { id: 'R13-4', name: 'Surigao del Norte', region_id: 'R13' },
      { id: 'R13-5', name: 'Surigao del Sur', region_id: 'R13' },
    ],
  },
  {
    id: 'BARMM',
    name: 'Bangsamoro Autonomous Region in Muslim Mindanao',
    provinces: [
      { id: 'BARMM-1', name: 'Basilan', region_id: 'BARMM' },
      { id: 'BARMM-2', name: 'Lanao del Sur', region_id: 'BARMM' },
      { id: 'BARMM-3', name: 'Maguindanao del Norte', region_id: 'BARMM' },
      { id: 'BARMM-4', name: 'Maguindanao del Sur', region_id: 'BARMM' },
      { id: 'BARMM-5', name: 'Sulu', region_id: 'BARMM' },
      { id: 'BARMM-6', name: 'Tawi-Tawi', region_id: 'BARMM' },
    ],
  },
];

// Helper function to get all provinces as a flat array
export const getAllProvinces = (): Province[] => {
  return regions.flatMap(region => region.provinces);
};

// Helper function to find a region by ID
export const findRegionById = (regionId: string): Region | undefined => {
  return regions.find(region => region.id === regionId);
};

// Helper function to find a province by ID
export const findProvinceById = (provinceId: string): Province | undefined => {
  return getAllProvinces().find(province => province.id === provinceId);
};

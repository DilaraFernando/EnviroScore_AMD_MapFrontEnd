export interface User {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin';
  department?: string;
  semester?: number;
  expertise?: string;
  avatarUrl?: string;
  googleId?: string;
  createdAt?: string;
}

export interface DistrictScore {
  _id: string;
  district: string;
  districtId: string;
  province: string;
  lat: number;
  lng: number;
  score: number;
  zone: 'Green' | 'Yellow' | 'Red';
  moisture: number;
  temp: string;
  humidity: number;
  problemNote: string;
  inputs: {
    canopy: number;
    rainfall: number;
    industrial: 'low' | 'medium' | 'high';
  };
  createdBy: string;
}

export interface WeatherAnalysis {
  _id: string;
  district: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  aiAnalysis: string;
  createdAt: string;
}

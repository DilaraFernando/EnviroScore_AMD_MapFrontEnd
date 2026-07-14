export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'viewer' | 'analyst' | 'admin';
  semester?: number;
  expertise?: string;
  avatarUrl?: string;
}

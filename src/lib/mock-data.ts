
export type VehicleType = 'Van' | 'Pickup' | 'Sedan';
export type VehicleStatus = 'Available' | 'Maintenance' | 'Booked' | 'In Use';
export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';
export type UserRole = 'Employee' | 'Admin';

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: VehicleType;
  capacity: number;
  status: VehicleStatus;
  remark?: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  employeeName: string;
  department: string;
  phone: string;
  destination: string;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  status: BookingStatus;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  department: string;
  role: UserRole;
}

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V001', name: 'Toyota Hiace', licensePlate: 'กข-1234', type: 'Van', capacity: 12, status: 'Available' },
  { id: 'V002', name: 'Toyota Camry', licensePlate: 'ฮฮ-7788', type: 'Sedan', capacity: 5, status: 'In Use' },
  { id: 'V003', name: 'Isuzu D-Max', licensePlate: 'บม-9900', type: 'Pickup', capacity: 4, status: 'Maintenance' },
  { id: 'V004', name: 'Honda Civic', licensePlate: 'รน-5566', type: 'Sedan', capacity: 5, status: 'Available' },
  { id: 'V005', name: 'Hyundai Staria', licensePlate: 'ชช-1122', type: 'Van', capacity: 11, status: 'Available' },
];

export const MOCK_USERS: User[] = [
  { email: 'admin@company.com', name: 'Somsak Admin', department: 'IT Operations', role: 'Admin' },
  { email: 'employee@company.com', name: 'Wichai Worker', department: 'Sales', role: 'Employee' },
];

const now = new Date();
const formatISO = (date: Date) => date.toISOString();

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'B001',
    vehicleId: 'V002',
    vehicleName: 'Toyota Camry',
    employeeName: 'Wichai Worker',
    department: 'Sales',
    phone: '081-234-5678',
    destination: 'Chonburi Office',
    startDateTime: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0)),
    endDateTime: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0)),
    purpose: 'Client Meeting',
    status: 'Approved',
    createdAt: formatISO(new Date(now.getTime() - 86400000)),
  },
  {
    id: 'B002',
    vehicleId: 'V001',
    vehicleName: 'Toyota Hiace',
    employeeName: 'Jane Smith',
    department: 'HR',
    phone: '089-999-0000',
    destination: 'Team Building Site',
    startDateTime: formatISO(new Date(now.getTime() + 86400000)),
    endDateTime: formatISO(new Date(now.getTime() + 172800000)),
    purpose: 'Employee Engagement Event',
    status: 'Pending',
    createdAt: formatISO(new Date()),
  }
];

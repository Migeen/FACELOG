import { Employee } from '@/types/employee';
import { AttendanceRecord, AttendanceSummary } from '@/types/attendance';

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    position: 'Software Engineer',
    department: 'Engineering',
    phone: '+1 234 567 8901',
    hireDate: '2023-01-15',
    status: 'active',
    salary: 75000,
    rollNo: 'EMP001'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    position: 'Product Manager',
    department: 'Product',
    phone: '+1 234 567 8902',
    hireDate: '2022-08-20',
    status: 'active',
    salary: 85000,
    rollNo: 'EMP002'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike.johnson@company.com',
    position: 'Designer',
    department: 'Design',
    phone: '+1 234 567 8903',
    hireDate: '2023-03-10',
    status: 'active',
    salary: 65000,
    rollNo: 'EMP003'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@company.com',
    position: 'HR Manager',
    department: 'Human Resources',
    phone: '+1 234 567 8904',
    hireDate: '2021-11-05',
    status: 'active',
    salary: 70000,
    rollNo: 'EMP004'
  }
];

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '17:30',
    status: 'present',
    workHours: 8.5
  },
  {
    id: '2',
    employeeId: '2',
    date: '2024-01-15',
    checkIn: '09:15',
    checkOut: '17:45',
    status: 'late',
    workHours: 8.5
  },
  {
    id: '3',
    employeeId: '3',
    date: '2024-01-15',
    status: 'absent',
    workHours: 0
  },
  {
    id: '4',
    employeeId: '4',
    date: '2024-01-15',
    checkIn: '09:00',
    checkOut: '13:00',
    status: 'half-day',
    workHours: 4
  }
];

// Mock API functions
export const api = {
  employees: {
    getAll: (): Promise<Employee[]> => {
      return Promise.resolve(mockEmployees);
    },
    getById: (id: string): Promise<Employee | null> => {
      const employee = mockEmployees.find(emp => emp.id === id);
      return Promise.resolve(employee || null);
    },
    create: (employee: Omit<Employee, 'id'>): Promise<Employee> => {
      const newEmployee = { ...employee, id: Date.now().toString() };
      mockEmployees.push(newEmployee);
      return Promise.resolve(newEmployee);
    },
    update: (id: string, updates: Partial<Employee>): Promise<Employee> => {
      const index = mockEmployees.findIndex(emp => emp.id === id);
      if (index !== -1) {
        mockEmployees[index] = { ...mockEmployees[index], ...updates };
        return Promise.resolve(mockEmployees[index]);
      }
      throw new Error('Employee not found');
    }
  },
  
  attendance: {
    getAll: (): Promise<AttendanceRecord[]> => {
      return Promise.resolve(mockAttendance);
    },
    getByEmployee: (employeeId: string): Promise<AttendanceRecord[]> => {
      const records = mockAttendance.filter(record => record.employeeId === employeeId);
      return Promise.resolve(records);
    },
    getSummary: (): Promise<AttendanceSummary> => {
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = mockAttendance.filter(record => record.date === today);
      
      return Promise.resolve({
        totalEmployees: mockEmployees.length,
        presentToday: todayRecords.filter(r => r.status === 'present').length,
        absentToday: todayRecords.filter(r => r.status === 'absent').length,
        lateToday: todayRecords.filter(r => r.status === 'late').length,
        avgWorkHours: todayRecords.reduce((sum, r) => sum + (r.workHours || 0), 0) / todayRecords.length || 0
      });
    }
  }
};
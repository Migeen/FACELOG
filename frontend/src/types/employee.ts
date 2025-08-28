export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  checkin: string;
  checkout: string;
  phone?: string;
  avatar?: string;
  hireDate: string;
  status: 'active' | 'inactive';
  salary?: number;
  rollNo: string;
  password?: string;
}

export interface EmployeeFilters {
  department?: string;
  status?: 'active' | 'inactive';
  search?: string;
}
// export interface Employee {
//   id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   position: string;
//   department: string;
//   checkin: string;
//   checkout: string;
//   phone?: string;
//   avatar?: string;
//   hireDate: string;
//   status: 'active' | 'inactive';
//   salary?: number;
//   rollNo: string;
//   password?: string;
// }

export interface Employee {
  id: number | string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: string;
  checkin?: string;
  checkout?: string;
  hireDate?: string;
  salary?: number;
  department?: string; // department_name from backend
  rollNo?: string; // optional if not from backend
}


export interface EmployeeFilters {
  department?: string;
  status?: 'active' | 'inactive';
  search?: string;
}
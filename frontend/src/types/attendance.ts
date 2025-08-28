export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  workHours?: number;
  notes?: string;
}

export interface AttendanceSummary {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  avgWorkHours: number;
}

export interface AttendanceFilters {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  status?: AttendanceRecord['status'];
}
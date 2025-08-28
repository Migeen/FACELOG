import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AttendanceRecord } from '@/types/attendance';
import { Employee } from '@/types/employee';
import { api } from '@/lib/api';

const statusColors = {
  present: 'bg-success text-success-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  late: 'bg-warning text-warning-foreground',
  'half-day': 'bg-primary text-primary-foreground'
};

export function AttendanceTable() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceData, employeeData] = await Promise.all([
          api.attendance.getAll(),
          api.employees.getAll()
        ]);
        setAttendance(attendanceData);
        setEmployees(employeeData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold">Today's Attendance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-muted-foreground">Employee</th>
              <th className="text-left py-3 px-6 font-medium text-muted-foreground">Check In</th>
              <th className="text-left py-3 px-6 font-medium text-muted-foreground">Check Out</th>
              <th className="text-left py-3 px-6 font-medium text-muted-foreground">Work Hours</th>
              <th className="text-left py-3 px-6 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {attendance.map((record) => (
              <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                <td className="py-4 px-6 font-medium">
                  {getEmployeeName(record.employeeId)}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {record.checkIn || '-'}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {record.checkOut || '-'}
                </td>
                <td className="py-4 px-6 text-muted-foreground">
                  {record.workHours ? `${record.workHours}h` : '-'}
                </td>
                <td className="py-4 px-6">
                  <Badge className={statusColors[record.status]}>
                    {record.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
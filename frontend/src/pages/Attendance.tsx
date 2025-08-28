import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceRecord } from '@/types/attendance';
import { Employee } from '@/types/employee';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

export default function Attendance() {
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

  const statusColors = {
    present: 'bg-success text-success-foreground',
    absent: 'bg-destructive text-destructive-foreground',
    late: 'bg-warning text-warning-foreground',
    'half-day': 'bg-primary text-primary-foreground'
  };

  const todayAttendance = attendance.filter(record => record.date === '2024-01-15');
  const presentCount = todayAttendance.filter(r => r.status === 'present').length;
  const absentCount = todayAttendance.filter(r => r.status === 'absent').length;
  const lateCount = todayAttendance.filter(r => r.status === 'late').length;
  const totalEmployees = employees.length;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <Card>
            <CardContent className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-xs md:text-sm">
              <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Attendance</h1>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Today's Attendance - {new Date().toLocaleDateString('en-US', { 
            month: 'long',
            day: 'numeric', 
            year: 'numeric'
          })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {attendance.map((record) => (
            <div key={record.id} className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm md:text-lg truncate">
                  {getEmployeeName(record.employeeId)}
                </div>
                {record.checkIn && (
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Check-in: {record.checkIn}
                  </div>
                )}
              </div>
              <Badge className={`${statusColors[record.status]} text-xs flex-shrink-0`}>
                {record.status === 'present' ? 'Present' : 
                 record.status === 'absent' ? 'Absent' : 
                 record.status === 'late' ? 'Present' :
                 'Present'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div>
              <div className="text-xl md:text-3xl font-bold text-success">{presentCount}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Present</div>
            </div>
            <div>
              <div className="text-xl md:text-3xl font-bold text-destructive">{absentCount}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Absent</div>
            </div>
            <div>
              <div className="text-xl md:text-3xl font-bold text-primary">{attendanceRate}%</div>
              <div className="text-xs md:text-sm text-muted-foreground">Rate</div>
            </div>
            <div>
              <div className="text-xl md:text-3xl font-bold">{totalEmployees}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
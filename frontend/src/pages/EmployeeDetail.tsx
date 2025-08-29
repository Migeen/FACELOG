import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/employee";
import { AttendanceRecord } from "@/types/attendance";
import { api } from "@/lib/api";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [employeeData, attendanceData] = await Promise.all([
          api.employees.getById(id),
          api.attendance.getByEmployee(id),
        ]);
        setEmployee(employeeData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const statusColors = {
    present: "bg-success text-success-foreground",
    absent: "bg-destructive text-destructive-foreground",
    late: "bg-warning text-warning-foreground",
    "half-day": "bg-primary text-primary-foreground",
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Employee not found</h3>
            <p className="text-muted-foreground mb-4">
              The requested employee could not be found.
            </p>
            <Link to="/employees">
              <Button>Back to Employees</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6">
      <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <Link to="/employees">
          <Button variant="outline" size="sm" className="text-xs md:text-sm">
            <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
            Employees
          </Button>
        </Link>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">
          {employee.firstName} {employee.lastName}
        </h1>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">
              Employee Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Mail className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm md:text-base truncate">
                {employee.email}
              </span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm md:text-base">{employee.phone}</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm md:text-base">
                Joined: {new Date(employee.hireDate).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-3 md:mt-4">
              <div className="text-xs md:text-sm text-muted-foreground">
                Department:
              </div>
              <div className="font-medium text-sm md:text-base">
                {employee.department}
              </div>
            </div>

            {/* Position */}
            <div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Position:
              </div>
              <div className="font-medium text-sm md:text-base">
                {employee.position}
              </div>
            </div>

            {/* Roll Number */}
            <div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Id:
              </div>
              <div className="font-medium text-sm md:text-base">
                {employee.rollNo}
              </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Check-in:
                </div>
                <div className="font-medium text-sm md:text-base">
                  {employee.checkin}
                </div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Check-out:
                </div>
                <div className="font-medium text-sm md:text-base">
                  {employee.checkout}
                </div>
              </div>
            </div>

            {/* Salary */}
            {employee.salary && (
              <div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Salary:
                </div>
                <div className="font-medium text-sm md:text-base">
                  ${employee.salary.toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-2 md:p-3 border border-border rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm md:text-base">
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {record.checkIn && record.checkOut
                          ? `${record.checkIn} - ${record.checkOut}`
                          : record.checkIn
                          ? `Check in: ${record.checkIn}`
                          : "No check-in recorded"}
                      </div>
                    </div>
                    <Badge
                      className={`${
                        statusColors[record.status]
                      } text-xs flex-shrink-0`}
                    >
                      {record.status === "present"
                        ? "Present"
                        : record.status === "absent"
                        ? "Absent"
                        : record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 md:py-8">
                <p className="text-sm md:text-base text-muted-foreground">
                  No attendance records found
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

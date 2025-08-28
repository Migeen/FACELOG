import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceChart } from "@/components/charts/AttendanceChart";
import { AttendanceTable } from "@/components/table/AttendanceTable";
import { AttendanceSummary } from "@/types/attendance";
import { api } from "@/lib/api";
import { Users, UserCheck, UserX, Clock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.attendance.getSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    fetchSummary();
  }, []);

  const stats = [
    {
      title: "Total Employees",
      value: summary?.totalEmployees || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Present Today",
      value: summary?.presentToday || 0,
      icon: UserCheck,
      color: "text-success",
    },
    {
      title: "Absent Today",
      value: summary?.absentToday || 0,
      icon: UserX,
      color: "text-destructive",
    },
    {
      title: "Avg Work Hours",
      value: summary?.avgWorkHours
        ? `${summary.avgWorkHours.toFixed(1)}h`
        : "0h",
      icon: Clock,
      color: "text-warning",
    },
  ];

  const quickActions = [
    {
      id: "manage-employees",
      label: "Manage Employees",
      description: "Manage Your employees",
      path: "/employees",
      icon: Users,
    },
    {
      id: "track-attendence",
      label: "Track Attendence",
      description: "Track your employees attendence",
      path: "/attendance",
      icon: Clock,
    },
    {
      id: "view-reports",
      label: "View Reports",
      description: "Look into the employees report",
      path: "/attendance/reports",
      icon: FileText,
    },
  ];

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <div className="text-xs md:text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="shadow-card hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:gap-6 xl:grid-cols-3 lg:grid-cols-2">
        <Card className="shadow-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">
              Weekly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px]">
            <AttendanceChart />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm md:text-base">
              Today's Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] flex items-center justify-center">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 md:border-8 border-primary relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    75%
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">
                    Attendance
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-1 lg:grid-cols-1">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mobile = vertical | Web = horizontal scroll */}
            <div className="flex flex-col gap-4 sm:flex-col md:flex-col lg:flex-row lg:gap-40 lg:overflow-x-auton lg:p-6">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => navigate(action.path)}
                  className="w-full lg:min-w-[200px] lg:w-auto p-4 text-left border rounded-lg hover:bg-muted transition-colors lg:px-20"
                >
                  <div className="flex items-center gap-4 lg:py-4">
                    {action.id === "manage-employees" && (
                      <Users className="h-5 w-5 text-primary shrink-0" />
                    )}
                    {action.id === "track-attendence" && (
                      <Clock className="h-5 w-5 text-primary shrink-0" />
                    )}
                    {action.id === "view-reports" && (
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                    )}
                    <span className="truncate">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

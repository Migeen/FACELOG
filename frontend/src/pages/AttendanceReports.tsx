import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { exportToExcel } from '@/utils/export';

export default function AttendanceReports() {
  const summaryStats = [
    { title: 'Average Attendance', value: '88%' },
    { title: 'Total Working Days', value: '22' },
    { title: 'Late Arrivals', value: '8.7%' }
  ];

  const monthlyData = [
    { month: 'January', present: 85, absent: 15, late: 12 },
    { month: 'February', present: 88, absent: 12, late: 8 },
    { month: 'March', present: 92, absent: 8, late: 5 },
    { month: 'April', present: 87, absent: 13, late: 10 }
  ];

    const handleExport = () => {
    // Prepare data for Excel
    const exportData = [
      { Section: "Summary Stats" },
      ...summaryStats.map((s) => ({
        Metric: s.title,
        Value: s.value,
      })),
      { Section: "Monthly Attendance" },
      ...monthlyData.map((m) => ({
        Month: m.month,
        Present: `${m.present}%`,
        Absent: `${m.absent}%`,
        Late: `${m.late}%`,
      })),
    ];

    exportToExcel(exportData, "attendance-report.xlsx", "Report");
  };

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Link to="/attendance">
            <Button variant="outline" size="sm" className="text-xs md:text-sm">
              <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              Attendance
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports</h1>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-xs md:text-sm" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-3 w-3 md:h-4 md:w-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <Card key={stat.title} className="shadow-card">
            <CardContent className="p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-muted-foreground">{stat.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-sm md:text-base">Monthly Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="p-3 md:p-4 bg-muted/20 rounded-lg">
              <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                <h3 className="font-medium text-base md:text-lg">{month.month}</h3>
                <div className="flex flex-col space-y-1 md:flex-row md:gap-4 lg:gap-6 md:space-y-0 text-xs md:text-sm">
                  <span className="text-success">Present: {month.present}%</span>
                  <span className="text-destructive">Absent: {month.absent}%</span>
                  <span className="text-warning">Late: {month.late}%</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
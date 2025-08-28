import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Mon', present: 45, absent: 5, late: 3 },
  { name: 'Tue', present: 48, absent: 2, late: 3 },
  { name: 'Wed', present: 46, absent: 4, late: 3 },
  { name: 'Thu', present: 49, absent: 1, late: 3 },
  { name: 'Fri', present: 47, absent: 3, late: 3 },
  { name: 'Sat', present: 25, absent: 25, late: 3 },
  { name: 'Sun', present: 20, absent: 30, late: 3 }
];

export function AttendanceChart() {
  return (
    <div className="w-full h-full min-h-[200px] md:min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={mockData} 
          margin={{ 
            top: 10, 
            right: 10, 
            left: 10, 
            bottom: 60 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tick={{ fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={10}
            tick={{ fontSize: 10 }}
            width={30}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
              color: 'hsl(var(--card-foreground))',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="present" 
            fill="hsl(var(--primary))" 
            name="Present"
            radius={[1, 1, 0, 0]}
          />
          <Bar 
            dataKey="absent" 
            fill="hsl(var(--muted-foreground))" 
            name="Absent"
            radius={[1, 1, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
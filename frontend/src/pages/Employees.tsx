// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// import { Employee } from '@/types/employee';
// import { api } from '@/lib/api';
// import { Search, Plus, Eye, Users, ArrowLeft, Mail, Phone, Hash } from 'lucide-react';
// import AddEmployeeDialog from '@/components/dialogs/AddEmployeeDialog';

// export default function Employees() {
//   const [employees, setEmployees] = useState<Employee[]>([]);
//   const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const data = await api.employees.getAll();
//         setEmployees(data);
//         setFilteredEmployees(data);
//       } catch (error) {
//         console.error('Failed to fetch employees:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     const filtered = employees.filter(employee =>
//       `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       employee.position.toLowerCase().includes(searchTerm.toLowerCase()) 
//     );
//     setFilteredEmployees(filtered);
//   }, [searchTerm, employees]);

//   const getInitials = (firstName: string, lastName: string) => {
//     return `${firstName[0]}${lastName[0]}`.toUpperCase();
//   };

//   const handleEmployeeAdded = (newEmployee: Employee) => {
//     setEmployees(prev => [...prev, newEmployee]);
//     setFilteredEmployees(prev => [...prev, newEmployee]);
//   };

//   if (loading) {
//     return (
//       <div className="flex-1 space-y-6 p-6">
//         <div className="h-8 bg-muted rounded w-48"></div>
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {[...Array(6)].map((_, i) => (
//             <Card key={i} className="animate-pulse">
//               <CardContent className="p-6">
//                 <div className="space-y-4">
//                   <div className="h-12 w-12 bg-muted rounded-full"></div>
//                   <div className="space-y-2">
//                     <div className="h-4 bg-muted rounded"></div>
//                     <div className="h-3 bg-muted rounded w-2/3"></div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 space-y-4 md:space-y-6 p-4 md:p-6 pt-20 md:pt-6 pb-20 md:pb-6">
//       <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
//         <div className="flex items-center gap-3 md:gap-4">
//           <Link to="/">
//             <Button variant="outline" size="sm" className="text-xs md:text-sm">
//               <ArrowLeft className="mr-2 h-3 w-3 md:h-4 md:w-4" />
//               Dashboard
//             </Button>
//           </Link>
//           <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employees</h1>
//         </div>
//       </div>

//       <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
//         <div className="relative flex-1 max-w-full md:max-w-sm">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search employees..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="pl-10 text-sm"
//           />
//         </div>
//         <AddEmployeeDialog onEmployeeAdded={handleEmployeeAdded} />
//       </div>

//       <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//         {filteredEmployees.map((employee) => (
//           <Card key={employee.id} className="shadow-card hover:shadow-md transition-shadow">
//             <CardContent className="p-4 md:p-6">
//               <div className="text-center">
//                 <h3 className="font-semibold text-lg md:text-xl mb-3 md:mb-4">
//                   {employee.firstName} {employee.lastName}
//                 </h3>
//                 <Badge 
//                   variant={employee.status === 'active' ? 'default' : 'secondary'}
//                   className={`text-xs ${employee.status === 'active' ? 'bg-success text-success-foreground' : ''}`}
//                 >
//                   {employee.status}
//                 </Badge>
//               </div>
//               <div className="mt-3 md:mt-4 space-y-2">
//                 <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
//                   <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//                   <span className="truncate">{employee.email}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
//                   <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//                   <span>{employee.phone}</span>
//                 </div>
//                 <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
//                   <Hash className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//                   <span>Employee id: {employee.rollNo}</span>
//                 </div>
//               </div>
//               <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
//                 <Link to={`/employees/${employee.id}`}>
//                   <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
//                     View Details
//                   </Button>
//                 </Link>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {filteredEmployees.length === 0 && (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <Users className="h-12 w-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-semibold mb-2">No employees found</h3>
//             <p className="text-muted-foreground text-center">
//               {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first employee.'}
//             </p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Employee } from '@/types/employee';
import { Search, Plus, Eye, Users, ArrowLeft, Mail, Phone, Hash } from 'lucide-react';
import AddEmployeeDialog from '@/components/dialogs/AddEmployeeDialog';
import { api } from '@/lib/api';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.employees.getAll();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchEmployees();
}, []);



  useEffect(() => {
    const filtered = employees.filter(employee =>
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const handleEmployeeAdded = (newEmployee: Employee) => {
    setEmployees(prev => [...prev, newEmployee]);
    setFilteredEmployees(prev => [...prev, newEmployee]);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Employees</h1>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <AddEmployeeDialog onEmployeeAdded={handleEmployeeAdded} />
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="shadow-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg md:text-xl mb-3 md:mb-4">
                  {employee.firstName} {employee.lastName}
                </h3>
                <Badge 
                  variant={employee.status === 'active' ? 'default' : 'secondary'}
                  className={`text-xs ${employee.status === 'active' ? 'bg-success text-success-foreground' : ''}`}
                >
                  {employee.status}
                </Badge>
              </div>
              <div className="mt-3 md:mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Hash className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>Employee id: {employee.rollNo}</span>
                </div>
              </div>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                <Link to={`/employees/${employee.id}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No employees found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first employee.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

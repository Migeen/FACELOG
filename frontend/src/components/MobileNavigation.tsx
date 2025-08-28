import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    title: 'Employees',
    href: '/employees',
    icon: Users
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: Clock
  },
  {
    title: 'Reports',
    href: '/attendance/reports',
    icon: FileText
  }
];

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileNavigation({ isOpen, onToggle }: MobileNavigationProps) {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between bg-sidebar border-b border-sidebar-border px-4 md:hidden">
        <h1 className="text-lg font-bold text-sidebar-foreground">
          FaceLog
        </h1>
        <Sheet open={isOpen} onOpenChange={onToggle}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-sidebar-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  FaceLog
                </h1>
                <Button variant="ghost" size="sm" onClick={onToggle} className="text-sidebar-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex-1 space-y-1 p-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onToggle}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
              
              <div className="border-t border-sidebar-border p-4">
                <div className="mb-3 text-sm text-sidebar-foreground">
                  Welcome, {user?.name}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border md:hidden">
        <div className="flex">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 px-2 text-xs transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-sidebar-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
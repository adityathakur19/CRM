import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  ClipboardList,
  Activity,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { cn } from '@lib/utils';
import { UserRole } from '@types/index';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Tasks', href: '/tasks', icon: ClipboardList },
  { name: 'Activities', href: '/activities', icon: Activity },
];

const adminNavigation = [
  { name: 'Users', href: '/users', icon: UserCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, hasRole } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <span className="text-xl font-bold">CRM Pro</span>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )
                        }
                      >
                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              {(hasRole(UserRole.ADMIN, UserRole.MANAGER)) && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-muted-foreground">
                    Administration
                  </div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            cn(
                              'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )
                          }
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              )}

              <li className="mt-auto">
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-foreground">{user?.firstName} {user?.lastName}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-muted-foreground hover:bg-muted hover:text-foreground w-full"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <span className="text-xl font-bold">CRM Pro</span>
          <button onClick={onClose} className="p-2">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="px-4 py-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
            
            {(hasRole(UserRole.ADMIN, UserRole.MANAGER)) && (
              <>
                <li className="pt-4">
                  <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administration
                  </div>
                </li>
                {adminNavigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Droplets,
  Calendar,
  ClipboardList,
  Settings,
  LogOut,
  Heart,
  Activity,
  UserCheck,
  Home,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  donorOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Donors', href: '/donors', icon: <Users className="h-5 w-5" />, adminOnly: true },
  { label: 'Blood Inventory', href: '/inventory', icon: <Droplets className="h-5 w-5" />, adminOnly: true },
  { label: 'Donations', href: '/donations', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'My Profile', href: '/profile', icon: <UserCheck className="h-5 w-5" />, donorOnly: true },
  { label: 'Calendar', href: '/calendar', icon: <Calendar className="h-5 w-5" /> },
  { label: 'Eligibility Check', href: '/eligibility', icon: <Activity className="h-5 w-5" /> },
  { label: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar() {
  const location = useLocation();
  const { signOut, isAdmin, isDonor, user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.donorOnly && !isDonor) return false;
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">BloodLife</h1>
            <p className="text-xs text-muted-foreground">Donation Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {filteredNavItems.map((item, index) => {
            const isActive = location.pathname === item.href;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    'sidebar-link',
                    isActive && 'sidebar-link-active'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t p-4">
          <div className="mb-3 rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {isAdmin ? 'Administrator' : 'Donor'}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

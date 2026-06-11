import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Globe,
  Radio,
  Server,
  Box,
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// یک تابع کوچک برای ترکیب تمیز کلاس‌های Tailwind
function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Programs', path: '/programs', icon: FolderGit2 },
  { name: 'Subdomains', path: '/subdomains', icon: Globe },
  { name: 'Live Subdomains', path: '/live-subdomains', icon: Radio },
  { name: 'HTTP Services', path: '/http-services', icon: Server },
  { name: 'Assets View', path: '/assets', icon: Box },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-surface border-r border-border h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <Globe className="text-accent h-6 w-6" />
          Watchtower
        </h1>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-accent/10 text-accent font-medium" 
                    : "text-primary-muted hover:bg-border/50 hover:text-primary"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
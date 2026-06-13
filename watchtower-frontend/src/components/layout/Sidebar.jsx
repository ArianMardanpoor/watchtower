import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  Globe,
  Radio,
  Server,
  Box,
  Settings,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// تابع ترکیب کلاس‌ها
function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Programs', path: '/programs', icon: FolderGit2 },
  { name: 'Subdomains', path: '/subdomains', icon: Globe },
  { name: 'Live Subdomains', path: '/live', icon: Radio },
  { name: 'HTTP Services', path: '/http', icon: Server },
  { name: 'Assets View', path: '/assets', icon: Box },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-surface/80 backdrop-blur-xl border-r border-border h-full flex flex-col shadow-lg z-20">
      {/* بخش لوگو */}
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0">
        <h1 className="text-xl font-extrabold flex items-center gap-2.5 tracking-tight bg-gradient-to-r from-accent to-[#a371f7] bg-clip-text text-transparent">
          <Globe className="text-accent h-6 w-6 animate-[spin_10s_linear_infinite]" />
          Watchtower
        </h1>
      </div>
      
      {/* لینک‌های ناوبری */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive 
                    ? "bg-accent/10 text-accent font-semibold" 
                    : "text-primary-muted hover:bg-border/30 hover:text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* خط رنگی نشان‌دهنده تب فعال */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full shadow-[0_0_8px_var(--accent)]" />
                  )}
                  {/* افکت بزرگ‌شدن آیکون روی هاور */}
                  <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* بخش پایینی (تنظیمات و پروفایل) */}
      <div className="p-4 border-t border-border/50 shrink-0 space-y-1">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-primary-muted hover:bg-border/30 hover:text-primary transition-all duration-200 group">
          <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-primary-muted hover:bg-danger/10 hover:text-danger transition-all duration-200 group">
          <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
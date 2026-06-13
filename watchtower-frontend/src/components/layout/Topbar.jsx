import React from 'react';
import GlobalSearch from '../search/GlobalSearch';
import { Bell, User } from 'lucide-react';

export default function Topbar() {
  return (
    // استایل هدر شیشه‌ای (Sticky Header)
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 z-10 sticky top-0">
      
      {/* فیلد جستجو */}
      <div className="flex-1 max-w-2xl transition-all duration-300 focus-within:max-w-3xl">
        <GlobalSearch />
      </div>

      {/* اکشن‌های سمت راست */}
      <div className="flex items-center gap-5 ml-4">
        
        {/* بج وضعیت API با افکت نقطه چشمک‌زن (Pulsing Dot) */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#3fb950] bg-[#3fb950]/10 px-3 py-1.5 rounded-full border border-[#3fb950]/20 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3fb950]"></span>
          </span>
          API Connected
        </div>

        {/* خط جداکننده */}
        <div className="h-6 w-px bg-border/80"></div>

        {/* دکمه نوتیفیکیشن با نشان‌گر اعلان جدید */}
        <button className="relative text-primary-muted hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-0.5 flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger border-2 border-surface"></span>
          </span>
        </button>

        {/* آواتار کاربر با یک بردر گرادیانتی جذاب */}
        <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-[#a371f7] p-[2px] hover:scale-105 transition-transform duration-200">
          <div className="w-full h-full bg-surface rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
        </button>
      </div>
    </header>
  );
}
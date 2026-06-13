import React from 'react';
import { Target, Globe, Server, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';

export default function ProgramCard({ program }) {
  // آرایه برای داینامیک کردن لینک‌های پایین کارت
  const links = [
    { name: 'Subs', icon: Globe, path: `/subdomains?program=${program.program_name}` },
    { name: 'Live', icon: Radio, path: `/live?program=${program.program_name}` },
    { name: 'HTTP', icon: Server, path: `/http?program=${program.program_name}` },
  ];

  return (
    <div className="group bg-surface border border-border rounded-xl p-5 flex flex-col transition-all duration-300 hover:shadow-lg hover:border-accent/60 hover:-translate-y-1">
      
      {/* هدر کارت */}
      <div className="flex justify-between items-start mb-5">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2.5 group-hover:text-accent transition-colors">
          <Target className="h-5 w-5 text-accent opacity-80 group-hover:opacity-100" />
          {program.program_name}
        </h3>
        <span className="text-[11px] font-semibold text-primary-muted bg-background px-2.5 py-1 rounded-md border border-border shadow-sm">
          {program.scopes?.length || 0} Scopes
        </span>
      </div>
      
      {/* تاریخ */}
      <div className="text-xs text-primary-muted/80 mb-6 font-medium">
        Added: {formatDate(program.created_date)}
      </div>

      {/* دکمه‌های اکشن (کد تمیز و بدون تکرار) */}
      <div className="mt-auto pt-4 border-t border-border/60 flex gap-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link 
              key={index} 
              to={link.path} 
              className="flex-1 flex justify-center items-center gap-1.5 bg-background hover:bg-accent/10 text-primary-muted hover:text-accent text-xs font-semibold py-2.5 rounded-lg border border-border hover:border-accent/30 transition-all duration-200"
            >
              <Icon className="h-3.5 w-3.5" /> 
              {link.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
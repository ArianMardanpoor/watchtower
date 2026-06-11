import React from 'react';
import { Target, Globe, Server, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';

export default function ProgramCard({ program }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-5 flex flex-col transition-all hover:border-accent/50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          <Target className="h-5 w-5 text-accent" />
          {program.program_name}
        </h3>
        <span className="text-xs text-primary-muted bg-background px-2 py-1 rounded border border-border">
          {program.scopes?.length || 0} Scopes
        </span>
      </div>
      
      <div className="text-xs text-primary-muted mb-4">
        Added: {formatDate(program.created_date)}
      </div>

      <div className="mt-auto pt-4 border-t border-border flex gap-2">
        <Link to={`/subdomains?program=${program.program_name}`} className="flex-1 flex justify-center items-center gap-1 bg-background hover:bg-border/50 text-primary-muted hover:text-primary text-xs py-2 rounded border border-border transition-colors">
          <Globe className="h-3 w-3" /> Subs
        </Link>
        <Link to={`/live?program=${program.program_name}`} className="flex-1 flex justify-center items-center gap-1 bg-background hover:bg-border/50 text-primary-muted hover:text-primary text-xs py-2 rounded border border-border transition-colors">
          <Radio className="h-3 w-3" /> Live
        </Link>
        <Link to={`/http?program=${program.program_name}`} className="flex-1 flex justify-center items-center gap-1 bg-background hover:bg-border/50 text-primary-muted hover:text-primary text-xs py-2 rounded border border-border transition-colors">
          <Server className="h-3 w-3" /> HTTP
        </Link>
      </div>
    </div>
  );
}
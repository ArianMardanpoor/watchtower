import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Globe, Radio, Server, FileText } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { globalSearch } from '../../api/search'; // مطمئن شو مسیر درست باشه
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // کنترل باز و بسته بودن منوی نتایج
  
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 400);
  const navigate = useNavigate();

  // بستن منو در صورت کلیک بیرون از باکس جستجو
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      setIsLoading(true);
      setIsOpen(true);
      globalSearch({ q: debouncedQuery, limit: 5 })
        .then((res) => setResults(res.results))
        .catch(() => setResults(null))
        .finally(() => setIsLoading(false));
    } else {
      setResults(null);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // تنظیم آیکون، رنگ و مسیر (Route) بر اساس نوع دیتا
  const getTypeInfo = (type) => {
    switch (type.toLowerCase()) {
      case 'subdomains':
        return { icon: Globe, path: '/subdomains', color: 'text-accent' };
      case 'live':
        return { icon: Radio, path: '/live-subdomains', color: 'text-[#3fb950]' };
      case 'http':
        return { icon: Server, path: '/http-services', color: 'text-[#58a6ff]' };
      default:
        return { icon: FileText, path: `/${type}`, color: 'text-primary-muted' };
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full group z-50">
      <div className="relative flex items-center transition-all duration-300">
        <Search className="absolute left-3.5 h-4 w-4 text-primary-muted transition-colors group-focus-within:text-accent" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.length >= 3) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 3 && results) setIsOpen(true);
          }}
          placeholder="Search subdomains, URLs, titles... (Min 3 chars)"
          className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-14 py-2.5 text-sm text-primary placeholder:text-primary-muted/70 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 shadow-sm"
        />
        
        <div className="absolute right-3 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : query.length > 0 ? (
            <button 
              onClick={handleClear}
              className="p-1 rounded-md hover:bg-border/80 text-primary-muted hover:text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            // یک راهنمای بصری دکوری شبیه به پنل‌های حرفه‌ای
            <div className="hidden sm:flex items-center gap-1 opacity-70 pointer-events-none">
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px] font-mono text-primary-muted">⌘</kbd>
              <kbd className="bg-surface border border-border px-1.5 py-0.5 rounded text-[10px] font-mono text-primary-muted">K</kbd>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown نتایج */}
      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-surface/95 backdrop-blur-2xl border border-border rounded-xl shadow-2xl z-50 max-h-[450px] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {Object.entries(results).map(([type, items]) => {
            if (!items || items.length === 0) return null;
            const { icon: Icon, path, color } = getTypeInfo(type);
            
            return (
              <div key={type} className="p-2 border-b border-border/50 last:border-0">
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 px-3 pt-2 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {type}
                </div>
                
                <div className="space-y-0.5">
                  {items.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsOpen(false);
                        // فیلتر جستجو را به عنوان query param به صفحه مربوطه می‌فرستیم
                        navigate(`${path}?search=${item.subdomain || item.url || ''}`);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-border/40 rounded-lg truncate transition-colors flex flex-col group/item"
                    >
                      <span className="text-primary group-hover/item:text-accent transition-colors font-medium">
                        {item.url || item.subdomain}
                      </span>
                      {item.title && (
                        <span className="text-xs text-primary-muted truncate mt-0.5 opacity-80 group-hover/item:opacity-100 transition-opacity">
                          {item.title}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* حالت Empty State وقتی هیچ نتیجه‌ای یافت نمی‌شود */}
          {Object.values(results).every(arr => arr.length === 0) && (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="bg-background rounded-full p-4 border border-border/50 shadow-sm">
                <Search className="h-6 w-6 text-primary-muted/50" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">هیچ نتیجه‌ای یافت نشد</p>
                <p className="text-xs text-primary-muted mt-1">عبارت دیگری را جستجو کنید.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
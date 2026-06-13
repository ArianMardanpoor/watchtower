import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    // انتخاب متن با موس (selection) رو هم کاستوم کردیم
    <div className="flex h-screen w-full bg-background text-primary overflow-hidden font-sans selection:bg-accent/30 selection:text-primary">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* یک هاله نوری ملایم در پس‌زمینه برای زیبایی بیشتر */}
        <div className="absolute top-0 right-0 w-full h-96 bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {/* افکت Fade-in نرم برای محتوای صفحات */}
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
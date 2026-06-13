import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Programs from './pages/Programs';
import ProgramDetail from './pages/ProgramDetail';
import Subdomains from './pages/Subdomains';
import LiveSubdomains from './pages/LiveSubdomains';
import HttpServices from './pages/HttpServices';
import Assets from './pages/Assets';

// تنظیمات بهینه برای ریکت کوئری
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // دیتا تا 5 دقیقه تازه در نظر گرفته می‌شود
      refetchOnWindowFocus: false, // جلوگیری از لود مجدد با هر بار تغییر تب مرورگر
      retry: 1, // فقط 1 بار تلاش مجدد در صورت خطای شبکه
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/programs" element={<Programs />} />
            {/* اصلاح نام پارامتر برای همخوانی با useParams */}
            <Route path="/programs/:programName" element={<ProgramDetail />} />
            <Route path="/subdomains" element={<Subdomains />} />
            {/* اصلاح روت‌ها برای همخوانی با لینک‌های داخل برنامه */}
            <Route path="/live" element={<LiveSubdomains />} />
            <Route path="/http" element={<HttpServices />} />
            <Route path="/assets" element={<Assets />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
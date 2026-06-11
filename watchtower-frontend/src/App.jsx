import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Programs from './pages/Programs'
import ProgramDetail from './pages/ProgramDetail'
import Subdomains from './pages/Subdomains'
import LiveSubdomains from './pages/LiveSubdomains'
import HttpServices from './pages/HttpServices'
import Assets from './pages/Assets'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/subdomains" element={<Subdomains />} />
            <Route path="/live-subdomains" element={<LiveSubdomains />} />
            <Route path="/http-services" element={<HttpServices />} />
            <Route path="/assets" element={<Assets />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App

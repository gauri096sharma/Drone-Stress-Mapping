import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/records" element={<Records />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </div>
  );
}

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import Upload from './pages/Upload';
import Analytics from './pages/Analytics';
import ImageAnalysis from './pages/ImageAnalysis';
import SentinelAnalysis from './pages/SentinelAnalysis';
import MLPrediction from './pages/MLPrediction';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/image-analysis" element={<ProtectedRoute><ImageAnalysis /></ProtectedRoute>} />
          <Route path="/sentinel-analysis" element={<ProtectedRoute><SentinelAnalysis /></ProtectedRoute>} />
          <Route path="/ml-prediction" element={<ProtectedRoute><MLPrediction /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
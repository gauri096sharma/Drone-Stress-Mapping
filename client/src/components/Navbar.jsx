import { NavLink, useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-dark text-white' : 'text-slate-700 hover:bg-slate-100'
    }`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-brand-green">
            <Leaf className="h-6 w-6" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
              Precision Agriculture
            </p>
            <h1 className="text-lg font-semibold sm:text-xl">
              Drone based Nutrient and Water stress mapping using multispectral imaging
            </h1>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {user ? (
            <>
              <NavLink to="/" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/records" className={linkClass}>Records</NavLink>
              <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
              <NavLink to="/upload" className={linkClass}>Upload</NavLink>
              <NavLink to="/image-analysis" className={linkClass}>Image Analysis</NavLink>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <NavLink to="/signup" className={linkClass}>Signup</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
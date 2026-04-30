import { NavLink } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-brand-dark text-white' : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-brand-green">
            <Leaf className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Precision Agriculture</p>
            <h1 className="text-lg font-semibold sm:text-xl">Drone based Nutrient and Water stress mapping using multispectral imaging</h1>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <NavLink to="/" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/records" className={linkClass}>Records</NavLink>
          <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
          <NavLink to="/upload" className={linkClass}>Upload</NavLink>
        </nav>
      </div>
    </header>
  );
}

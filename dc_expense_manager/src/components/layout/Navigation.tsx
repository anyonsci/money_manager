import { BarChart3, CreditCard, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export const Navigation = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 w-full border-t border-slate-800 bg-slate-950/95 px-4 py-2.5 backdrop-blur-lg shadow-2xl">
      <div className="mx-auto flex max-w-xl items-center justify-center gap-2 sm:gap-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 scale-[1.02]'
                  : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

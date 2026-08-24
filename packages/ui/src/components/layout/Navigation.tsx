import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, CreditCard, Home } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Quick Entry', icon: Home },
    { to: '/transactions', label: 'Transactions', icon: CreditCard },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 backdrop-blur-lg md:px-8">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'text-brand-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

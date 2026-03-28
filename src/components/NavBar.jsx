import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, MessageSquare, User, PlusCircle } from 'lucide-react';

export default function NavBar({ onCreatePost }) {
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: <Home size={22} />, label: 'Home', exact: true },
    { to: '/map', icon: <Map size={22} />, label: 'AI Map' },
    { to: '/feed', icon: <MessageSquare size={22} />, label: 'Feed' },
    { to: '/profile', icon: <User size={22} />, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop top nav */}
      <nav className="top-nav">
        <div className="top-nav-inner">
          <div className="top-nav-brand" onClick={() => navigate('/')}>
            <span className="brand-dot">●</span> AURA Goa
          </div>
          <div className="top-nav-links">
            {navItems.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => `top-nav-link${isActive ? ' active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <div className="top-nav-actions">
            <div className="wallet-widget" onClick={() => navigate('/profile')}>
              <span className="wallet-leaf">🌿</span>
              <span className="coin-count">1,250</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>AURA</span>
            </div>
            <button className="fab-create" onClick={onCreatePost}>
              <PlusCircle size={18} /> Create Post
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  Boxes,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Add Product', path: '/products/add', icon: PlusCircle },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'Inventory & Stock', path: '/inventory', icon: Boxes },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1100,
          background: '#1f2937',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
        }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        style={{
          width: '260px',
          background: '#0e1424',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            }}
          >
            <Boxes size={22} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.15rem',
                fontWeight: '800',
                background: 'linear-gradient(to right, #ffffff, #93c5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.2,
              }}
            >
              CoreInventory
            </h1>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
              Live MERN Engine
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav
          style={{
            flex: 1,
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#6b7280',
              padding: '0 0.75rem 0.5rem',
              letterSpacing: '0.08em',
            }}
          >
            Main Menu
          </div>

          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  color: isActive ? '#ffffff' : '#9ca3af',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0.05) 100%)'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'var(--transition)',
                })}
              >
                {({ isActive }) => (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon
                        size={19}
                        style={{
                          color: isActive ? '#3b82f6' : '#9ca3af',
                          transition: 'color 0.2s',
                        }}
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight size={16} style={{ color: '#3b82f6' }} />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin Badge Card */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f3f4f6' }}>Admin Portal</div>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                Secure JWT Session
              </div>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .mobile-nav-toggle {
            display: flex !important;
          }
          .sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            box-shadow: 20px 0 40px rgba(0,0,0,0.8);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;

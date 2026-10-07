import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogOut, User as UserIcon, Plus, Bell, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const handleLogout = () => {
    logout();
    showSuccess('Logged out successfully');
    navigate('/login');
  };

  // Convert pathname to readable title
  const getPageTitle = (path) => {
    if (path.includes('/products/add')) return 'Add New Product';
    if (path.includes('/products/') && path.includes('/edit')) return 'Edit Product';
    if (path.includes('/products')) return 'Product Catalog';
    if (path.includes('/categories')) return 'Categories Management';
    if (path.includes('/inventory')) return 'Inventory & Stock Tracker';
    return 'Dashboard Overview';
  };

  return (
    <header
      style={{
        height: '70px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(11, 15, 25, 0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      {/* Current Page Title & Breadcrumb */}
      <div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f9fafb' }}>
          {getPageTitle(location.pathname)}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Home / <span style={{ color: '#3b82f6' }}>{location.pathname.replace('/', '') || 'dashboard'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Add Product Button */}
        <Link
          to="/products/add"
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span>New Product</span>
        </Link>

        {/* User Card & Logout */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 8px 4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f3f4f6', lineHeight: 1.2 }}>
              {user?.name || 'Administrator'}
            </span>
            <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
              {user?.email || 'admin@example.com'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="btn-icon"
            style={{
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              marginLeft: '4px',
              color: '#f87171',
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

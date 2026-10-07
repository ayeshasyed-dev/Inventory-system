import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, productService } from '../services/api';
import StatsCard from '../components/StatsCard';
import StockModal from '../components/StockModal';
import {
  Package,
  Layers,
  Boxes,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  RefreshCw,
  LayoutDashboard,
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getStats();
      if (res.data && res.data.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
      setError('Could not connect to backend server. Make sure the backend is running on http://localhost:5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6', marginBottom: '12px' }} />
        <p>Loading real-time inventory statistics...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LayoutDashboard size={24} style={{ color: '#3b82f6' }} />
            Dashboard Overview
          </h1>
          <p className="page-subtitle">Real-time inventory metrics, low-stock warnings, and activity streams.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchStats} className="btn btn-secondary" title="Refresh metrics">
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to="/products/add" className="btn btn-primary">
            <Plus size={16} /> Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Top KPI Stats */}
      <div className="grid-stats">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts ?? 0}
          subtext="Unique items in catalog"
          icon={Package}
          color="#3b82f6"
        />
        <StatsCard
          title="Total Inventory Stock"
          value={stats?.totalStock ?? 0}
          subtext="Units currently in warehouse"
          icon={Boxes}
          color="#10b981"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats?.lowStockCount ?? 0}
          subtext="Products below threshold"
          icon={AlertTriangle}
          color="#f59e0b"
        />
        <StatsCard
          title="Out of Stock"
          value={stats?.outOfStockCount ?? 0}
          subtext="Items needing urgent restock"
          icon={XCircle}
          color="#ef4444"
        />
      </div>

      {/* Secondary Row: Inventory Valuation + Categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimated Inventory Value (Retail)
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              ${stats?.totalInventoryValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Est. Cost Value: ${stats?.totalCostValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
            </span>
          </div>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <DollarSign size={26} />
          </div>
        </div>

        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.6) 100%)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Categories Configured
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              {stats?.totalCategories ?? 0}
            </div>
            <Link to="/categories" style={{ fontSize: '0.75rem', color: '#c084fc', textDecoration: 'underline' }}>
              Manage Product Categories &rarr;
            </Link>
          </div>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'rgba(192, 132, 252, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc',
            }}
          >
            <Layers size={26} />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Low & Out of Stock Alerts + Recent Stock Transactions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Low & Out of Stock Watchlist */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              Critical Stock Watchlist
            </h3>
            <Link to="/inventory" style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
              View All &rarr;
            </Link>
          </div>

          {(!stats?.lowStockProducts?.length && !stats?.outOfStockProducts?.length) ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#10b981' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>✨</div>
              <p style={{ fontWeight: 600 }}>All items healthy!</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No products are currently low or out of stock.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Out of stock list */}
              {stats?.outOfStockProducts?.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f87171' }}>{item.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category?.name || 'General'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-out_of_stock">0 units</span>
                    <button
                      onClick={() => setSelectedProductForStock(item)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      + Restock
                    </button>
                  </div>
                </div>
              ))}

              {/* Low stock list */}
              {stats?.lowStockProducts?.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fbbf24' }}>{item.name}</div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Min threshold: {item.lowStockThreshold} units
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-low_stock">{item.stock} left</span>
                    <button
                      onClick={() => setSelectedProductForStock(item)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      + Adjust
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inventory Transactions Stream */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} style={{ color: '#38bdf8' }} />
              Recent Inventory Activity
            </h3>
            <Link to="/inventory" style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
              Full Audit Logs &rarr;
            </Link>
          </div>

          {!stats?.recentActivity || stats.recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No inventory transactions recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.recentActivity.map((log) => {
                const isAdd = log.operation === 'add' || log.operation === 'initial';
                const isSubtract = log.operation === 'subtract' || log.operation === 'deleted';
                return (
                  <div
                    key={log._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isAdd ? 'rgba(16, 185, 129, 0.15)' : isSubtract ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: isAdd ? '#10b981' : isSubtract ? '#ef4444' : '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isAdd ? <ArrowUpRight size={16} /> : isSubtract ? <ArrowDownRight size={16} /> : <RefreshCw size={14} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                          {log.productName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {log.notes || `${log.operation.toUpperCase()} operation`} • by {log.userName || 'Admin'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                          color: isAdd ? '#34d399' : isSubtract ? '#f87171' : '#60a5fa',
                        }}
                      >
                        {isAdd ? `+${log.quantity}` : isSubtract ? `-${log.quantity}` : `➔ ${log.newStock}`}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Bars */}
      {stats?.categoryDistribution && stats.categoryDistribution.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} style={{ color: '#a855f7' }} /> Category Distribution & Stock Density
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {stats.categoryDistribution.map((cat) => (
              <div
                key={cat._id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: cat.color || '#3b82f6' }}>{cat.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.count} products</span>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  {cat.totalStock} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>units</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Value: ${cat.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {selectedProductForStock && (
        <StockModal
          product={selectedProductForStock}
          isOpen={!!selectedProductForStock}
          onClose={() => setSelectedProductForStock(null)}
          onSuccess={() => fetchStats()}
        />
      )}
    </div>
  );
};

// Simple Layout Icon helper
const LayoutIcon = ({ size, style }) => (
  <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </svg>
);

export default Dashboard;

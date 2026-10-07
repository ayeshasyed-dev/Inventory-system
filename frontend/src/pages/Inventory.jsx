import React, { useState, useEffect } from 'react';
import { productService, dashboardService } from '../services/api';
import StockModal from '../components/StockModal';
import { useToast } from '../context/ToastContext';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'audit_logs'
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('all');

  // Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { showSuccess, showError } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, logRes] = await Promise.all([
        productService.getAll({ limit: 100 }),
        dashboardService.getStockLogs({ operation: logFilter !== 'all' ? logFilter : undefined }),
      ]);
      setProducts(prodRes.data.data || []);
      setLogs(logRes.data.data || []);
    } catch (err) {
      showError('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [logFilter]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleStockUpdate = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    // Reload logs
    dashboardService.getStockLogs({ operation: logFilter !== 'all' ? logFilter : undefined })
      .then((res) => setLogs(res.data.data || []));
  };

  const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Boxes size={26} style={{ color: '#3b82f6' }} />
            Inventory & Stock Operations
          </h1>
          <p className="page-subtitle">Track warehouse stock levels, execute stock IN/OUT transactions, and review audit trails.</p>
        </div>

        {/* Quick Summary Pill */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL UNITS:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: '#60a5fa' }}>{totalUnits}</strong>
          </div>

          <div
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL VALUE:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>${totalValue.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('inventory')}
          className="btn"
          style={{
            background: activeTab === 'inventory' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'inventory' ? '#60a5fa' : 'var(--text-secondary)',
            borderBottom: activeTab === 'inventory' ? '2px solid #3b82f6' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Boxes size={16} /> Stock Levels & Adjustments
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className="btn"
          style={{
            background: activeTab === 'audit_logs' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: activeTab === 'audit_logs' ? '#60a5fa' : 'var(--text-secondary)',
            borderBottom: activeTab === 'audit_logs' ? '2px solid #3b82f6' : '2px solid transparent',
            borderRadius: '8px 8px 0 0',
          }}
        >
          <Clock size={16} /> Stock Audit Trail ({logs.length})
        </button>
      </div>

      {/* Tab 1: Current Stock Table */}
      {activeTab === 'inventory' && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Filter stock by product or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>

            <button onClick={loadData} className="btn btn-secondary">
              <RefreshCw size={15} /> Refresh Stock
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product & SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock Quantity</th>
                  <th>Stock Status</th>
                  <th>Valuation</th>
                  <th style={{ textAlign: 'right' }}>Quick Operation</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isOut = p.stock <= 0;
                  const isLow = p.stock <= p.lowStockThreshold && p.stock > 0;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f9fafb' }}>{p.name}</div>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                          {p.sku || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: 'rgba(255,255,255,0.05)',
                            color: p.category?.color || '#3b82f6',
                          }}
                        >
                          {p.category?.name || 'General'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: isOut ? '#f87171' : isLow ? '#fbbf24' : '#34d399',
                          }}
                        >
                          {p.stock}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          (Min: {p.lowStockThreshold})
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${p.status}`}>
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ${(p.stock * p.price).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          <Boxes size={14} /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stock Audit Logs */}
      {activeTab === 'audit_logs' && (
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Filter by Type:</span>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              >
                <option value="all">All Operations</option>
                <option value="add">Stock IN (add)</option>
                <option value="subtract">Stock OUT (subtract)</option>
                <option value="set">Manual Audit (set)</option>
                <option value="initial">Initial Setups</option>
              </select>
            </div>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing {logs.length} logged transactions
            </span>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Product</th>
                  <th>Operation</th>
                  <th>Quantity Changed</th>
                  <th>Stock Transition</th>
                  <th>Reason / Notes</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No audit records found matching this filter.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isAdd = log.operation === 'add' || log.operation === 'initial';
                    const isSubtract = log.operation === 'subtract' || log.operation === 'deleted';
                    return (
                      <tr key={log._id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.productName}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: isAdd ? 'rgba(16, 185, 129, 0.15)' : isSubtract ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: isAdd ? '#34d399' : isSubtract ? '#f87171' : '#60a5fa',
                            }}
                          >
                            {log.operation}
                          </span>
                        </td>
                        <td
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: isAdd ? '#34d399' : isSubtract ? '#f87171' : '#60a5fa',
                          }}
                        >
                          {isAdd ? `+${log.quantity}` : isSubtract ? `-${log.quantity}` : log.quantity}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{log.previousStock}</span>
                          {' ➔ '}
                          <strong>{log.newStock}</strong>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {log.notes || '—'}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#f3f4f6' }}>{log.userName || 'Admin'}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {selectedProduct && (
        <StockModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handleStockUpdate}
        />
      )}
    </div>
  );
};

export default Inventory;

import React, { useState } from 'react';
import { productService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { X, Plus, Minus, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StockModal = ({ product, isOpen, onClose, onSuccess }) => {
  const [operation, setOperation] = useState('add');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  if (!isOpen || !product) return null;

  const currentStock = product.stock;
  let simulatedStock = currentStock;

  if (operation === 'add') {
    simulatedStock = currentStock + (Number(quantity) || 0);
  } else if (operation === 'subtract') {
    simulatedStock = Math.max(0, currentStock - (Number(quantity) || 0));
  } else if (operation === 'set') {
    simulatedStock = Number(quantity) || 0;
  }

  const isInvalidSubtract = operation === 'subtract' && (Number(quantity) > currentStock);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity <= 0 && operation !== 'set') {
      showError('Please enter a valid quantity greater than 0');
      return;
    }
    if (isInvalidSubtract) {
      showError(`Cannot remove ${quantity} items. Available stock is only ${currentStock}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await productService.updateStock(product._id, {
        operation,
        quantity: Number(quantity),
        notes,
      });

      showSuccess(`Stock updated: ${currentStock} ➔ ${res.data.data.stock}`);
      onSuccess(res.data.data);
      onClose();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Quick Stock Adjustment</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{product.name}</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Operation Type Switcher */}
            <div>
              <label className="form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className="btn"
                  style={{
                    background: operation === 'add' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: operation === 'add' ? '#34d399' : '#9ca3af',
                    borderColor: operation === 'add' ? '#10b981' : 'var(--border-color)',
                  }}
                >
                  <ArrowUpRight size={16} /> Stock IN
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('subtract')}
                  className="btn"
                  style={{
                    background: operation === 'subtract' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: operation === 'subtract' ? '#f87171' : '#9ca3af',
                    borderColor: operation === 'subtract' ? '#ef4444' : 'var(--border-color)',
                  }}
                >
                  <ArrowDownRight size={16} /> Stock OUT
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('set')}
                  className="btn"
                  style={{
                    background: operation === 'set' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: operation === 'set' ? '#60a5fa' : '#9ca3af',
                    borderColor: operation === 'set' ? '#3b82f6' : 'var(--border-color)',
                  }}
                >
                  <RefreshCw size={14} /> Audit SET
                </button>
              </div>
            </div>

            {/* Current vs New Stock Comparison */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT STOCK</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {currentStock}
                </div>
              </div>

              <div style={{ color: 'var(--text-muted)' }}>➔</div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NEW PROJECTED STOCK</span>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isInvalidSubtract ? '#ef4444' : simulatedStock <= product.lowStockThreshold ? '#f59e0b' : '#10b981',
                  }}
                >
                  {simulatedStock}
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                {operation === 'set' ? 'New Target Stock Quantity' : 'Quantity to ' + (operation === 'add' ? 'Add' : 'Remove')}
              </label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
                required
                style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}
              />

              {/* Quick increment buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                {[1, 5, 10, 25, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuantity((prev) => (operation === 'set' ? num : Number(prev || 0) + num))}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes / Reason */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Audit Reason / Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Supplier shipment arrived / Damaged item / Physical inventory check"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
              />
            </div>

            {isInvalidSubtract && (
              <div style={{ display: 'flex', gap: '8px', color: '#f87171', fontSize: '0.8rem', alignItems: 'center' }}>
                <AlertTriangle size={16} />
                Cannot subtract more units than currently in stock ({currentStock}).
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${operation === 'subtract' ? 'btn-danger' : 'btn-primary'}`}
              disabled={loading || isInvalidSubtract}
            >
              {loading ? 'Updating...' : 'Confirm Stock Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;

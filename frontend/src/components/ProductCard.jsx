import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Trash2, Boxes, AlertTriangle, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import StockModal from './StockModal';

const ProductCard = ({ product, onDelete, onStockUpdate }) => {
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getStatusBadge = (status, stock, lowThreshold) => {
    if (stock <= 0) {
      return <span className="badge badge-out_of_stock">Out of Stock</span>;
    }
    if (stock <= lowThreshold) {
      return <span className="badge badge-low_stock">Low Stock: {stock}</span>;
    }
    return <span className="badge badge-in_stock">In Stock: {stock}</span>;
  };

  const getStockPercentage = (stock, threshold) => {
    const maxReference = Math.max(stock, threshold * 3, 20);
    return Math.min(100, Math.round((stock / maxReference) * 100));
  };

  // Base API image or fallback
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${img}`;
  };

  const imageUrl = getImageUrl(product.image);

  return (
    <>
      <div
        className="glass-card product-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Product Image Banner */}
        <div
          style={{
            height: '180px',
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
            />
          ) : (
            <div style={{ color: '#4b5563', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={32} />
              <span style={{ fontSize: '0.75rem' }}>No Product Image</span>
            </div>
          )}

          {/* Category Pill */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: product.category?.color || '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: product.category?.color || '#3b82f6',
              }}
            />
            {product.category?.name || 'General'}
          </div>

          {/* Status Badge */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            {getStatusBadge(product.status, product.stock, product.lowStockThreshold)}
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                {product.sku || 'SKU-NONE'}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                ${Number(product.price).toFixed(2)}
              </span>
            </div>

            <h3
              title={product.name}
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#f9fafb',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {product.name}
            </h3>

            {product.description && (
              <p
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  height: '2.4em',
                }}
              >
                {product.description}
              </p>
            )}
          </div>

          {/* Stock Level Bar */}
          <div style={{ marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Stock Level</span>
              <span style={{ fontWeight: 600, color: product.stock <= product.lowStockThreshold ? '#f59e0b' : '#10b981' }}>
                {product.stock} units left
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${getStockPercentage(product.stock, product.lowStockThreshold)}%`,
                  height: '100%',
                  background:
                    product.stock <= 0
                      ? '#ef4444'
                      : product.stock <= product.lowStockThreshold
                      ? '#f59e0b'
                      : '#10b981',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Card Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <button
              onClick={() => setStockModalOpen(true)}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
            >
              <Boxes size={15} /> Quick Stock
            </button>

            <Link
              to={`/products/${product._id}/edit`}
              className="btn-icon"
              title="Edit Product"
              style={{ width: '34px', height: '34px' }}
            >
              <Edit3 size={15} />
            </Link>

            <button
              onClick={() => onDelete(product._id, product.name)}
              className="btn-icon"
              title="Delete Product"
              style={{ width: '34px', height: '34px', color: '#f87171' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <StockModal
        product={product}
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSuccess={(updated) => {
          if (onStockUpdate) onStockUpdate(updated);
        }}
      />
    </>
  );
};

export default ProductCard;

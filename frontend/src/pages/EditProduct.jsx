import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Edit3,
  ArrowLeft,
  Upload,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageMode, setImageMode] = useState('file');

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [stockHistory, setStockHistory] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catsRes, prodRes] = await Promise.all([
          categoryService.getAll(),
          productService.getById(id),
        ]);

        setCategories(catsRes.data.data || []);

        const prod = prodRes.data.data;
        if (prod) {
          setName(prod.name || '');
          setSku(prod.sku || '');
          setCategory(prod.category?._id || prod.category || '');
          setPrice(prod.price ?? '');
          setCostPrice(prod.costPrice ?? '');
          setStock(prod.stock ?? '');
          setLowStockThreshold(prod.lowStockThreshold ?? 5);
          setDescription(prod.description || '');
          if (prod.image) {
            const fullImg = prod.image.startsWith('http')
              ? prod.image
              : `http://localhost:5000${prod.image}`;
            setImagePreview(fullImg);
          }
          if (prod.stockHistory) {
            setStockHistory(prod.stockHistory);
          }
        }
      } catch (err) {
        showError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !category || price === '' || stock === '') {
      showError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (imageMode === 'file' && imageFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('sku', sku || undefined);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('costPrice', costPrice || '0');
        formData.append('stock', stock);
        formData.append('lowStockThreshold', lowStockThreshold);
        formData.append('description', description);
        formData.append('image', imageFile);

        await productService.update(id, formData);
      } else {
        await productService.update(id, {
          name: name.trim(),
          sku: sku || undefined,
          category,
          price: Number(price),
          costPrice: costPrice ? Number(costPrice) : 0,
          stock: Number(stock),
          lowStockThreshold: Number(lowStockThreshold),
          description,
          imageUrl: imageMode === 'url' ? imageUrl : undefined,
        });
      }

      showSuccess('Product updated successfully!');
      navigate('/products');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6', marginBottom: '12px' }} />
        <p>Loading product details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <h1 className="page-title">
          <Edit3 size={24} style={{ color: '#3b82f6' }} /> Edit Product: {name}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">SKU / Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Selling Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Update Image</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className="btn-icon"
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      background: imageMode === 'file' ? '#3b82f6' : 'transparent',
                      color: imageMode === 'file' ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className="btn-icon"
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      background: imageMode === 'url' ? '#3b82f6' : 'transparent',
                      color: imageMode === 'url' ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    URL
                  </button>
                </div>
              </div>

              {imageMode === 'file' ? (
                <div
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                  onClick={() => document.getElementById('editProductImg').click()}
                >
                  <input
                    id="editProductImg"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Upload size={24} style={{ color: '#3b82f6', marginBottom: '6px' }} />
                  <p style={{ fontSize: '0.85rem', color: '#f3f4f6' }}>Click to upload replacement image</p>
                </div>
              ) : (
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="form-input"
                />
              )}

              {imagePreview && (
                <div
                  style={{
                    marginTop: '10px',
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label">Description</label>
              <textarea
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/products')}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Stock History Audit for this Product */}
      {stockHistory && stockHistory.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: '#38bdf8' }} /> Audit Log History for this Product
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stockHistory.map((log) => {
              const isAdd = log.operation === 'add' || log.operation === 'initial';
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
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {log.operation.toUpperCase()} ({log.previousStock} ➔ {log.newStock})
                    </span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {log.notes || 'Routine stock change'} • Performed by {log.userName || 'Admin'}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;

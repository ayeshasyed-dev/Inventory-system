import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  PackagePlus,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Info,
  DollarSign,
  Boxes,
  AlertTriangle,
} from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState('file'); // 'file' or 'url'

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getAll();
        const cats = res.data.data || [];
        setCategories(cats);
        if (cats.length > 0) {
          setCategory(cats[0]._id);
        }
      } catch (err) {
        showError('Failed to load categories');
      }
    };
    fetchCats();
  }, []);

  const generateSku = () => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : 'SKU';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix}-${rand}`);
  };

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
      showError('Please fill in all required fields (Name, Category, Price, Stock)');
      return;
    }

    setLoading(true);
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

        await productService.create(formData);
      } else {
        await productService.create({
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

      showSuccess('Product created successfully!');
      navigate('/products');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const profitMargin = price && costPrice && Number(price) > 0
    ? (((Number(price) - Number(costPrice)) / Number(price)) * 100).toFixed(1)
    : null;

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
          <PackagePlus size={26} style={{ color: '#3b82f6' }} /> Add New Product
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Core Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Product Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Wireless Ergonomic Mouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>SKU / Barcode</label>
                <button
                  type="button"
                  onClick={generateSku}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Sparkles size={12} /> Auto-generate
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. SKU-MOU982"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <Link to="/categories" style={{ color: '#3b82f6', fontSize: '0.75rem' }}>
                  + Manage Categories
                </Link>
              </div>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {categories.length === 0 && <option value="">No categories yet (Create one first)</option>}
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Cost Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Selling Price ($) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
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
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {profitMargin !== null && (
              <div style={{ fontSize: '0.8rem', color: Number(profitMargin) > 0 ? '#10b981' : '#ef4444' }}>
                Estimated Margin: <strong>{profitMargin}%</strong>
              </div>
            )}

            {/* Stock and Low Stock Threshold Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Initial Stock <span style={{ color: '#ef4444' }}>*</span>
                </label>
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
                <label className="form-label">Low-Stock Alert Level</label>
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

          {/* Right Column: Image and Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Image Selector Tabs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Product Image</label>
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
                    Upload File
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
                    Image URL
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
                    position: 'relative',
                  }}
                  onClick={() => document.getElementById('productImageInput').click()}
                >
                  <input
                    id="productImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <Upload size={28} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f3f4f6' }}>
                    Click to select product image
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supports PNG, JPG, WEBP (Max 5MB)
                  </span>
                </div>
              ) : (
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  className="form-input"
                />
              )}

              {/* Image Preview Box */}
              {imagePreview && (
                <div
                  style={{
                    marginTop: '10px',
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    position: 'relative',
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

            {/* Description Textarea */}
            <div className="form-group" style={{ margin: 0, flex: 1 }}>
              <label className="form-label">Product Description & Specs</label>
              <textarea
                rows="5"
                placeholder="Key highlights, dimensions, model notes, or warranty info..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-textarea"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Product...' : 'Save & Publish Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

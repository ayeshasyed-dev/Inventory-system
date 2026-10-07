import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';
import StockModal from '../components/StockModal';
import { useToast } from '../context/ToastContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  Boxes,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  const { showSuccess, showError } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        sortBy,
        order: sortOrder,
      };
      const res = await productService.getAll(params);
      setProducts(res.data.data || []);
    } catch (err) {
      showError('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    try {
      await productService.delete(deleteModal.id);
      showSuccess(`"${deleteModal.name}" deleted successfully.`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteModal.id));
      setDeleteModal({ open: false, id: null, name: '' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleStockUpdate = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package size={26} style={{ color: '#3b82f6' }} />
            Product Catalog
          </h1>
          <p className="page-subtitle">Manage, search, and update stock for all items in your inventory.</p>
        </div>

        <Link to="/products/add" className="btn btn-primary">
          <Plus size={16} /> Add New Product
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by name, SKU, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px' }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Dropdown */}
        <div style={{ flex: '0 1 170px' }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-select"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock Alerts</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ flex: '0 1 170px' }}>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, ord] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(ord);
            }}
            className="form-select"
          >
            <option value="createdAt-desc">Newest Added</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {/* View Toggle (Grid / Table) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px',
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            className="btn-icon"
            style={{
              background: viewMode === 'grid' ? '#3b82f6' : 'transparent',
              color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
            }}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className="btn-icon"
            style={{
              background: viewMode === 'table' ? '#3b82f6' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
              border: 'none',
              borderRadius: '6px',
            }}
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6', marginBottom: '12px' }} />
          <p>Filtering products...</p>
        </div>
      ) : products.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}
          >
            <Package size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>No products found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Try adjusting your search criteria or add your first product.
            </p>
          </div>
          <Link to="/products/add" className="btn btn-primary">
            <Plus size={16} /> Add Product Now
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-products">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={(id, name) => setDeleteModal({ open: true, id, name })}
              onStockUpdate={handleStockUpdate}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#1f2937',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {p.image ? (
                          <img
                            src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Package size={20} style={{ color: '#6b7280' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f9fafb' }}>{p.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Threshold: {p.lowStockThreshold} units
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {p.sku || 'N/A'}
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
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{p.stock}</span>
                      <button
                        onClick={() => setSelectedProductForStock(p)}
                        className="btn-icon"
                        title="Quick Stock Change"
                        style={{ width: '26px', height: '26px', padding: '2px' }}
                      >
                        <Boxes size={13} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${p.status}`}>
                      {p.status === 'in_stock' ? 'In Stock' : p.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link
                        to={`/products/${p._id}/edit`}
                        className="btn-icon"
                        title="Edit Product"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: p._id, name: p.name })}
                        className="btn-icon"
                        title="Delete Product"
                        style={{ width: '32px', height: '32px', color: '#f87171' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ open: false, id: null, name: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Confirm Product Deletion
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete <strong style={{ color: '#fff' }}>{deleteModal.name}</strong> from the inventory system?
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                This will also generate a permanent deletion audit log in your inventory records.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal for Table View quick action */}
      {selectedProductForStock && (
        <StockModal
          product={selectedProductForStock}
          isOpen={!!selectedProductForStock}
          onClose={() => setSelectedProductForStock(null)}
          onSuccess={handleStockUpdate}
        />
      )}
    </div>
  );
};

export default Products;

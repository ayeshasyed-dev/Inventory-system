import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Package,
  FolderPlus,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = new, or category object
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '', productCount: 0 });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setColor(cat.color || '#3b82f6');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, {
          name: name.trim(),
          description: description.trim(),
          color,
        });
        showSuccess('Category updated successfully');
      } else {
        await categoryService.create({
          name: name.trim(),
          description: description.trim(),
          color,
        });
        showSuccess('New category created successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await categoryService.delete(deleteModal.id);
      showSuccess(`"${deleteModal.name}" deleted.`);
      setDeleteModal({ open: false, id: null, name: '', productCount: 0 });
      fetchCategories();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Layers size={26} style={{ color: '#3b82f6' }} />
            Category Management
          </h1>
          <p className="page-subtitle">Organize and group your inventory items by department and category.</p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6', marginBottom: '12px' }} />
          <p>Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <FolderPlus size={30} />
          </div>
          <h3>No categories added yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '1.5rem' }}>
            Create your first category to start organizing inventory.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Create Category
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${cat.color || '#3b82f6'}`,
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#f9fafb', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: cat.color || '#3b82f6',
                        display: 'inline-block',
                      }}
                    />
                    {cat.name}
                  </h3>

                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: cat.color || '#3b82f6',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Package size={12} /> {cat.productCount ?? 0} items
                  </span>
                </div>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1.25rem',
                    minHeight: '2.5rem',
                  }}
                >
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Link
                  to={`/products?category=${cat._id}`}
                  style={{
                    fontSize: '0.8rem',
                    color: '#3b82f6',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  View Products <ExternalLink size={13} />
                </Link>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(cat)}
                    className="btn-icon"
                    title="Edit Category"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setDeleteModal({
                        open: true,
                        id: cat._id,
                        name: cat.name,
                        productCount: cat.productCount || 0,
                      })
                    }
                    className="btn-icon"
                    title="Delete Category"
                    style={{ width: '32px', height: '32px', color: '#f87171' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button className="btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Category Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Office Supplies, Electronics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    rows="3"
                    placeholder="Brief details about products in this category..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                {/* Color Tag Selector */}
                <div>
                  <label className="form-label">Badge Tag Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: c,
                          border: color === c ? '2px solid #fff' : '2px solid transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          boxShadow: color === c ? '0 0 10px ' + c : 'none',
                        }}
                      >
                        {color === c && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal-backdrop" onClick={() => setDeleteModal({ open: false, id: null, name: '', productCount: 0 })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} /> Delete Category: {deleteModal.name}
              </h3>
            </div>
            <div className="modal-body">
              {deleteModal.productCount > 0 ? (
                <div style={{ color: '#fca5a5', background: 'rgba(239, 68, 68, 0.15)', padding: '1rem', borderRadius: '8px' }}>
                  <p style={{ fontWeight: 700, marginBottom: '4px' }}>Cannot Delete Category!</p>
                  <p style={{ fontSize: '0.85rem' }}>
                    There are currently <strong>{deleteModal.productCount}</strong> products assigned to this category. Please reassign or remove these products before deleting this category.
                  </p>
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Are you sure you want to delete the category <strong style={{ color: '#fff' }}>{deleteModal.name}</strong>? This action cannot be undone.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteModal({ open: false, id: null, name: '', productCount: 0 })}
              >
                Close
              </button>
              {deleteModal.productCount === 0 && (
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Category
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

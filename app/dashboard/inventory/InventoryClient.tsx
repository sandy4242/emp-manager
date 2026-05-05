'use client';

import { useState } from 'react';
import { InventoryItem, addInventoryItem, updateInventoryStatus } from '@/app/actions/inventory';
import { IconCheck, IconXCircle, IconPlus } from '../../components/Icons';

interface InventoryClientProps {
  initialItems: InventoryItem[];
}

export default function InventoryClient({ initialItems }: InventoryClientProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [filter, setFilter] = useState<'all' | 'available' | 'out_of_stock'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    product_name: '',
    quantity: 1,
    price: 0,
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    setLoadingId(id);
    const result = await updateInventoryStatus(id, status);
    
    if (result.success) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } else {
      alert(result.message);
    }
    
    setLoadingId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const result = await addInventoryItem({
      ...formData,
      status: formData.quantity > 0 ? 'available' : 'out_of_stock',
      image_url: null,
    });

    if (result.success && result.data) {
      setItems([result.data, ...items]);
      setIsAddModalOpen(false);
      setFormData({ product_name: '', quantity: 1, price: 0 });
    } else {
      alert(result.message);
    }
    setIsAdding(false);
  };

  const filteredItems = items.filter((item) => filter === 'all' || item.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
            Inventory Management
          </h1>
          <p style={{ fontSize: 14, color: '#6b6b6b', margin: 0 }}>
            Manage your products, track quantities and update statuses.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <IconPlus size={18} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'available', 'out_of_stock'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: filter === f ? '1px solid #2563eb' : '1px solid #e5e7eb',
              background: filter === f ? '#eff6ff' : '#ffffff',
              color: filter === f ? '#2563eb' : '#4b5563',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>No inventory items found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #f3f4f6',
              }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
                    {item.product_name}
                  </h3>
                  {item.status === 'available' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      <IconCheck size={14} /> Available
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                      <IconXCircle size={14} /> Out of Stock
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 600 }}>Quantity</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>{item.quantity}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', textTransform: 'uppercase', fontWeight: 600 }}>Price</p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>${item.price?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </div>

              {/* Info & Actions */}
              <div style={{ padding: '20px', background: '#f9fafb' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {item.status !== 'out_of_stock' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'out_of_stock')}
                      disabled={loadingId === item.id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        fontWeight: 600,
                        cursor: loadingId === item.id ? 'not-allowed' : 'pointer',
                        opacity: loadingId === item.id ? 0.5 : 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <IconXCircle size={16} /> Mark Out of Stock
                    </button>
                  )}
                  {item.status !== 'available' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'available')}
                      disabled={loadingId === item.id}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#ffffff',
                        border: '1px solid #10b981',
                        color: '#10b981',
                        fontWeight: 600,
                        cursor: loadingId === item.id ? 'not-allowed' : 'pointer',
                        opacity: loadingId === item.id ? 0.5 : 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <IconCheck size={16} /> Mark Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="modal-content animate-fade-in" style={{ width: '100%', maxWidth: '500px', background: '#ffffff', padding: '24px', borderRadius: '16px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Add New Product</h2>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Product Name *</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="input-field"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isAdding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={isAdding}
                >
                  {isAdding ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

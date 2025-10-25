import React, { useState, useEffect } from 'react';

export default function TestPage() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch items from API
  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create new item
  const handleCreateItem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newItemName.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItemName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create item');
      }

      const newItem = await response.json();
      setSuccess(`Item "${newItem.name}" created successfully!`);
      setNewItemName('');
      
      // Refresh the list
      fetchItems();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-title mb-8">API Test Page</h1>

        {/* Create Item Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-title mb-4">Create New Item</h2>
          
          <form onSubmit={handleCreateItem} className="space-y-4">
            <div>
              <label htmlFor="itemName" className="block text-sm font-medium text-body mb-2">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 text-title"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              {loading ? 'Creating...' : 'Create Item'}
            </button>
          </form>

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-title">Items List</h2>
            <button
              onClick={fetchItems}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-100 text-body rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <p className="text-body text-center py-8">Loading items...</p>
          ) : items.length === 0 ? (
            <p className="text-body text-center py-8">No items found. Create one above!</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-title">{item.name}</h3>
                      <p className="text-sm text-body mt-1">
                        ID: {item.id} • Created: {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Info */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-title mb-2">API Endpoint</h3>
          <p className="text-sm text-body">
            <strong>Base URL:</strong> http://localhost:5000/api/items
          </p>
          <div className="mt-3 space-y-1 text-sm text-body">
            <p><strong>GET</strong> /api/items - List all items</p>
            <p><strong>POST</strong> /api/items - Create new item (body: {`{ "name": "..." }`})</p>
            <p><strong>GET</strong> /api/items/:id - Get single item</p>
          </div>
        </div>
      </div>
    </div>
  );
}

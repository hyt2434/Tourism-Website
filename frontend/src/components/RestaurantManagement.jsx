import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { restaurantAPI } from '../api/partnerServices';
import { processImages } from '../utils/imageUpload';

const RestaurantManagement = () => {
  const { translations: t } = useLanguage();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    cuisineType: 'vietnamese',
    operatingHours: '',
    phone: '',
    images: [],
  });

  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    category: 'main_course',
    price: 0,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergens: [],
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantAPI.getAll();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const files = e.target.files;
      const base64Images = await processImages(files);
      setFormData({ ...formData, images: [...formData.images, ...base64Images] });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedRestaurant) {
        await restaurantAPI.update(selectedRestaurant.id, formData);
      } else {
        await restaurantAPI.create(formData);
      }
      setShowForm(false);
      resetForm();
      loadRestaurants();
      alert(t.serviceManagement.saveSuccess);
    } catch (err) {
      alert(t.serviceManagement.errorOccurred + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.serviceManagement.confirmDelete)) return;
    try {
      await restaurantAPI.delete(id);
      loadRestaurants();
      alert(t.serviceManagement.deleteSuccess);
    } catch (err) {
      alert(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address || '',
      city: restaurant.city || '',
      cuisineType: restaurant.cuisineType || 'vietnamese',
      operatingHours: restaurant.operatingHours || '',
      phone: restaurant.phone || '',
      images: [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setSelectedRestaurant(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      cuisineType: 'vietnamese',
      operatingHours: '',
      phone: '',
      images: [],
    });
  };

  const loadMenuItems = async (restaurantId) => {
    try {
      const data = await restaurantAPI.menu.getAll(restaurantId);
      setMenuItems(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedRestaurant) return;
      await restaurantAPI.menu.create(selectedRestaurant.id, menuFormData);
      setShowMenuForm(false);
      resetMenuForm();
      loadMenuItems(selectedRestaurant.id);
      alert(t.serviceManagement.saveSuccess);
    } catch (err) {
      alert(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleMenuDelete = async (itemId) => {
    if (!confirm(t.serviceManagement.confirmDelete)) return;
    try {
      await restaurantAPI.menu.delete(selectedRestaurant.id, itemId);
      loadMenuItems(selectedRestaurant.id);
      alert(t.serviceManagement.deleteSuccess);
    } catch (err) {
      alert(err.message);
    }
  };

  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      description: '',
      category: 'main_course',
      price: 0,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      allergens: [],
    });
  };

  const cuisineTypes = ['vietnamese', 'chinese', 'japanese', 'korean', 'italian', 'french', 'thai', 'indian', 'western', 'seafood'];
  const categories = ['appetizer', 'mainCourse', 'dessert', 'beverage', 'soup', 'salad'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.serviceManagement.restaurants}</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.serviceManagement.addRestaurant}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {/* Restaurant List */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              {restaurant.primaryImage && (
                <img
                  src={restaurant.primaryImage}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{restaurant.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{t.serviceManagement[restaurant.cuisineType] || restaurant.cuisineType}</p>
              <p className="text-gray-500 text-xs mb-2">{restaurant.city}</p>
              <p className="text-sm text-gray-600">{restaurant.operatingHours}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(restaurant)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  {t.serviceManagement.edit}
                </button>
                <button
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    loadMenuItems(restaurant.id);
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  {t.serviceManagement.menuItems}
                </button>
                <button
                  onClick={() => handleDelete(restaurant.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  {t.serviceManagement.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restaurant Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {selectedRestaurant ? t.serviceManagement.editRestaurant : t.serviceManagement.addRestaurant}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.restaurantName} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.city}</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.address}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.restaurantDescription}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.cuisineType}</label>
                <select
                  value={formData.cuisineType}
                  onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {cuisineTypes.map((type) => (
                    <option key={type} value={type}>{t.serviceManagement[type]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.phone}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.operatingHours}</label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., 10:00 - 22:00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.uploadImages}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full border rounded px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">{t.serviceManagement.dragDropImages}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : t.serviceManagement.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                {t.serviceManagement.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Items Modal */}
      {selectedRestaurant && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t.serviceManagement.menuItems} - {selectedRestaurant.name}</h3>
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <button
              onClick={() => setShowMenuForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
            >
              {t.serviceManagement.addMenuItem}
            </button>
            
            {/* Menu Item List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="border rounded p-4">
                  <h4 className="font-bold">{item.name}</h4>
                  <p className="text-xs text-gray-500">{t.serviceManagement[item.category] || item.category}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-lg font-bold text-green-600 mt-2">{item.price?.toLocaleString()} VND</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.isVegetarian && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t.serviceManagement.isVegetarian}
                      </span>
                    )}
                    {item.isVegan && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {t.serviceManagement.isVegan}
                      </span>
                    )}
                    {item.isGlutenFree && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {t.serviceManagement.isGlutenFree}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleMenuDelete(item.id)}
                    className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 w-full"
                  >
                    {t.serviceManagement.delete}
                  </button>
                </div>
              ))}
            </div>

            {/* Menu Item Form */}
            {showMenuForm && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold mb-3">{t.serviceManagement.addMenuItem}</h4>
                <form onSubmit={handleMenuSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.itemName} *</label>
                      <input
                        type="text"
                        value={menuFormData.name}
                        onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.category}</label>
                      <select
                        value={menuFormData.category}
                        onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{t.serviceManagement[cat]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.itemDescription}</label>
                      <textarea
                        value={menuFormData.description}
                        onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.price} (VND)</label>
                      <input
                        type="number"
                        value={menuFormData.price}
                        onChange={(e) => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={menuFormData.isVegetarian}
                            onChange={(e) => setMenuFormData({ ...menuFormData, isVegetarian: e.target.checked })}
                          />
                          <span className="text-sm">{t.serviceManagement.isVegetarian}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={menuFormData.isVegan}
                            onChange={(e) => setMenuFormData({ ...menuFormData, isVegan: e.target.checked })}
                          />
                          <span className="text-sm">{t.serviceManagement.isVegan}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={menuFormData.isGlutenFree}
                            onChange={(e) => setMenuFormData({ ...menuFormData, isGlutenFree: e.target.checked })}
                          />
                          <span className="text-sm">{t.serviceManagement.isGlutenFree}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      {t.serviceManagement.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenuForm(false);
                        resetMenuForm();
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      {t.serviceManagement.cancel}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { restaurantAPI } from '../api/partnerServices';
import { processImages } from '../utils/imageUpload';

const RestaurantManagement = () => {
  const { translations: t } = useLanguage();
  const [restaurants, setRestaurants] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showSetMealForm, setShowSetMealForm] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedSetMeal, setSelectedSetMeal] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [setMeals, setSetMeals] = useState([]);
  const [viewMode, setViewMode] = useState('menu'); // 'menu' or 'setMeals'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    cityId: '',
    cuisineType: 'vietnamese',
    openingTime: '10:00',
    closingTime: '22:00',
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
    allergens: [],
    mealTypes: {
      breakfast: false,
      lunch: false,
      dinner: false,
    },
    images: [],
  });

  const [setMealFormData, setSetMealFormData] = useState({
    name: '',
    description: '',
    mealSession: 'noon',
    menuItemIds: [],
  });

  useEffect(() => {
    loadRestaurants();
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const data = await restaurantAPI.getCities();
      setCities(data);
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

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
      cityId: restaurant.cityId || '',
      cuisineType: restaurant.cuisineType || 'vietnamese',
      openingTime: restaurant.openingTime || '10:00',
      closingTime: restaurant.closingTime || '22:00',
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
      cityId: '',
      cuisineType: 'vietnamese',
      openingTime: '10:00',
      closingTime: '22:00',
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
      
      if (selectedMenuItem) {
        // Update existing menu item
        await restaurantAPI.menu.update(selectedRestaurant.id, selectedMenuItem.id, menuFormData);
      } else {
        // Create new menu item
        await restaurantAPI.menu.create(selectedRestaurant.id, menuFormData);
      }
      
      setShowMenuForm(false);
      setSelectedMenuItem(null);
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

  const handleMenuEdit = (item) => {
    setSelectedMenuItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description || '',
      category: item.category || 'main_course',
      price: item.price || 0,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      isVegetarian: item.isVegetarian || false,
      allergens: item.allergens || [],
      mealTypes: item.mealTypes || {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
      images: [],
    });
    setShowMenuForm(true);
  };

  const resetMenuForm = () => {
    setSelectedMenuItem(null);
    setMenuFormData({
      name: '',
      description: '',
      category: 'main_course',
      price: 0,
      isAvailable: true,
      isVegetarian: false,
      allergens: [],
      mealTypes: {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
      images: [],
    });
  };

  const handleMenuImageUpload = async (e) => {
    try {
      const files = e.target.files;
      const base64Images = await processImages(files);
      setMenuFormData({ ...menuFormData, images: [...menuFormData.images, ...base64Images] });
    } catch (err) {
      alert(err.message);
    }
  };

  const removeMenuImage = (index) => {
    const newImages = menuFormData.images.filter((_, i) => i !== index);
    setMenuFormData({ ...menuFormData, images: newImages });
  };

  // Set Meal Management Functions
  const loadSetMeals = async (restaurantId) => {
    try {
      const data = await restaurantAPI.setMeals.getAll(restaurantId);
      setSetMeals(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSetMealSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedRestaurant) return;
      
      if (selectedSetMeal) {
        await restaurantAPI.setMeals.update(selectedRestaurant.id, selectedSetMeal.id, setMealFormData);
      } else {
        await restaurantAPI.setMeals.create(selectedRestaurant.id, setMealFormData);
      }
      
      setShowSetMealForm(false);
      setSelectedSetMeal(null);
      resetSetMealForm();
      loadSetMeals(selectedRestaurant.id);
      alert('Set meal saved successfully');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSetMealDelete = async (setMealId) => {
    if (!confirm('Are you sure you want to delete this set meal?')) return;
    try {
      await restaurantAPI.setMeals.delete(selectedRestaurant.id, setMealId);
      loadSetMeals(selectedRestaurant.id);
      alert('Set meal deleted successfully');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSetMealEdit = (setMeal) => {
    setSelectedSetMeal(setMeal);
    setSetMealFormData({
      name: setMeal.name,
      description: setMeal.description || '',
      mealSession: setMeal.mealSession || 'noon',
      menuItemIds: setMeal.menuItems?.map(item => item.id) || [],
    });
    setShowSetMealForm(true);
  };

  const resetSetMealForm = () => {
    setSelectedSetMeal(null);
    setSetMealFormData({
      name: '',
      description: '',
      mealSession: 'noon',
      menuItemIds: [],
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
              <p className="text-gray-500 text-xs mb-2">
                {cities.find(c => c.id === restaurant.cityId)?.name || restaurant.cityId}
              </p>
              <p className="text-sm text-gray-600">
                {restaurant.openingTime && restaurant.closingTime
                  ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                  : restaurant.openingHours || ''}
              </p>
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
                    setViewMode('menu');
                    loadMenuItems(restaurant.id);
                    loadSetMeals(restaurant.id);
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  Manage Menu
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
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">{t.serviceManagement.selectCity || 'Select City'}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
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
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.openingTime || 'Opening Time'}</label>
                <input
                  type="time"
                  value={formData.openingTime}
                  onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.closingTime || 'Closing Time'}</label>
                <input
                  type="time"
                  value={formData.closingTime}
                  onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
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

      {/* Menu Management Modal with Tabs */}
      {selectedRestaurant && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Menu Management - {selectedRestaurant.name}</h3>
              <button
                onClick={() => {
                  setSelectedRestaurant(null);
                  setViewMode('menu');
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                onClick={() => setViewMode('menu')}
                className={`px-4 py-2 font-medium ${
                  viewMode === 'menu'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Menu Items
              </button>
              <button
                onClick={() => setViewMode('setMeals')}
                className={`px-4 py-2 font-medium ${
                  viewMode === 'setMeals'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Set Meals (For Tours)
              </button>
            </div>

            {/* Menu Items View */}
            {viewMode === 'menu' && (
              <>
                <button
                  onClick={() => setShowMenuForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
                >
                  {t.serviceManagement.addMenuItem || 'Add Menu Item'}
                </button>
                
                {/* Menu Item List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item.id} className="border rounded p-4">
                  {/* Display menu item images */}
                  {item.images && item.images.length > 0 && (
                    <div className="mb-3">
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
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
                    {item.mealTypes && (
                      <>
                        {item.mealTypes.breakfast && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {t.serviceManagement.breakfast}
                          </span>
                        )}
                        {item.mealTypes.lunch && (
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {t.serviceManagement.lunch}
                          </span>
                        )}
                        {item.mealTypes.dinner && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {t.serviceManagement.dinner}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleMenuEdit(item)}
                      className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      {t.serviceManagement.edit}
                    </button>
                    <button
                      onClick={() => handleMenuDelete(item.id)}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      {t.serviceManagement.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Menu Item Form */}
            {showMenuForm && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold mb-3">
                  {selectedMenuItem ? t.serviceManagement.editMenuItem : t.serviceManagement.addMenuItem}
                </h4>
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
                      <label className="block text-sm font-medium mb-2">{t.serviceManagement.mealTypes || 'Meal Types'}</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={menuFormData.mealTypes.breakfast}
                            onChange={(e) => setMenuFormData({ 
                              ...menuFormData, 
                              mealTypes: { ...menuFormData.mealTypes, breakfast: e.target.checked }
                            })}
                          />
                          <span className="text-sm">{t.serviceManagement.breakfast || 'Breakfast'}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={menuFormData.mealTypes.lunch}
                            onChange={(e) => setMenuFormData({ 
                              ...menuFormData, 
                              mealTypes: { ...menuFormData.mealTypes, lunch: e.target.checked }
                            })}
                          />
                          <span className="text-sm">{t.serviceManagement.lunch || 'Lunch'}</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={menuFormData.mealTypes.dinner}
                            onChange={(e) => setMenuFormData({ 
                              ...menuFormData, 
                              mealTypes: { ...menuFormData.mealTypes, dinner: e.target.checked }
                            })}
                          />
                          <span className="text-sm">{t.serviceManagement.dinner || 'Dinner'}</span>
                        </label>
                      </div>
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
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.uploadImages || 'Upload Dish Images'}</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMenuImageUpload}
                        className="w-full border rounded px-3 py-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">{t.serviceManagement.dragDropImages}</p>
                      
                      {/* Image Preview */}
                      {menuFormData.images.length > 0 && (
                        <div className="mt-3 grid grid-cols-4 gap-2">
                          {menuFormData.images.map((img, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={img} 
                                alt={`Menu item ${index + 1}`} 
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeMenuImage(index)}
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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
            </>
            )}

            {/* Set Meals View */}
            {viewMode === 'setMeals' && (
              <>
                <button
                  onClick={() => setShowSetMealForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
                >
                  Add Set Meal
                </button>

                {/* Set Meal List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {setMeals.map((setMeal) => (
                    <div key={setMeal.id} className="border rounded p-4 bg-gradient-to-br from-blue-50 to-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg">{setMeal.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          setMeal.mealSession === 'morning' ? 'bg-yellow-100 text-yellow-800' :
                          setMeal.mealSession === 'noon' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {setMeal.mealSession === 'morning' ? 'Breakfast' : 
                           setMeal.mealSession === 'noon' ? 'Lunch' : 'Dinner'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{setMeal.description}</p>
                      <div className="bg-white rounded p-2 mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Includes:</p>
                        <ul className="text-sm space-y-1">
                          {setMeal.menuItems && setMeal.menuItems.map((item) => (
                            <li key={item.id} className="flex justify-between">
                              <span>• {item.name}</span>
                              <span className="text-gray-500 text-xs">{item.price?.toLocaleString()} VND</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-lg font-bold text-green-600 mb-2">
                        {setMeal.totalPrice?.toLocaleString()} VND
                        <span className="text-xs text-gray-500 font-normal"> (for 2 people)</span>
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSetMealEdit(setMeal)}
                          className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSetMealDelete(setMeal.id)}
                          className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Set Meal Form */}
                {showSetMealForm && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="font-bold mb-3">
                      {selectedSetMeal ? 'Edit Set Meal' : 'Create New Set Meal'}
                    </h4>
                    <form onSubmit={handleSetMealSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Set Meal Name *</label>
                          <input
                            type="text"
                            value={setMealFormData.name}
                            onChange={(e) => setSetMealFormData({ ...setMealFormData, name: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                            placeholder="e.g., Set Trưa A, Breakfast Combo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Meal Session *</label>
                          <select
                            value={setMealFormData.mealSession}
                            onChange={(e) => setSetMealFormData({ ...setMealFormData, mealSession: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                          >
                            <option value="morning">Morning (Breakfast)</option>
                            <option value="noon">Noon (Lunch)</option>
                            <option value="evening">Evening (Dinner)</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            value={setMealFormData.description}
                            onChange={(e) => setSetMealFormData({ ...setMealFormData, description: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            rows="2"
                            placeholder="Describe the set meal..."
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">Select Dishes for this Set *</label>
                          <div className="border rounded p-3 max-h-60 overflow-y-auto bg-gray-50">
                            {menuItems.length === 0 ? (
                              <p className="text-gray-500 text-sm">No menu items available. Please create menu items first.</p>
                            ) : (
                              <div className="space-y-2">
                                {menuItems.map((item) => (
                                  <label key={item.id} className="flex items-start gap-2 p-2 hover:bg-white rounded cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={setMealFormData.menuItemIds.includes(item.id)}
                                      onChange={(e) => {
                                        const newIds = e.target.checked
                                          ? [...setMealFormData.menuItemIds, item.id]
                                          : setMealFormData.menuItemIds.filter(id => id !== item.id);
                                        setSetMealFormData({ ...setMealFormData, menuItemIds: newIds });
                                      }}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{item.name}</div>
                                      <div className="text-xs text-gray-500">{item.category} - {item.price?.toLocaleString()} VND</div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Selected: {setMealFormData.menuItemIds.length} dish(es). 
                            Total: {menuItems
                              .filter(item => setMealFormData.menuItemIds.includes(item.id))
                              .reduce((sum, item) => sum + (item.price || 0), 0)
                              .toLocaleString()} VND (for 2 people)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button 
                          type="submit" 
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          disabled={setMealFormData.menuItemIds.length === 0}
                        >
                          Save Set Meal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSetMealForm(false);
                            resetSetMealForm();
                          }}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;

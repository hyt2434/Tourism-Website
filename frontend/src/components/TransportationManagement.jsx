import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { transportationAPI } from '../api/partnerServices';
import { processImages } from '../utils/imageUpload';

const TransportationManagement = () => {
  const { translations: t } = useLanguage();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vehicleType: 'car',
    brand: '',
    model: '',
    maxPassengers: 4,
    basePrice: 0,
    pricePerKm: 0,
    pricePerHour: 0,
    features: [],
    phone: '',
    driverName: '',
    defaultPickupLocations: [],
    defaultDropoffLocations: [],
    serviceAreas: [],
    images: [],
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await transportationAPI.getAll();
      setVehicles(data);
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
      if (selectedVehicle) {
        await transportationAPI.update(selectedVehicle.id, formData);
      } else {
        await transportationAPI.create(formData);
      }
      setShowForm(false);
      resetForm();
      loadVehicles();
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
      await transportationAPI.delete(id);
      loadVehicles();
      alert(t.serviceManagement.deleteSuccess);
    } catch (err) {
      alert(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      description: vehicle.description || '',
      vehicleType: vehicle.vehicleType || 'car',
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      maxPassengers: vehicle.maxPassengers || 4,
      basePrice: vehicle.basePrice || 0,
      pricePerKm: vehicle.pricePerKm || 0,
      pricePerHour: vehicle.pricePerHour || 0,
      features: vehicle.features || [],
      phone: vehicle.phone || '',
      driverName: vehicle.driverName || '',
      defaultPickupLocations: vehicle.defaultPickupLocations || [],
      defaultDropoffLocations: vehicle.defaultDropoffLocations || [],
      serviceAreas: vehicle.serviceAreas || [],
      images: [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setSelectedVehicle(null);
    setFormData({
      name: '',
      description: '',
      vehicleType: 'car',
      brand: '',
      model: '',
      maxPassengers: 4,
      basePrice: 0,
      pricePerKm: 0,
      pricePerHour: 0,
      features: [],
      phone: '',
      driverName: '',
      defaultPickupLocations: [],
      defaultDropoffLocations: [],
      serviceAreas: [],
      images: [],
    });
  };

  const handleArrayInput = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData({ ...formData, [field]: items });
  };

  const vehicleTypes = ['car', 'van', 'bus', 'minibus', 'taxi', 'motorcycle', 'bicycle'];
  const featuresList = ['ac', 'wifiFeature', 'gps', 'childSeat', 'wheelchairAccessible', 'luggage'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.serviceManagement.transportation}</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.serviceManagement.addVehicle}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {/* Vehicle List */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              {vehicle.primaryImage && (
                <img
                  src={vehicle.primaryImage}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{vehicle.name}</h3>
              <p className="text-gray-600 text-sm mb-1">
                {t.serviceManagement[vehicle.vehicleType] || vehicle.vehicleType}
              </p>
              <p className="text-gray-500 text-xs mb-2">
                {vehicle.brand} {vehicle.model}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span>👥 {vehicle.maxPassengers} {t.serviceManagement.maxPassengers}</span>
              </div>
              <div className="bg-blue-50 p-2 rounded mb-2">
                <p className="text-sm font-semibold text-blue-900">
                  {t.serviceManagement.basePrice}: {vehicle.basePrice?.toLocaleString()} VND
                </p>
                {vehicle.pricePerKm > 0 && (
                  <p className="text-xs text-blue-700">
                    {vehicle.pricePerKm?.toLocaleString()} VND/km
                  </p>
                )}
                {vehicle.pricePerHour > 0 && (
                  <p className="text-xs text-blue-700">
                    {vehicle.pricePerHour?.toLocaleString()} VND/h
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  {t.serviceManagement.edit}
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  {t.serviceManagement.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {selectedVehicle ? t.serviceManagement.editVehicle : t.serviceManagement.addVehicle}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.vehicleName} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.vehicleType} *</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>{t.serviceManagement[type]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.brand}</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.model}</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.vehicleDescription}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.maxPassengers} *</label>
                <input
                  type="number"
                  value={formData.maxPassengers}
                  onChange={(e) => setFormData({ ...formData, maxPassengers: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.basePrice} (VND) *</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.pricePerKm} (VND)</label>
                <input
                  type="number"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({ ...formData, pricePerKm: parseFloat(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.pricePerHour} (VND)</label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.driverName}</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
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
                <label className="block text-sm font-medium mb-2">{t.serviceManagement.features}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {featuresList.map((feature) => (
                    <label key={feature} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, features: [...formData.features, feature] });
                          } else {
                            setFormData({ ...formData, features: formData.features.filter((f) => f !== feature) });
                          }
                        }}
                      />
                      <span className="text-sm">{t.serviceManagement[feature]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.pickupLocations}</label>
                <input
                  type="text"
                  value={formData.defaultPickupLocations.join(', ')}
                  onChange={(e) => handleArrayInput('defaultPickupLocations', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Airport, Hotel, City Center"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.dropoffLocations}</label>
                <input
                  type="text"
                  value={formData.defaultDropoffLocations.join(', ')}
                  onChange={(e) => handleArrayInput('defaultDropoffLocations', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Airport, Hotel, City Center"
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.serviceAreas}</label>
                <input
                  type="text"
                  value={formData.serviceAreas.join(', ')}
                  onChange={(e) => handleArrayInput('serviceAreas', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Da Nang, Hoi An, Hue"
                />
                <p className="text-xs text-gray-500 mt-1">Cities/areas you serve, separate with commas</p>
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
    </div>
  );
};

export default TransportationManagement;

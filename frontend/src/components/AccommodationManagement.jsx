import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { accommodationAPI } from '../api/partnerServices';
import { processImages } from '../utils/imageUpload';

const AccommodationManagement = () => {
  const { translations: t } = useLanguage();
  const toast = useToast();
  const [accommodations, setAccommodations] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    cityId: '',
    starRating: 3,
    amenities: [],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    phone: '',
    images: [],
  });

  const [roomFormData, setRoomFormData] = useState({
    name: '',
    roomType: 'Standard',
    description: '',
    bedType: 'Double',
    maxAdults: 2,
    maxChildren: 1,
    totalRooms: 1,
    roomSize: 0,
    viewType: '',
    amenities: [],
    basePrice: 0,
    weekendPrice: 0,
    holidayPrice: 0,
    deluxeUpgradePrice: 0,
    suiteUpgradePrice: 0,
    currency: 'VND',
    images: [],
  });

  useEffect(() => {
    loadAccommodations();
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const data = await accommodationAPI.getCities();
      setCities(data);
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      const data = await accommodationAPI.getAll();
      setAccommodations(data);
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
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedAccommodation) {
        await accommodationAPI.update(selectedAccommodation.id, formData);
      } else {
        await accommodationAPI.create(formData);
      }
      setShowForm(false);
      resetForm();
      loadAccommodations();
      toast.success(t.serviceManagement.saveSuccess);
    } catch (err) {
      toast.error(t.serviceManagement.errorOccurred + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t.serviceManagement.confirmDelete)) return;
    try {
      await accommodationAPI.delete(id);
      loadAccommodations();
      toast.success(t.serviceManagement.deleteSuccess);
    } catch (err) {
      toast.error(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleEdit = (accommodation) => {
    setSelectedAccommodation(accommodation);
    setFormData({
      name: accommodation.name,
      description: accommodation.description || '',
      address: accommodation.address || '',
      cityId: accommodation.cityId || '',
      starRating: accommodation.starRating || 3,
      amenities: accommodation.amenities || [],
      checkInTime: accommodation.checkInTime || '14:00',
      checkOutTime: accommodation.checkOutTime || '12:00',
      phone: accommodation.phone || '',
      images: [],
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setSelectedAccommodation(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      cityId: '',
      starRating: 3,
      amenities: [],
      checkInTime: '14:00',
      checkOutTime: '12:00',
      phone: '',
      images: [],
    });
  };

  const loadRooms = async (accommodationId) => {
    try {
      const data = await accommodationAPI.rooms.getAll(accommodationId);
      setRooms(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedAccommodation) return;
      
      if (selectedRoom) {
        // Update existing room
        await accommodationAPI.rooms.update(selectedAccommodation.id, selectedRoom.id, roomFormData);
      } else {
        // Create new room
        await accommodationAPI.rooms.create(selectedAccommodation.id, roomFormData);
      }
      
      setShowRoomForm(false);
      setSelectedRoom(null);
      setRoomFormData({
        name: '',
        roomType: 'Standard',
        description: '',
        bedType: 'Double',
        maxAdults: 2,
        maxChildren: 1,
        totalRooms: 1,
        roomSize: 0,
        viewType: '',
        amenities: [],
        basePrice: 0,
        weekendPrice: 0,
        holidayPrice: 0,
        deluxeUpgradePrice: 0,
        suiteUpgradePrice: 0,
        currency: 'VND',
        images: [],
      });
      loadRooms(selectedAccommodation.id);
      toast.success(t.serviceManagement.saveSuccess);
    } catch (err) {
      toast.error(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomFormData({
      name: room.name || '',
      roomType: room.roomType || 'Standard',
      description: room.description || '',
      bedType: room.bedType || 'Double',
      maxAdults: room.maxAdults || 2,
      maxChildren: room.maxChildren || 1,
      totalRooms: room.totalRooms || 1,
      roomSize: room.roomSize || 0,
      viewType: room.viewType || '',
      amenities: room.amenities || [],
      basePrice: room.basePrice || 0,
      weekendPrice: room.weekendPrice || 0,
      holidayPrice: room.holidayPrice || 0,
      deluxeUpgradePrice: room.deluxeUpgradePrice || 0,
      suiteUpgradePrice: room.suiteUpgradePrice || 0,
      currency: room.currency || 'VND',
      images: room.images || [],
    });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm(t.serviceManagement.confirmDelete || 'Are you sure you want to delete this room?')) return;
    
    try {
      await accommodationAPI.rooms.delete(selectedAccommodation.id, roomId);
      loadRooms(selectedAccommodation.id);
      toast.success('Room deleted successfully');
    } catch (err) {
      toast.error('Error deleting room: ' + err.message);
    }
  };

  const handleRoomImageUpload = async (e) => {
    try {
      const files = e.target.files;
      const base64Images = await processImages(files);
      setRoomFormData({ ...roomFormData, images: [...roomFormData.images, ...base64Images] });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeRoomImage = (index) => {
    const newImages = roomFormData.images.filter((_, i) => i !== index);
    setRoomFormData({ ...roomFormData, images: newImages });
  };

  const amenitiesList = ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'spa', 'airConditioning', 'tv', 'minibar', 'balcony'];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.serviceManagement.accommodations}</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          {t.serviceManagement.addAccommodation}
        </button>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded mb-4">{error}</div>}

      {/* Accommodation List */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accommodations.map((acc) => (
            <div key={acc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow hover:shadow-lg transition bg-white dark:bg-gray-800">
              {acc.primaryImage && (
                <img
                  src={acc.primaryImage}
                  alt={acc.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{acc.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                {cities.find(c => c.id === acc.cityId)?.name || acc.cityId}
              </p>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">{'⭐'.repeat(acc.starRating || 0)}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(acc)}
                  className="bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-700 dark:hover:bg-green-800"
                >
                  {t.serviceManagement.edit}
                </button>
                <button
                  onClick={() => {
                    setSelectedAccommodation(acc);
                    loadRooms(acc.id);
                  }}
                  className="bg-purple-600 dark:bg-purple-700 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 dark:hover:bg-purple-800"
                >
                  {t.serviceManagement.rooms}
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="bg-red-600 dark:bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-700 dark:hover:bg-red-800"
                >
                  {t.serviceManagement.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accommodation Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {selectedAccommodation ? t.serviceManagement.editAccommodation : t.serviceManagement.addAccommodation}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.accommodationName} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.city}</label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.address}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.accommodationDescription}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.starRating}</label>
                <select
                  value={formData.starRating}
                  onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>{star} ⭐</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.phone}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.checkInTime}</label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.checkOutTime}</label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t.serviceManagement.amenities}</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                          } else {
                            setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== amenity) });
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      <span className="text-sm">{t.serviceManagement[amenity]}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.uploadImages}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t.serviceManagement.dragDropImages}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : t.serviceManagement.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-500 dark:bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
              >
                {t.serviceManagement.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rooms Modal */}
      {selectedAccommodation && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.serviceManagement.rooms} - {selectedAccommodation.name}</h3>
              <button
                onClick={() => setSelectedAccommodation(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <button
              onClick={() => setShowRoomForm(true)}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700 dark:hover:bg-blue-800"
            >
              {t.serviceManagement.addRoom}
            </button>
            
            {/* Room List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="border border-gray-200 dark:border-gray-700 rounded p-4 flex flex-col h-full bg-white dark:bg-gray-800">
                  {room.images && room.images.length > 0 && (
                    <img src={room.images[0]} alt={room.name} className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <div className="flex-grow">
                    <h4 className="font-bold line-clamp-1 text-gray-900 dark:text-white">{room.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{room.roomType}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t.serviceManagement.bedType}: {room.bedType}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Số người tối đa: {room.maxAdults} adults, {room.maxChildren} children
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">{room.basePrice?.toLocaleString()} VND</p>
                    {room.weekendPrice > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">Weekend: {room.weekendPrice?.toLocaleString()} VND</p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${room.isAvailable ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                        {room.isAvailable ? t.serviceManagement.available : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="flex-1 bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-700 dark:hover:bg-green-800"
                      >
                        {t.serviceManagement.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="flex-1 bg-red-600 dark:bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-700 dark:hover:bg-red-800"
                      >
                        {t.serviceManagement.delete}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Room Form */}
            {showRoomForm && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-bold mb-3 text-gray-900 dark:text-white">{selectedRoom ? (t.serviceManagement.editRoom || 'Edit Room') : t.serviceManagement.addRoom}</h4>
                <form onSubmit={handleRoomSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.roomName || 'Room Name'} *</label>
                      <input
                        type="text"
                        value={roomFormData.name}
                        onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        placeholder="e.g., Deluxe Ocean View"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.description || 'Description'}</label>
                      <textarea
                        value={roomFormData.description}
                        onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows="2"
                        placeholder="Room description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.bedType}</label>
                      <select
                        value={roomFormData.bedType}
                        onChange={(e) => setRoomFormData({ ...roomFormData, bedType: e.target.value })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Double">{t.serviceManagement.doubleBed || 'Double Bed'}</option>
                        <option value="Queen">{t.serviceManagement.queenBed || 'Queen Bed'}</option>
                        <option value="King">{t.serviceManagement.kingBed || 'King Bed'}</option>
                        <option value="Twin">Twin Beds</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Room Type</label>
                      <select
                        value={roomFormData.roomType}
                        onChange={(e) => {
                          const newRoomType = e.target.value;
                          setRoomFormData({ 
                            ...roomFormData, 
                            roomType: newRoomType,
                            maxAdults: newRoomType === 'Standard Quad' ? 4 : 2,
                            maxChildren: newRoomType === 'Standard Quad' ? 2 : 1
                          });
                        }}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Standard">Standard (2 people)</option>
                        <option value="Standard Quad">Standard Quad (4 people)</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Partners can only create Standard rooms</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.maxAdults || 'Max Adults'}</label>
                      <input
                        type="number"
                        value={roomFormData.maxAdults}
                        onChange={(e) => setRoomFormData({ ...roomFormData, maxAdults: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.maxChildren || 'Max Children'}</label>
                      <input
                        type="number"
                        value={roomFormData.maxChildren}
                        onChange={(e) => setRoomFormData({ ...roomFormData, maxChildren: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.totalRooms || 'Total Rooms'}</label>
                      <input
                        type="number"
                        value={roomFormData.totalRooms}
                        onChange={(e) => setRoomFormData({ ...roomFormData, totalRooms: parseInt(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.basePrice || 'Base Price'} (VND) *</label>
                      <input
                        type="number"
                        value={roomFormData.basePrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, basePrice: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.weekendPrice || 'Weekend Price'} (VND)</label>
                      <input
                        type="number"
                        value={roomFormData.weekendPrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, weekendPrice: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.holidayPrice || 'Holiday Price'} (VND)</label>
                      <input
                        type="number"
                        value={roomFormData.holidayPrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, holidayPrice: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Deluxe Upgrade Price (VND)</label>
                      <input
                        type="number"
                        value={roomFormData.deluxeUpgradePrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, deluxeUpgradePrice: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Additional cost to upgrade to Deluxe</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Suite Upgrade Price (VND)</label>
                      <input
                        type="number"
                        value={roomFormData.suiteUpgradePrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, suiteUpgradePrice: parseFloat(e.target.value) })}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Additional cost to upgrade to Suite</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t.serviceManagement.uploadImages || 'Upload Room Images'}</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleRoomImageUpload}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload multiple images for this room</p>
                      
                      {/* Image Preview */}
                      {roomFormData.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {roomFormData.images.map((img, index) => (
                            <div key={index} className="relative">
                              <img src={img} alt={`Room ${index + 1}`} className="w-full h-20 object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => removeRoomImage(index)}
                                className="absolute top-0 right-0 bg-red-600 dark:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700 dark:hover:bg-red-800"
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
                    <button type="submit" className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800">
                      {t.serviceManagement.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoomForm(false);
                        setSelectedRoom(null);
                        setRoomFormData({
                          name: '',
                          roomType: 'Standard',
                          description: '',
                          bedType: 'Double',
                          maxAdults: 2,
                          maxChildren: 1,
                          totalRooms: 1,
                          roomSize: 0,
                          viewType: '',
                          amenities: [],
                          basePrice: 0,
                          weekendPrice: 0,
                          holidayPrice: 0,
                          deluxeUpgradePrice: 0,
                          suiteUpgradePrice: 0,
                          currency: 'VND',
                          images: [],
                        });
                      }}
                      className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
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

export default AccommodationManagement;

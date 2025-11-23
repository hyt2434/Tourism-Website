import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { accommodationAPI } from '../api/partnerServices';
import { processImages } from '../utils/imageUpload';

const AccommodationManagement = () => {
  const { translations: t } = useLanguage();
  const [accommodations, setAccommodations] = useState([]);
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
    city: '',
    starRating: 3,
    amenities: [],
    checkInTime: '14:00',
    checkOutTime: '12:00',
    phone: '',
    images: [],
  });

  const [roomFormData, setRoomFormData] = useState({
    name: '',
    roomType: '',
    description: '',
    bedType: 'double',
    maxAdults: 2,
    maxChildren: 1,
    totalRooms: 1,
    roomSize: 0,
    viewType: '',
    amenities: [],
    basePrice: 0,
    weekendPrice: 0,
    holidayPrice: 0,
    currency: 'VND',
    images: [],
  });

  useEffect(() => {
    loadAccommodations();
  }, []);

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
      alert(err.message);
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
      await accommodationAPI.delete(id);
      loadAccommodations();
      alert(t.serviceManagement.deleteSuccess);
    } catch (err) {
      alert(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleEdit = (accommodation) => {
    setSelectedAccommodation(accommodation);
    setFormData({
      name: accommodation.name,
      description: accommodation.description || '',
      address: accommodation.address || '',
      city: accommodation.city || '',
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
      city: '',
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
      alert(err.message);
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
        roomType: '',
        description: '',
        bedType: 'double',
        maxAdults: 2,
        maxChildren: 1,
        totalRooms: 1,
        roomSize: 0,
        viewType: '',
        amenities: [],
        basePrice: 0,
        weekendPrice: 0,
        holidayPrice: 0,
        currency: 'VND',
        images: [],
      });
      loadRooms(selectedAccommodation.id);
      alert(t.serviceManagement.saveSuccess);
    } catch (err) {
      alert(t.serviceManagement.errorOccurred + ': ' + err.message);
    }
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomFormData({
      name: room.name || '',
      roomType: room.roomType || '',
      description: room.description || '',
      bedType: room.bedType || 'double',
      maxAdults: room.maxAdults || 2,
      maxChildren: room.maxChildren || 1,
      totalRooms: room.totalRooms || 1,
      roomSize: room.roomSize || 0,
      viewType: room.viewType || '',
      amenities: room.amenities || [],
      basePrice: room.basePrice || 0,
      weekendPrice: room.weekendPrice || 0,
      holidayPrice: room.holidayPrice || 0,
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
      alert('Room deleted successfully');
    } catch (err) {
      alert('Error deleting room: ' + err.message);
    }
  };

  const handleRoomImageUpload = async (e) => {
    try {
      const files = e.target.files;
      const base64Images = await processImages(files);
      setRoomFormData({ ...roomFormData, images: [...roomFormData.images, ...base64Images] });
    } catch (err) {
      alert(err.message);
    }
  };

  const removeRoomImage = (index) => {
    const newImages = roomFormData.images.filter((_, i) => i !== index);
    setRoomFormData({ ...roomFormData, images: newImages });
  };

  const amenitiesList = ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'spa', 'airConditioning', 'tv', 'minibar', 'balcony'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.serviceManagement.accommodations}</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t.serviceManagement.addAccommodation}
        </button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

      {/* Accommodation List */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accommodations.map((acc) => (
            <div key={acc.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              {acc.primaryImage && (
                <img
                  src={acc.primaryImage}
                  alt={acc.name}
                  className="w-full h-48 object-cover rounded mb-3"
                />
              )}
              <h3 className="font-bold text-lg mb-2">{acc.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{acc.city}</p>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">{'⭐'.repeat(acc.starRating || 0)}</span>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(acc)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  {t.serviceManagement.edit}
                </button>
                <button
                  onClick={() => {
                    setSelectedAccommodation(acc);
                    loadRooms(acc.id);
                  }}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  {t.serviceManagement.rooms}
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {selectedAccommodation ? t.serviceManagement.editAccommodation : t.serviceManagement.addAccommodation}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.accommodationName} *</label>
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
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.accommodationDescription}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.starRating}</label>
                <select
                  value={formData.starRating}
                  onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>{star} ⭐</option>
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
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.checkInTime}</label>
                <input
                  type="time"
                  value={formData.checkInTime}
                  onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t.serviceManagement.checkOutTime}</label>
                <input
                  type="time"
                  value={formData.checkOutTime}
                  onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">{t.serviceManagement.amenities}</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {amenitiesList.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2">
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
                      />
                      <span className="text-sm">{t.serviceManagement[amenity]}</span>
                    </label>
                  ))}
                </div>
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

      {/* Rooms Modal */}
      {selectedAccommodation && !showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t.serviceManagement.rooms} - {selectedAccommodation.name}</h3>
              <button
                onClick={() => setSelectedAccommodation(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <button
              onClick={() => setShowRoomForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
            >
              {t.serviceManagement.addRoom}
            </button>
            
            {/* Room List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="border rounded p-4 flex flex-col h-full">
                  {room.images && room.images.length > 0 && (
                    <img src={room.images[0]} alt={room.name} className="w-full h-32 object-cover rounded mb-2" />
                  )}
                  <div className="flex-grow">
                    <h4 className="font-bold line-clamp-1">{room.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-1">{room.roomType}</p>
                    <p className="text-sm text-gray-600">{t.serviceManagement.bedType}: {room.bedType}</p>
                    <p className="text-sm text-gray-600">
                      Số người tối đa: {room.maxAdults} adults, {room.maxChildren} children
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-2">{room.basePrice?.toLocaleString()} VND</p>
                    {room.weekendPrice > 0 && (
                      <p className="text-sm text-gray-600">Weekend: {room.weekendPrice?.toLocaleString()} VND</p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="mb-2">
                      <span className={`text-xs px-2 py-1 rounded ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {room.isAvailable ? t.serviceManagement.available : 'Unavailable'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        {t.serviceManagement.edit}
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
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
              <div className="mt-6 border-t pt-4">
                <h4 className="font-bold mb-3">{selectedRoom ? (t.serviceManagement.editRoom || 'Edit Room') : t.serviceManagement.addRoom}</h4>
                <form onSubmit={handleRoomSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.roomName || 'Room Name'} *</label>
                      <input
                        type="text"
                        value={roomFormData.name}
                        onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        required
                        placeholder="e.g., Deluxe Ocean View"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.description || 'Description'}</label>
                      <textarea
                        value={roomFormData.description}
                        onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                        rows="2"
                        placeholder="Room description..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.bedType}</label>
                      <select
                        value={roomFormData.bedType}
                        onChange={(e) => setRoomFormData({ ...roomFormData, bedType: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="single">{t.serviceManagement.singleBed}</option>
                        <option value="double">{t.serviceManagement.doubleBed}</option>
                        <option value="queen">{t.serviceManagement.queenBed}</option>
                        <option value="king">{t.serviceManagement.kingBed}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.maxAdults || 'Max Adults'}</label>
                      <input
                        type="number"
                        value={roomFormData.maxAdults}
                        onChange={(e) => setRoomFormData({ ...roomFormData, maxAdults: parseInt(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.maxChildren || 'Max Children'}</label>
                      <input
                        type="number"
                        value={roomFormData.maxChildren}
                        onChange={(e) => setRoomFormData({ ...roomFormData, maxChildren: parseInt(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.totalRooms || 'Total Rooms'}</label>
                      <input
                        type="number"
                        value={roomFormData.totalRooms}
                        onChange={(e) => setRoomFormData({ ...roomFormData, totalRooms: parseInt(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.basePrice || 'Base Price'} (VND) *</label>
                      <input
                        type="number"
                        value={roomFormData.basePrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, basePrice: parseFloat(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.weekendPrice || 'Weekend Price'} (VND)</label>
                      <input
                        type="number"
                        value={roomFormData.weekendPrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, weekendPrice: parseFloat(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.holidayPrice || 'Holiday Price'} (VND)</label>
                      <input
                        type="number"
                        value={roomFormData.holidayPrice}
                        onChange={(e) => setRoomFormData({ ...roomFormData, holidayPrice: parseFloat(e.target.value) })}
                        className="w-full border rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">{t.serviceManagement.uploadImages || 'Upload Room Images'}</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleRoomImageUpload}
                        className="w-full border rounded px-3 py-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">Upload multiple images for this room</p>
                      
                      {/* Image Preview */}
                      {roomFormData.images.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-3">
                          {roomFormData.images.map((img, index) => (
                            <div key={index} className="relative">
                              <img src={img} alt={`Room ${index + 1}`} className="w-full h-20 object-cover rounded" />
                              <button
                                type="button"
                                onClick={() => removeRoomImage(index)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
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
                        setShowRoomForm(false);
                        setSelectedRoom(null);
                        setRoomFormData({
                          name: '',
                          roomType: '',
                          description: '',
                          bedType: 'double',
                          maxAdults: 2,
                          maxChildren: 1,
                          totalRooms: 1,
                          roomSize: 0,
                          viewType: '',
                          amenities: [],
                          basePrice: 0,
                          weekendPrice: 0,
                          holidayPrice: 0,
                          currency: 'VND',
                          images: [],
                        });
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

export default AccommodationManagement;

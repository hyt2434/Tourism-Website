/**
 * Tour Management Tab Component
 * 
 * Admin interface for creating and managing tours with:
 * - Tour basic information
 * - Daily itinerary builder
 * - Time checkpoints per day (morning/noon/evening)
 * - Service selection (restaurants, accommodation, transportation)
 * - Image upload
 * - Automatic price calculation
 */

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, Save, X, 
  Calendar, MapPin, DollarSign, Image as ImageIcon,
  Clock, UtensilsCrossed, Hotel, Car, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  getAllTours, 
  getTourDetail, 
  createTour, 
  updateTour, 
  deleteTour,
  getAvailableServices,
  calculateTourPrice 
} from '../../api/tours';
import { getCities } from '../../api/cities';

const TIME_PERIODS = ['morning', 'noon', 'evening'];

export default function TourManagementTab() {
  const [tours, setTours] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [availableServices, setAvailableServices] = useState({
    restaurants: [],
    accommodations: [],
    transportation: []
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    description: '',
    destination_city_id: '',
    departure_city_id: '',
    is_active: true,
    is_published: false,
    images: [],
    itinerary: [],
    services: {
      restaurants: [],
      accommodation: null,
      transportation: null
    }
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  useEffect(() => {
    loadTours();
    loadCities();
  }, []);

  useEffect(() => {
    if (formData.destination_city_id) {
      loadAvailableServices();
    }
  }, [formData.destination_city_id, formData.departure_city_id]);

  useEffect(() => {
    if (formData.services) {
      calculatePrice();
    }
  }, [formData.services]);

  const loadTours = async () => {
    setLoading(true);
    try {
      const data = await getAllTours();
      setTours(data);
    } catch (error) {
      console.error('Error loading tours:', error);
      alert('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const data = await getCities();
      setCities(data);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadAvailableServices = async () => {
    try {
      const services = await getAvailableServices(
        formData.destination_city_id,
        formData.departure_city_id
      );
      setAvailableServices(services);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const calculatePrice = async () => {
    try {
      const result = await calculateTourPrice(formData.services);
      setCalculatedPrice(result.total_price);
      setPriceBreakdown(result.breakdown);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      duration: '',
      description: '',
      destination_city_id: '',
      departure_city_id: '',
      is_active: true,
      is_published: false,
      images: [],
      itinerary: [],
      services: {
        restaurants: [],
        accommodation: null,
        transportation: null
      }
    });
    setEditingTour(null);
    setShowForm(false);
    setCalculatedPrice(0);
    setPriceBreakdown(null);
  };

  const handleEdit = async (tour) => {
    try {
      const detail = await getTourDetail(tour.id);
      setEditingTour(detail);
      setFormData({
        name: detail.name,
        duration: detail.duration,
        description: detail.description,
        destination_city_id: detail.destination_city.id,
        departure_city_id: detail.departure_city.id,
        is_active: detail.is_active,
        is_published: detail.is_published,
        images: detail.images || [],
        itinerary: detail.itinerary || [],
        services: detail.services || {
          restaurants: [],
          accommodation: null,
          transportation: null
        }
      });
      setShowForm(true);
    } catch (error) {
      console.error('Error loading tour details:', error);
      alert('Failed to load tour details');
    }
  };

  const handleDelete = async (tourId) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    
    try {
      await deleteTour(tourId);
      alert('Tour deleted successfully');
      loadTours();
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTour) {
        await updateTour(editingTour.id, formData);
        alert('Tour updated successfully');
      } else {
        await createTour(formData);
        alert('Tour created successfully');
      }
      
      resetForm();
      loadTours();
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Failed to save tour: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addDay = () => {
    const newDay = {
      day_number: formData.itinerary.length + 1,
      day_title: '',
      day_summary: '',
      checkpoints: {
        morning: [],
        noon: [],
        evening: []
      }
    };
    setFormData({
      ...formData,
      itinerary: [...formData.itinerary, newDay]
    });
  };

  const removeDay = (dayIndex) => {
    const updatedItinerary = formData.itinerary.filter((_, idx) => idx !== dayIndex);
    // Renumber days
    updatedItinerary.forEach((day, idx) => {
      day.day_number = idx + 1;
    });
    setFormData({
      ...formData,
      itinerary: updatedItinerary
    });
  };

  const updateDay = (dayIndex, field, value) => {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[dayIndex][field] = value;
    setFormData({
      ...formData,
      itinerary: updatedItinerary
    });
  };

  const addCheckpoint = (dayIndex, period) => {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[dayIndex].checkpoints[period].push({
      checkpoint_time: '09:00',
      activity_title: '',
      activity_description: '',
      location: '',
      display_order: updatedItinerary[dayIndex].checkpoints[period].length
    });
    setFormData({
      ...formData,
      itinerary: updatedItinerary
    });
  };

  const removeCheckpoint = (dayIndex, period, checkpointIndex) => {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[dayIndex].checkpoints[period].splice(checkpointIndex, 1);
    setFormData({
      ...formData,
      itinerary: updatedItinerary
    });
  };

  const updateCheckpoint = (dayIndex, period, checkpointIndex, field, value) => {
    const updatedItinerary = [...formData.itinerary];
    updatedItinerary[dayIndex].checkpoints[period][checkpointIndex][field] = value;
    setFormData({
      ...formData,
      itinerary: updatedItinerary
    });
  };

  const addImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData({
        ...formData,
        images: [
          ...formData.images,
          {
            url,
            caption: '',
            display_order: formData.images.length,
            is_primary: formData.images.length === 0
          }
        ]
      });
    }
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const addRestaurant = (dayNumber) => {
    const restaurantId = prompt('Enter restaurant ID:');
    if (restaurantId) {
      setFormData({
        ...formData,
        services: {
          ...formData.services,
          restaurants: [
            ...formData.services.restaurants,
            {
              service_id: parseInt(restaurantId),
              day_number: dayNumber,
              notes: ''
            }
          ]
        }
      });
    }
  };

  if (loading && !showForm) {
    return <div className="p-8 text-center">Loading tours...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tour Management</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Tour
        </Button>
      </div>

      {!showForm ? (
        <div className="grid gap-4">
          {tours.map((tour) => (
            <Card key={tour.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {tour.primary_image && (
                        <img 
                          src={tour.primary_image} 
                          alt={tour.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{tour.name}</h3>
                        <p className="text-sm text-gray-600">{tour.duration}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>From: {tour.departure_city.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span>To: {tour.destination_city.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span>{tour.total_price.toLocaleString()} {tour.currency}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tour.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tour.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tour.is_published ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tour.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(tour)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(tour.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Tour Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Explore Beautiful Da Nang"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    required
                    placeholder="e.g., 3 days 2 nights"
                  />
                </div>
                <div>
                  <Label>Calculated Price</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">{calculatedPrice.toLocaleString()} VND</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={4}
                  placeholder="Describe the tour highlights and key experiences..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_city">Departure City *</Label>
                  <select
                    id="departure_city"
                    value={formData.departure_city_id}
                    onChange={(e) => setFormData({...formData, departure_city_id: parseInt(e.target.value)})}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select departure city</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="destination_city">Destination City *</Label>
                  <select
                    id="destination_city"
                    value={formData.destination_city_id}
                    onChange={(e) => setFormData({...formData, destination_city_id: parseInt(e.target.value)})}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select destination city</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  />
                  Published
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tour Images</CardTitle>
                <Button type="button" onClick={addImage} size="sm">
                  <ImageIcon className="w-4 h-4 mr-2" /> Add Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {formData.images.map((image, idx) => (
                  <div key={idx} className="relative border rounded p-2">
                    <img src={image.url} alt="" className="w-full h-32 object-cover rounded" />
                    <Input
                      value={image.caption || ''}
                      onChange={(e) => {
                        const updated = [...formData.images];
                        updated[idx].caption = e.target.value;
                        setFormData({...formData, images: updated});
                      }}
                      placeholder="Caption"
                      className="mt-2"
                    />
                    {image.is_primary && (
                      <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Itinerary Section */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Daily Itinerary</CardTitle>
                <Button type="button" onClick={addDay} size="sm">
                  <Calendar className="w-4 h-4 mr-2" /> Add Day
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.itinerary.map((day, dayIdx) => (
                <DayEditor
                  key={dayIdx}
                  day={day}
                  dayIndex={dayIdx}
                  onUpdate={updateDay}
                  onRemove={removeDay}
                  onAddCheckpoint={addCheckpoint}
                  onRemoveCheckpoint={removeCheckpoint}
                  onUpdateCheckpoint={updateCheckpoint}
                />
              ))}
            </CardContent>
          </Card>

          {/* Services Section */}
          {formData.destination_city_id && (
            <ServicesEditor
              services={formData.services}
              availableServices={availableServices}
              itinerary={formData.itinerary}
              onChange={(services) => setFormData({...formData, services})}
            />
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" /> 
              {loading ? 'Saving...' : editingTour ? 'Update Tour' : 'Create Tour'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// Day Editor Component
function DayEditor({ day, dayIndex, onUpdate, onRemove, onAddCheckpoint, onRemoveCheckpoint, onUpdateCheckpoint }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <h3 className="font-semibold">Day {day.day_number}</h3>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(dayIndex)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4">
          <Input
            value={day.day_title || ''}
            onChange={(e) => onUpdate(dayIndex, 'day_title', e.target.value)}
            placeholder="Day title (e.g., Arrival and City Tour)"
          />
          <Textarea
            value={day.day_summary || ''}
            onChange={(e) => onUpdate(dayIndex, 'day_summary', e.target.value)}
            placeholder="Brief day summary"
            rows={2}
          />

          {TIME_PERIODS.map(period => (
            <div key={period} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium capitalize">{period}</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onAddCheckpoint(dayIndex, period)}
                >
                  <Plus className="w-3 h-3 mr-1" /> Checkpoint
                </Button>
              </div>

              {day.checkpoints[period].map((checkpoint, cpIdx) => (
                <div key={cpIdx} className="bg-white p-3 rounded mb-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="time"
                      value={checkpoint.checkpoint_time}
                      onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'checkpoint_time', e.target.value)}
                      className="w-32"
                    />
                    <Input
                      value={checkpoint.activity_title}
                      onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'activity_title', e.target.value)}
                      placeholder="Activity title"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveCheckpoint(dayIndex, period, cpIdx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={checkpoint.location || ''}
                    onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'location', e.target.value)}
                    placeholder="Location"
                  />
                  <Textarea
                    value={checkpoint.activity_description || ''}
                    onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'activity_description', e.target.value)}
                    placeholder="Activity description"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Services Editor Component
function ServicesEditor({ services, availableServices, itinerary, onChange }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tour Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Restaurants (one per day) */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4" />
            Restaurants (one per day)
          </h4>
          {itinerary.map((day, idx) => (
            <div key={idx} className="mb-3">
              <Label>Day {day.day_number}</Label>
              <select
                value={services.restaurants.find(r => r.day_number === day.day_number)?.service_id || ''}
                onChange={(e) => {
                  const updated = services.restaurants.filter(r => r.day_number !== day.day_number);
                  if (e.target.value) {
                    updated.push({
                      service_id: parseInt(e.target.value),
                      day_number: day.day_number,
                      notes: ''
                    });
                  }
                  onChange({...services, restaurants: updated});
                }}
                className="w-full p-2 border rounded"
              >
                <option value="">Select restaurant</option>
                {availableServices.restaurants?.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.cuisine_type} ({r.price_range})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Accommodation */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            Accommodation (for entire trip)
          </h4>
          <select
            value={services.accommodation?.service_id || ''}
            onChange={(e) => {
              onChange({
                ...services,
                accommodation: e.target.value ? {
                  service_id: parseInt(e.target.value),
                  notes: ''
                } : null
              });
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select accommodation</option>
            {availableServices.accommodations?.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} - {a.star_rating}★ ({a.min_price.toLocaleString()} - {a.max_price.toLocaleString()} VND)
              </option>
            ))}
          </select>
        </div>

        {/* Transportation */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Car className="w-4 h-4" />
            Transportation (for entire trip)
          </h4>
          <select
            value={services.transportation?.service_id || ''}
            onChange={(e) => {
              onChange({
                ...services,
                transportation: e.target.value ? {
                  service_id: parseInt(e.target.value),
                  notes: ''
                } : null
              });
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select transportation</option>
            {availableServices.transportation?.map(t => (
              <option key={t.id} value={t.id}>
                {t.license_plate} - {t.vehicle_type} {t.brand ? `(${t.brand})` : ''} - {t.max_passengers} pax - {t.base_price.toLocaleString()} VND
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

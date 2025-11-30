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
  Clock, UtensilsCrossed, Hotel, Car, ChevronDown, ChevronUp,
  Upload, Trash, Info, Users, Utensils, Star, RefreshCw,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { 
  getAllTours, 
  getTourDetail, 
  createTour, 
  updateTour, 
  deleteTour,
  getAvailableServices,
  calculateTourPrice,
  syncAllTourPrices
} from '../../api/tours';
import { getCities } from '../../api/cities';
import { useLanguage } from '../../context/LanguageContext';
import { 
  getAllPromotions, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from '../../api/promotions';

// Utility function to process images
const processImages = async (files) => {
  const processedImages = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Convert to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    processedImages.push({
      url: base64,
      caption: '',
      display_order: i,
      is_primary: i === 0
    });
  }
  
  return processedImages;
};

const TIME_PERIODS = ['morning', 'noon', 'evening'];

export default function TourManagementTab() {
  const { translations } = useLanguage();
  const [activeSection, setActiveSection] = useState('tours'); // 'tours' or 'promotions'
  const [tours, setTours] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Promotion filter state
  const [promotionTypeFilter, setPromotionTypeFilter] = useState("all");
  
  // Promotions state
  const [promotions, setPromotions] = useState([]);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [promotionFormData, setPromotionFormData] = useState({
    code: '',
    discount_type: 'percentage', // 'percentage' or 'fixed'
    discount_value: '',
    max_uses: null,
    start_date: '',
    end_date: '',
    conditions: '',
    is_active: true,
    show_on_homepage: false,
    promotion_type: 'promo_code', // 'banner' or 'promo_code'
    title: '',
    subtitle: '',
    image: '',
    highlight: '',
    terms: 'Terms & Conditions apply.'
  });
  const [availableServices, setAvailableServices] = useState({
    restaurants: [],
    accommodations: [],
    transportation: []
  });
  
  const [selectedAccommodationRooms, setSelectedAccommodationRooms] = useState([]);
  const [selectedRestaurantMenus, setSelectedRestaurantMenus] = useState({}); // dayNumber -> menu items
  const [loadingServiceDetails, setLoadingServiceDetails] = useState(false);
  
  // State for selected items (persists across tab switches)
  const [selectedRoomIds, setSelectedRoomIds] = useState([]);
  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState({}); // dayNumber -> array of item IDs

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
    number_of_members: 1,
    services: {
      restaurants: [],
      accommodation: null,
      transportation: null
    }
  });

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  useEffect(() => {
    loadCities();
    loadPromotions();
  }, []);
  
  // Handle page changes
  useEffect(() => {
    loadTours(currentPage, searchQuery);
  }, [currentPage]);
  
  // Debounce search and reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        loadTours(1, searchQuery);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Handle promotion filter changes
  useEffect(() => {
    loadPromotions();
  }, [promotionTypeFilter]);

  useEffect(() => {
    if (formData.destination_city_id) {
      loadAvailableServices();
    }
  }, [formData.destination_city_id, formData.departure_city_id]);

  useEffect(() => {
    console.log('Services changed, triggering price calculation');
    console.log('Current services:', formData.services);
    console.log('Selected rooms:', selectedRoomIds);
    console.log('Selected menu items:', selectedMenuItemIds);
    
    // Calculate if we have any services selected OR any room/menu selections
    const hasAccommodationWithRooms = formData.services?.accommodation && selectedRoomIds.length > 0;
    const hasRestaurantsWithMenus = formData.services?.restaurants?.length > 0 && 
      Object.keys(selectedMenuItemIds).some(day => selectedMenuItemIds[day]?.length > 0);
    const hasTransportation = formData.services?.transportation;
    
    // Calculate if ANY service is selected (even without room/menu details)
    const hasAnyService = hasAccommodationWithRooms || hasRestaurantsWithMenus || hasTransportation;
    
    if (hasAnyService) {
      calculatePrice();
    } else {
      console.log('No services selected, resetting price to 0');
      setCalculatedPrice(0);
      setPriceBreakdown(null);
    }
  }, [
    JSON.stringify(formData.services),
    JSON.stringify(selectedRoomIds),
    JSON.stringify(selectedMenuItemIds)
  ]);

  const loadTours = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const data = await getAllTours(page, pageSize, search);
      setTours(data.tours || []);
      setTotalPages(data.total_pages || 1);
      setTotalTours(data.total || 0);
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
  
  const loadAccommodationRooms = async (accommodationId) => {
    setLoadingServiceDetails(true);
    try {
      // Get user email for authentication
      const userStr = localStorage.getItem('user');
      const userEmail = userStr ? JSON.parse(userStr).email : null;
      
      console.log('Loading rooms for accommodation:', accommodationId);
      console.log('User email:', userEmail);
      
      const url = `/api/admin/tours/service-details/accommodation/${accommodationId}/rooms`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || ''
        },
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}`);
        }
        throw new Error(errorData.error || 'Failed to load rooms');
      }
      
      const data = await response.json();
      console.log('Rooms data:', data);
      setSelectedAccommodationRooms(data || []);
    } catch (error) {
      console.error('Error loading accommodation rooms:', error);
      alert('Failed to load accommodation rooms: ' + error.message);
    } finally {
      setLoadingServiceDetails(false);
    }
  };
  
  const loadRestaurantMenu = async (restaurantId, dayNumber) => {
    setLoadingServiceDetails(true);
    try {
      // Get user email for authentication
      const userStr = localStorage.getItem('user');
      const userEmail = userStr ? JSON.parse(userStr).email : null;
      
      console.log('Loading menu for restaurant:', restaurantId);
      console.log('User email:', userEmail);
      
      const url = `/api/admin/tours/service-details/restaurant/${restaurantId}/menu`;
      console.log('Fetching URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || ''
        },
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Error response:', text);
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch (e) {
          throw new Error(`Server returned ${response.status}: ${text.substring(0, 200)}`);
        }
        throw new Error(errorData.error || 'Failed to load menu');
      }
      
      const data = await response.json();
      console.log('Menu data:', data);
      setSelectedRestaurantMenus(prev => ({
        ...prev,
        [dayNumber]: data || []
      }));
    } catch (error) {
      console.error('Error loading restaurant menu:', error);
      alert('Failed to load restaurant menu: ' + error.message);
    } finally {
      setLoadingServiceDetails(false);
    }
  };

  const calculatePrice = async () => {
    try {
      console.log('Calculating price for services:', formData.services);
      console.log('With selected rooms:', selectedRoomIds);
      console.log('With selected menu items:', selectedMenuItemIds);
      console.log('Duration:', formData.duration);
      
      // Send all data to the API including duration for nights calculation
      const requestData = {
        services: formData.services,
        selectedRooms: selectedRoomIds,
        selectedMenuItems: selectedMenuItemIds,
        duration: formData.duration  // Include duration to calculate number of nights
      };
      
      console.log('Sending to API:', requestData);
      
      const result = await calculateTourPrice(requestData);
      console.log('Price calculation result:', result);
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
      number_of_members: 1,
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
    setSelectedRoomIds([]);
    setSelectedMenuItemIds({});
    setSelectedAccommodationRooms([]);
    setSelectedRestaurantMenus({});
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
        number_of_members: detail.number_of_members || 1,
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
      
      // Set selected rooms and menu items
      setSelectedRoomIds(detail.selectedRooms || []);
      setSelectedMenuItemIds(detail.selectedMenuItems || {});
      
      // Load room details if accommodation is selected
      if (detail.services?.accommodation?.service_id) {
        await loadAccommodationRooms(detail.services.accommodation.service_id);
      }
      
      // Load menu details for each restaurant
      if (detail.services?.restaurants) {
        for (const restaurant of detail.services.restaurants) {
          await loadRestaurantMenu(restaurant.service_id, restaurant.day_number);
        }
      }
      
      setShowForm(true);
    } catch (error) {
      console.error('Error loading tour details:', error);
      alert('Failed to load tour details');
    }
  };

  const handleDelete = async (tourId) => {
    if (!confirm(translations.confirmDeleteTour || 'Are you sure you want to delete this tour?')) return;
    
    try {
      await deleteTour(tourId);
      alert('Tour deleted successfully');
      loadTours(currentPage, searchQuery);
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour');
    }
  };

  const handleSyncAllPrices = async () => {
    if (!confirm('Are you sure you want to sync all tour prices? This will recalculate prices based on current service prices.')) return;
    
    setLoading(true);
    try {
      const result = await syncAllTourPrices();
      alert(`Successfully synced ${result.updated_count} out of ${result.total_tours} tours.${result.errors ? `\n\nErrors: ${result.errors.join('\n')}` : ''}`);
      loadTours(currentPage, searchQuery); // Reload tours to show updated prices
    } catch (error) {
      console.error('Error syncing tour prices:', error);
      alert('Failed to sync tour prices: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Promotions functions
  const loadPromotions = async () => {
    try {
      const data = await getAllPromotions(promotionTypeFilter);
      setPromotions(data);
    } catch (error) {
      console.error('Error loading promotions:', error);
      alert('Failed to load promotions');
    }
  };

  const handlePromotionEdit = (promotion) => {
    setEditingPromotion(promotion);
    
    // Format dates for HTML date input (YYYY-MM-DD format)
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return '';
      // If it's already in YYYY-MM-DD format, return as is
      if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
        return dateValue.split('T')[0]; // Remove time part if present
      }
      // If it's a date string in another format, parse it
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
      return '';
    };
    
    setPromotionFormData({
      code: promotion.code || '',
      discount_type: promotion.discount_type || 'percentage',
      discount_value: promotion.discount_value || '',
      max_uses: promotion.max_uses || null,
      start_date: formatDateForInput(promotion.start_date),
      end_date: formatDateForInput(promotion.end_date),
      conditions: promotion.conditions || '',
      is_active: promotion.is_active !== undefined ? promotion.is_active : true,
      show_on_homepage: promotion.show_on_homepage || false,
      promotion_type: promotion.promotion_type || 'promo_code',
      title: promotion.title || '',
      subtitle: promotion.subtitle || '',
      image: promotion.image || '',
      highlight: promotion.highlight || '',
      terms: promotion.terms || 'Terms & Conditions apply.'
    });
    setShowPromotionForm(true);
  };

  const handlePromotionDelete = async (promotionId) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;
    
    try {
      await deletePromotion(promotionId);
      alert('Promotion deleted successfully');
      loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Failed to delete promotion');
    }
  };

  const handlePromotionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, promotionFormData);
        alert('Promotion updated successfully');
      } else {
        await createPromotion(promotionFormData);
        alert('Promotion created successfully');
      }
      
      setShowPromotionForm(false);
      setEditingPromotion(null);
      setPromotionFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        max_uses: null,
        start_date: '',
        end_date: '',
        conditions: '',
        is_active: true,
        show_on_homepage: false,
        promotion_type: 'promo_code',
        title: '',
        subtitle: '',
        image: '',
        highlight: '',
        terms: 'Terms & Conditions apply.'
      });
      loadPromotions();
    } catch (error) {
      console.error('Error saving promotion:', error);
      alert('Failed to save promotion: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data with selected items
      const tourData = {
        ...formData,
        selectedRooms: selectedRoomIds,
        selectedMenuItems: selectedMenuItemIds
      };
      
      if (editingTour) {
        await updateTour(editingTour.id, tourData);
        alert('Tour updated successfully');
      } else {
        await createTour(tourData);
        alert('Tour created successfully');
      }
      
      resetForm();
      loadTours(currentPage, searchQuery);
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
  
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      const processedImages = await processImages(files);
      setFormData({
        ...formData,
        images: [...formData.images, ...processedImages]
      });
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images');
    }
  };

  const removeImage = (index) => {
    const updatedImages = formData.images.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const setPrimaryImage = (index) => {
    const updatedImages = formData.images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }));
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
    return <div className="p-8 text-center">{translations.loadingTours || "Loading tours..."}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.tourManagement || "Tour Management"}</h2>
        {activeSection === 'tours' && !showForm && (
          <div className="flex gap-3">
            <Button 
              onClick={handleSyncAllPrices}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
              Sync All Tour Prices
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {translations.createNewTour || "Create New Tour"}
            </Button>
          </div>
        )}
        {activeSection === 'promotions' && !showPromotionForm && (
          <Button 
            onClick={() => setShowPromotionForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create New Promotion
          </Button>
        )}
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        {/* Tours Section */}
        <TabsContent value="tours" className="mt-0">
          {!showForm ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tours by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </div>
          
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
                        <span>{translations.from || "From"}: {tour.departure_city.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span>{translations.to || "To"}: {tour.destination_city.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span>{tour.total_price.toLocaleString()} {tour.currency}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          tour.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {tour.is_active ? (translations.active || 'Active') : (translations.inactive || 'Inactive')}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          tour.is_published ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tour.is_published ? (translations.published || 'Published') : (translations.draft || 'Draft')}
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
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTours)} of {totalTours} tours
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-9 w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 gap-2 mb-6">
              <TabsTrigger value="basic" className="px-4 py-3">{translations.basicInfo || "Basic Info"}</TabsTrigger>
              <TabsTrigger value="images" className="px-4 py-3">{translations.tourImages || "Images"}</TabsTrigger>
              <TabsTrigger value="itinerary" className="px-4 py-3">{translations.dailyItinerary || "Itinerary"}</TabsTrigger>
              <TabsTrigger value="services" className="px-4 py-3">{translations.tourServices || "Services"}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{translations.tourInformation || "Tour Information"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">{translations.tourName || "Tour Name"} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="h-11"
                      placeholder={translations.tourNamePlaceholder || "e.g., Explore Beautiful Da Nang"}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-sm font-medium">{translations.duration || "Duration"} *</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        required
                        className="h-11"
                        placeholder={translations.durationPlaceholder || "e.g., 3 days 2 nights"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number_of_members" className="text-sm font-medium">{translations.numberOfMembers || "Number of Members"} *</Label>
                      <Input
                        id="number_of_members"
                        type="number"
                        min="1"
                        value={formData.number_of_members}
                        onChange={(e) => setFormData({...formData, number_of_members: parseInt(e.target.value) || 1})}
                        required
                        className="h-11"
                        placeholder={translations.numberOfMembersPlaceholder || "e.g., 4"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{translations.calculatedPriceTotal || "Calculated Price (Total)"}</Label>
                      <div className="flex items-center gap-3 h-11 px-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-md border border-green-200/60 shadow-sm">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-700 text-base">{calculatedPrice.toLocaleString()} VND</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">{translations.tourDescriptionLabel || "Description"} *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                      rows={5}
                      className="resize-none"
                      placeholder={translations.tourDescriptionPlaceholder || "Describe the tour highlights and key experiences..."}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="departure_city" className="text-sm font-medium">{translations.departureCity || "Departure City"} *</Label>
                      <select
                        id="departure_city"
                        value={formData.departure_city_id}
                        onChange={(e) => setFormData({...formData, departure_city_id: parseInt(e.target.value)})}
                        required
                        className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">{translations.selectDepartureCity || "Select departure city"}</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination_city" className="text-sm font-medium">{translations.destinationCity || "Destination City"} *</Label>
                      <select
                        id="destination_city"
                        value={formData.destination_city_id}
                        onChange={(e) => setFormData({...formData, destination_city_id: parseInt(e.target.value)})}
                        required
                        className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">{translations.selectDestinationCity || "Select destination city"}</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-8 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium group-hover:text-gray-700 transition-colors">{translations.active || "Active"}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-medium group-hover:text-gray-700 transition-colors">{translations.published || "Published"}</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-6 mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <ImageIcon className="w-5 h-5" />
                    {translations.tourImages || "Tour Images"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <Upload className="w-14 h-14 mx-auto mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <p className="text-lg font-semibold text-gray-700 mb-2">{translations.clickOrDragImages || "Click or drag images here"}</p>
                      <p className="text-sm text-gray-500">{translations.uploadMultipleImages || "Upload multiple images (JPG, PNG, WebP)"}</p>
                    </label>
                  </div>

                  {/* Image Grid */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-6">
                      {formData.images.map((image, idx) => (
                        <div key={idx} className={`relative group border-2 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-200 ${
                          image.is_primary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                        }`}>
                          <img 
                            src={image.url} 
                            alt={image.caption || `Image ${idx + 1}`} 
                            className="w-full h-52 object-cover"
                          />
                          {image.is_primary && (
                            <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              {translations.primaryImage || "Primary Image"}
                            </span>
                          )}
                          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant={image.is_primary ? "default" : "secondary"}
                              size="sm"
                              className={`shadow-md ${image.is_primary ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                              onClick={() => setPrimaryImage(idx)}
                              title={translations.setAsPrimary || "Set as primary image"}
                            >
                              <Star className={`w-4 h-4 ${image.is_primary ? 'fill-white' : ''}`} />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="shadow-md"
                              onClick={() => removeImage(idx)}
                              title={translations.removeImage || "Remove image"}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="p-4 bg-white border-t border-gray-100">
                            <Input
                              value={image.caption || ''}
                              onChange={(e) => {
                                const updated = [...formData.images];
                                updated[idx].caption = e.target.value;
                                setFormData({...formData, images: updated});
                              }}
                              placeholder="Add caption..."
                              className="text-sm h-9"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6 mt-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Calendar className="w-5 h-5" />
                      {translations.dailyItinerary || "Daily Itinerary"}
                    </CardTitle>
                    <Button type="button" onClick={addDay} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" /> {translations.addDay || "Add Day"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
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
            </TabsContent>

            <TabsContent value="services" className="space-y-6 mt-6">
              {formData.destination_city_id ? (
                <ServicesEditor
                  services={formData.services}
                  availableServices={availableServices}
                  itinerary={formData.itinerary}
                  onChange={(services) => setFormData({...formData, services})}
                  onLoadAccommodationRooms={loadAccommodationRooms}
                  onLoadRestaurantMenu={loadRestaurantMenu}
                  selectedRooms={selectedAccommodationRooms}
                  selectedMenus={selectedRestaurantMenus}
                  loadingDetails={loadingServiceDetails}
                  departureCityId={formData.departure_city_id}
                  destinationCityId={formData.destination_city_id}
                  cities={cities}
                  selectedRoomIds={selectedRoomIds}
                  setSelectedRoomIds={setSelectedRoomIds}
                  selectedMenuItemIds={selectedMenuItemIds}
                  setSelectedMenuItemIds={setSelectedMenuItemIds}
                />
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="p-12 text-center text-gray-500">
                    <Info className="w-14 h-14 mx-auto mb-4 text-gray-400" />
                    <p className="text-base">{translations.pleaseSelectCities || "Please select departure and destination cities first"}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm p-6 border-t border-gray-200 shadow-lg mt-8">
            <Button type="button" variant="outline" onClick={resetForm} className="gap-2 min-w-[120px] h-11">
              <X className="w-4 h-4" /> {translations.cancel || "Cancel"}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[150px] h-11 gap-2">
              <Save className="w-4 h-4" /> 
              {loading ? (translations.saving || 'Saving...') : editingTour ? (translations.updateTour || 'Update Tour') : (translations.createTour || 'Create Tour')}
            </Button>
          </div>
        </form>
          )}
        </TabsContent>

        {/* Promotions Section */}
        <TabsContent value="promotions" className="mt-0">
          {!showPromotionForm ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex gap-4">
            <select
              value={promotionTypeFilter}
              onChange={(e) => setPromotionTypeFilter(e.target.value)}
              className="h-12 px-10 border-2 border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            >
              <option value="all">All Promotions</option>
              <option value="banner">Banner</option>
              <option value="promo_code">Promo Code</option>
            </select>
          </div>
          
          <div className="grid gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {promotion.image && (
                        <img 
                          src={promotion.image} 
                          alt={promotion.title || promotion.code}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{promotion.title || promotion.code}</h3>
                        {promotion.subtitle && (
                          <p className="text-sm text-gray-600">{promotion.subtitle}</p>
                        )}
                        <p className="text-sm text-gray-500">Code: {promotion.code}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-yellow-500" />
                        <span>
                          {promotion.discount_type === 'percentage' 
                            ? `${promotion.discount_value}% off`
                            : `${promotion.discount_value} VND off`}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          promotion.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {promotion.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {promotion.show_on_homepage && (
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            Homepage
                          </span>
                        )}
                        <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                          {promotion.promotion_type || 'promo_code'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePromotionEdit(promotion)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handlePromotionDelete(promotion.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {promotions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Info className="w-14 h-14 mx-auto mb-4 text-gray-400" />
                <p className="text-base">No promotions yet. Create your first promotion!</p>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      ) : activeSection === 'promotions' && showPromotionForm ? (
        <form onSubmit={handlePromotionSubmit} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">
                {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="promotion_type">Promotion Type *</Label>
                  <select
                    id="promotion_type"
                    value={promotionFormData.promotion_type}
                    onChange={(e) => setPromotionFormData({...promotionFormData, promotion_type: e.target.value})}
                    className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="promo_code">Promo Code</option>
                    <option value="banner">Banner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Promo Code *</Label>
                  <Input
                    id="code"
                    value={promotionFormData.code}
                    onChange={(e) => setPromotionFormData({...promotionFormData, code: e.target.value})}
                    required
                    className="h-11"
                    placeholder="e.g., TRAVELNEW"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <select
                    id="discount_type"
                    value={promotionFormData.discount_type}
                    onChange={(e) => setPromotionFormData({...promotionFormData, discount_type: e.target.value})}
                    className="w-full h-11 px-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">Discount Value *</Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={promotionFormData.discount_value}
                    onChange={(e) => setPromotionFormData({...promotionFormData, discount_value: e.target.value})}
                    required
                    className="h-11"
                    placeholder="e.g., 10 or 50000"
                  />
                </div>
              </div>

              {/* Show banner-specific fields for banner type */}
              {promotionFormData.promotion_type === 'banner' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={promotionFormData.image}
                      onChange={(e) => setPromotionFormData({...promotionFormData, image: e.target.value})}
                      className="h-11"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highlight">Highlight Text</Label>
                    <Input
                      id="highlight"
                      value={promotionFormData.highlight}
                      onChange={(e) => setPromotionFormData({...promotionFormData, highlight: e.target.value})}
                      className="h-11"
                      placeholder="e.g., Save up to 1 Million"
                    />
                  </div>
                </>
              )}

              {/* Show title/subtitle when show_on_homepage is checked (required for homepage display) */}
              {promotionFormData.show_on_homepage && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title * {promotionFormData.show_on_homepage && '(Required for homepage)'}</Label>
                    <Input
                      id="title"
                      value={promotionFormData.title}
                      onChange={(e) => setPromotionFormData({...promotionFormData, title: e.target.value})}
                      className="h-11"
                      placeholder={promotionFormData.promotion_type === 'banner' ? "e.g., Chill this weekend" : "e.g., Get up to 50,000 VND off"}
                      required={promotionFormData.show_on_homepage}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={promotionFormData.subtitle}
                      onChange={(e) => setPromotionFormData({...promotionFormData, subtitle: e.target.value})}
                      className="h-11"
                      placeholder={promotionFormData.promotion_type === 'banner' ? "e.g., Up to 30% off" : "e.g., Valid for your first booking"}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={promotionFormData.start_date}
                    onChange={(e) => setPromotionFormData({...promotionFormData, start_date: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={promotionFormData.end_date}
                    onChange={(e) => setPromotionFormData({...promotionFormData, end_date: e.target.value})}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Max Uses (leave empty for unlimited)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={promotionFormData.max_uses || ''}
                  onChange={(e) => setPromotionFormData({...promotionFormData, max_uses: e.target.value ? parseInt(e.target.value) : null})}
                  className="h-11"
                  placeholder="e.g., 100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Conditions</Label>
                <Textarea
                  id="conditions"
                  value={promotionFormData.conditions}
                  onChange={(e) => setPromotionFormData({...promotionFormData, conditions: e.target.value})}
                  rows={3}
                  className="resize-none"
                  placeholder="Terms and conditions..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms Text (for display)</Label>
                <Input
                  id="terms"
                  value={promotionFormData.terms}
                  onChange={(e) => setPromotionFormData({...promotionFormData, terms: e.target.value})}
                  className="h-11"
                  placeholder="Terms & Conditions apply."
                />
              </div>

              <div className="flex gap-8 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={promotionFormData.is_active}
                    onChange={(e) => setPromotionFormData({...promotionFormData, is_active: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={promotionFormData.show_on_homepage}
                    onChange={(e) => setPromotionFormData({...promotionFormData, show_on_homepage: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium">Show on Homepage</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 sticky bottom-0 bg-white/95 backdrop-blur-sm p-6 border-t border-gray-200 shadow-lg mt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowPromotionForm(false);
                setEditingPromotion(null);
                setPromotionFormData({
                  code: '',
                  discount_type: 'percentage',
                  discount_value: '',
                  max_uses: null,
                  start_date: '',
                  end_date: '',
                  conditions: '',
                  is_active: true,
                  show_on_homepage: false,
                  promotion_type: 'promo_code',
                  title: '',
                  subtitle: '',
                  image: '',
                  highlight: '',
                  terms: 'Terms & Conditions apply.'
                });
              }} 
              className="gap-2 min-w-[120px] h-11"
            >
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[150px] h-11 gap-2">
              <Save className="w-4 h-4" /> 
              {loading ? 'Saving...' : editingPromotion ? 'Update Promotion' : 'Create Promotion'}
            </Button>
          </div>
        </form>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Day Editor Component
function DayEditor({ day, dayIndex, onUpdate, onRemove, onAddCheckpoint, onRemoveCheckpoint, onUpdateCheckpoint }) {
  const { translations } = useLanguage();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-9 w-9"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <h3 className="font-semibold text-lg">{translations.day || "Day"} {day.day_number}</h3>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(dayIndex)}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              value={day.day_title || ''}
              onChange={(e) => onUpdate(dayIndex, 'day_title', e.target.value)}
              className="h-11"
              placeholder={translations.dayTitlePlaceholder || "Day title (e.g., Arrival and City Tour)"}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              value={day.day_summary || ''}
              onChange={(e) => onUpdate(dayIndex, 'day_summary', e.target.value)}
              className="resize-none"
              placeholder={translations.daySummaryPlaceholder || "Brief day summary"}
              rows={3}
            />
          </div>

          {TIME_PERIODS.map(period => (
            <div key={period} className="border-l-4 border-blue-500 pl-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold capitalize text-base">{period}</h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onAddCheckpoint(dayIndex, period)}
                  className="gap-2"
                >
                  <Plus className="w-3 h-3" /> {translations.checkpoint || "Checkpoint"}
                </Button>
              </div>

              {day.checkpoints[period].map((checkpoint, cpIdx) => (
                <div key={cpIdx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                  <div className="flex gap-3">
                    <Input
                      type="time"
                      value={checkpoint.checkpoint_time}
                      onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'checkpoint_time', e.target.value)}
                      className="w-36 h-10"
                    />
                    <Input
                      value={checkpoint.activity_title}
                      onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'activity_title', e.target.value)}
                      placeholder={translations.activityTitle || "Activity title"}
                      className="flex-1 h-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveCheckpoint(dayIndex, period, cpIdx)}
                      className="h-10 w-10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={checkpoint.location || ''}
                    onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'location', e.target.value)}
                    className="h-10"
                    placeholder={translations.location || "Location"}
                  />
                  <Textarea
                    value={checkpoint.activity_description || ''}
                    onChange={(e) => onUpdateCheckpoint(dayIndex, period, cpIdx, 'activity_description', e.target.value)}
                    className="resize-none"
                    placeholder={translations.activityDescription || "Activity description"}
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
function ServicesEditor({ 
  services, 
  availableServices, 
  itinerary, 
  onChange, 
  onLoadAccommodationRooms,
  onLoadRestaurantMenu,
  selectedRooms,
  selectedMenus,
  loadingDetails,
  departureCityId,
  destinationCityId,
  cities,
  selectedRoomIds,
  setSelectedRoomIds,
  selectedMenuItemIds,
  setSelectedMenuItemIds
}) {
  const { translations } = useLanguage();
  const handleAccommodationChange = async (serviceId) => {
    onChange({
      ...services,
      accommodation: serviceId ? {
        service_id: parseInt(serviceId),
        notes: ''
      } : null
    });
    
    if (serviceId) {
      await onLoadAccommodationRooms(parseInt(serviceId));
      setSelectedRoomIds([]);
    }
  };
  
  const handleRestaurantChange = async (dayNumber, serviceId) => {
    const updated = services.restaurants.filter(r => r.day_number !== dayNumber);
    if (serviceId) {
      updated.push({
        service_id: parseInt(serviceId),
        day_number: dayNumber,
        notes: ''
      });
      await onLoadRestaurantMenu(parseInt(serviceId), dayNumber);
    }
    onChange({...services, restaurants: updated});
  };
  
  const toggleRoomSelection = (roomId) => {
    setSelectedRoomIds(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };
  
  const toggleMenuItem = (dayNumber, itemId) => {
    setSelectedMenuItemIds(prev => ({
      ...prev,
      [dayNumber]: prev[dayNumber]?.includes(itemId)
        ? prev[dayNumber].filter(id => id !== itemId)
        : [...(prev[dayNumber] || []), itemId]
    }));
  };
  
  const getDepartureCityName = () => {
    return cities.find(c => c.id === departureCityId)?.name || 'Departure';
  };
  
  const getDestinationCityName = () => {
    return cities.find(c => c.id === destinationCityId)?.name || 'Destination';
  };
  
  return (
    <div className="space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Car className="w-5 h-5 text-blue-500" />
            {translations.transportation || "Transportation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{translations.route || "Route"}:</span>
              <span className="text-blue-700 font-medium">{getDepartureCityName()}</span>
              <span className="text-gray-400 text-lg">→</span>
              <span className="text-blue-700 font-medium">{getDestinationCityName()}</span>
            </div>
          </div>
          
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
            className="w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">{translations.selectTransportation || "Select transportation for entire trip"}</option>
            {availableServices.transportation?.map(t => (
              <option key={t.id} value={t.id}>
                {t.vehicle_type} {t.brand ? `(${t.brand})` : ''} - 
                Plate: {t.license_plate} - 
                {t.max_passengers} passengers - 
                {t.base_price.toLocaleString()} VND
                {t.pickup_location && ` - Pickup: ${t.pickup_location}`}
                {t.dropoff_location && ` - Dropoff: ${t.dropoff_location}`}
              </option>
            ))}
          </select>
          
          {availableServices.transportation?.length === 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded-lg">
              {translations.noTransportationAvailable || "No transportation available for the selected route. Please check departure and destination cities."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Hotel className="w-5 h-5 text-purple-500" />
            {translations.accommodation || "Accommodation"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <select
            value={services.accommodation?.service_id || ''}
            onChange={(e) => handleAccommodationChange(e.target.value)}
            className="w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          >
            <option value="">{translations.selectAccommodation || "Select accommodation for entire trip"}</option>
            {availableServices.accommodations?.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} - {'⭐'.repeat(a.star_rating || 0)} - 
                {a.min_price.toLocaleString()} - {a.max_price.toLocaleString()} VND/night
              </option>
            ))}
          </select>
          
          {/* Room Selection */}
          {services.accommodation && selectedRooms.length > 0 && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-lg mb-5 flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                {translations.availableRooms || "Available Rooms"} - {translations.selectRoomsForTour || "Select rooms for this tour"}
              </h4>
              {loadingDetails ? (
                <p className="text-center py-8 text-gray-500">{translations.loadingRooms || "Loading rooms..."}</p>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {selectedRooms.map(room => (
                    <div 
                      key={room.id}
                      className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                        selectedRoomIds.includes(room.id)
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                      }`}
                      onClick={() => toggleRoomSelection(room.id)}
                    >
                      {room.images && room.images.length > 0 && (
                        <img 
                          src={room.images[0]} 
                          alt={room.roomType || room.name}
                          className="w-full h-36 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h5 className="font-semibold text-lg mb-3">{room.roomType || room.name}</h5>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          {translations.capacity || "Capacity"}: {room.maxAdults || 0} {translations.adults || "adults"}{room.maxChildren ? ` + ${room.maxChildren} ${translations.children || "children"}` : ''}
                        </p>
                        <p className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          {(room.basePrice || 0).toLocaleString()} {room.currency || 'VND'}{translations.perNight || "/night"}
                        </p>
                        {room.bedType && (
                          <p className="text-gray-600">🛏️ {room.bedType}</p>
                        )}
                      </div>
                      {selectedRoomIds.includes(room.id) && (
                        <div className="mt-4 bg-purple-100 rounded-lg p-2.5 text-center text-sm font-semibold text-purple-700">
                          ✓ {translations.selected || "Selected"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            {translations.restaurants || "Restaurants"} {translations.onePerDay || "(one per day)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {itinerary.map((day, idx) => (
            <div key={idx} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-gray-50 to-white">
              <Label className="font-semibold text-base mb-4 block">{translations.day || "Day"} {day.day_number} - {day.day_title || translations.untitled || 'Untitled'}</Label>
              <select
                value={services.restaurants.find(r => r.day_number === day.day_number)?.service_id || ''}
                onChange={(e) => handleRestaurantChange(day.day_number, e.target.value)}
                className="w-full h-11 px-4 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">{translations.selectRestaurant || "Select restaurant"}</option>
                {availableServices.restaurants?.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} - {r.cuisine_type} - {r.price_range}
                  </option>
                ))}
              </select>
              
              {/* Menu Selection */}
              {services.restaurants.find(r => r.day_number === day.day_number) && 
               selectedMenus[day.day_number]?.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h5 className="font-semibold text-base mb-4 flex items-center gap-3">
                    <Utensils className="w-5 h-5 text-orange-600" />
                    {translations.menuItems || "Menu Items"} - {translations.selectDishesForDay || "Select dishes for this day"}
                  </h5>
                  {loadingDetails ? (
                    <p className="text-center py-8 text-gray-500">{translations.loadingMenu || "Loading menu..."}</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {selectedMenus[day.day_number].map(item => (
                        <div
                          key={item.id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedMenuItemIds[day.day_number]?.includes(item.id)
                              ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 shadow-lg'
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                          }`}
                          onClick={() => toggleMenuItem(day.day_number, item.id)}
                        >
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-28 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h6 className="font-semibold text-sm mb-1">{item.name}</h6>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                          <p className="text-sm font-bold text-orange-600">
                            {(item.price || 0).toLocaleString()} {item.currency || 'VND'}
                          </p>
                          {selectedMenuItemIds[day.day_number]?.includes(item.id) && (
                            <div className="mt-3 bg-orange-100 rounded-lg p-2 text-center text-xs font-semibold text-orange-700">
                              ✓ {translations.selected || "Selected"}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, CheckCircle2, Plus, X, Shield, Star } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCities } from "../../api/cities";
import { submitPartnerRegistration } from "../../api/partnerRegistrations";

export default function AccommodationRegistration({ onBack, onSubmit }) {
  const { translations: t } = useLanguage();
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    branches: [{ address: "", city: "" }],
    roomTypes: [],
    amenities: [],
    description: "",
    starRating: "",
    priceRange: "",
  });

  const roomTypeOptions = [
    { value: "single", label: t.roomSingle },
    { value: "double", label: t.roomDouble },
    { value: "twin", label: t.roomTwin },
    { value: "deluxe", label: t.roomDeluxe },
    { value: "suite", label: t.roomSuite },
    { value: "family", label: t.roomFamily },
    { value: "presidential", label: t.roomPresidential },
    { value: "dormitory", label: t.roomDormitory },
  ];

  const amenityOptions = [
    { value: "wifi", label: t.amenityWifi },
    { value: "parking", label: t.amenityParking },
    { value: "pool", label: t.amenityPool },
    { value: "gym", label: t.amenityGym },
    { value: "spa", label: t.amenitySpa },
    { value: "restaurant", label: t.amenityRestaurant },
    { value: "bar", label: t.amenityBar },
    { value: "breakfast", label: t.amenityBreakfast },
    { value: "aircon", label: t.amenityAircon },
    { value: "tv", label: t.amenityTV },
    { value: "minibar", label: t.amenityMinibar },
    { value: "safe", label: t.amenitySafe },
  ];

  const priceRangeOptions = [
    { value: "budget", label: t.priceBudget },
    { value: "moderate", label: t.priceModerate },
    { value: "premium", label: t.pricePremium },
    { value: "luxury", label: t.priceLuxury },
  ];

  useEffect(() => {
    const fetchCities = async () => {
      const citiesData = await getCities();
      setCities(citiesData);
    };
    fetchCities();
  }, []);

  const addBranch = () => {
    setFormData({
      ...formData,
      branches: [...formData.branches, { address: "", city: "" }],
    });
  };

  const removeBranch = (index) => {
    const newBranches = formData.branches.filter((_, i) => i !== index);
    setFormData({ ...formData, branches: newBranches });
  };

  const updateBranch = (index, field, value) => {
    const newBranches = [...formData.branches];
    newBranches[index][field] = value;
    setFormData({ ...formData, branches: newBranches });
  };

  const toggleRoomType = (value) => {
    const newTypes = formData.roomTypes.includes(value)
      ? formData.roomTypes.filter((v) => v !== value)
      : [...formData.roomTypes, value];
    setFormData({ ...formData, roomTypes: newTypes });
  };

  const toggleAmenity = (value) => {
    const newAmenities = formData.amenities.includes(value)
      ? formData.amenities.filter((v) => v !== value)
      : [...formData.amenities, value];
    setFormData({ ...formData, amenities: newAmenities });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const registrationData = {
        partnerType: "accommodation",
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        starRating: parseInt(formData.starRating),
        priceRange: formData.priceRange,
        amenities: formData.amenities,
        roomTypes: formData.roomTypes,
        branches: formData.branches.map(branch => ({
          city: branch.city,
          address: branch.address
        }))
      };

      const result = await submitPartnerRegistration(registrationData);
      
      if (onSubmit) onSubmit(registrationData);
      alert(t.partnerRegisterSuccess || "Registration submitted successfully! Please wait for admin approval.");
    } catch (error) {
      alert(`Failed to submit registration: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.partnerTypeAccommodation}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.accommodationRegisterDesc}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {t.basicInformation}
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t.businessName} *
            </Label>
            <Input
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="h-11 bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700/20"
              placeholder={t.accommodationNamePlaceholder}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t.email} *
            </Label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-11 bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700/20"
              placeholder={t.emailPlaceholder}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {t.phone} *
          </Label>
          <Input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="h-11 bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700/20"
            placeholder={t.phonePlaceholder}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t.starRating} *
            </Label>
            <select
              required
              value={formData.starRating}
              onChange={(e) => setFormData({ ...formData, starRating: e.target.value })}
              className="h-11 w-full rounded-md border border-gray-200 dark:border-gray-700/20 bg-gray-50 dark:bg-gray-900/60 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.selectStarRating}</option>
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} {star === 1 ? t.star : t.stars}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {t.priceRangeLabel} *
            </Label>
            <select
              required
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
              className="h-11 w-full rounded-md border border-gray-200 dark:border-gray-700/20 bg-gray-50 dark:bg-gray-900/60 px-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t.selectPriceRange}</option>
              {priceRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Branches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {t.branches}
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addBranch}
            className="text-blue-600 dark:text-blue-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.addBranch}
          </Button>
        </div>

        {formData.branches.map((branch, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-gray-700/20 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.branch} {index + 1}
              </span>
              {formData.branches.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBranch(index)}
                  className="text-red-600 dark:text-red-400"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.address} *
                </Label>
                <Input
                  required
                  value={branch.address}
                  onChange={(e) => updateBranch(index, "address", e.target.value)}
                  className="h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  placeholder={t.addressPlaceholder}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {t.city} *
                </Label>
                <select
                  required
                  value={branch.city}
                  onChange={(e) => updateBranch(index, "city", e.target.value)}
                  className="h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-gray-900 dark:text-white"
                >
                  <option value="">{t.selectCity}</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Types */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {t.supportedRoomTypes} *
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {roomTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleRoomType(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.roomTypes.includes(option.value)
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300"
              }`}
            >
              <div className="text-sm font-medium text-center">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {t.amenities} *
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {amenityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleAmenity(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.amenities.includes(option.value)
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-purple-300"
              }`}
            >
              <div className="text-sm font-medium text-center">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t.description} *
        </Label>
        <Textarea
          required
          placeholder={t.accommodationDescriptionPlaceholder}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="min-h-[120px] bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700/20"
        />
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 p-1.5 flex-shrink-0">
          <Shield className="w-full h-full text-white" />
        </div>
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-semibold mb-1">{t.partnerSecurityNotice}</p>
          <p className="text-blue-700 dark:text-blue-400">
            {t.partnerSecurityText}
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1 h-12 font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {t.submitRegistration}
        </Button>
      </div>
    </form>
  );
}

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ArrowLeft, CheckCircle2, Plus, X, Shield } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getCities } from "../../api/cities";
import { submitPartnerRegistration } from "../../api/partnerRegistrations";

export default function RestaurantRegistration({ onBack, onSubmit }) {
  const { translations: t } = useLanguage();
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    phone: "",
    branches: [{ address: "", city: "" }],
    cuisineTypes: [],
    description: "",
    priceRange: "",
  });

  const cuisineOptions = [
    { value: "seafood", label: t.cuisineSeafood },
    { value: "vietnamese", label: t.cuisineVietnamese },
    { value: "asian", label: t.cuisineAsian },
    { value: "european", label: t.cuisineEuropean },
    { value: "japanese", label: t.cuisineJapanese },
    { value: "korean", label: t.cuisineKorean },
    { value: "chinese", label: t.cuisineChinese },
    { value: "italian", label: t.cuisineItalian },
    { value: "french", label: t.cuisineFrench },
    { value: "fusion", label: t.cuisineFusion },
    { value: "vegetarian", label: t.cuisineVegetarian },
    { value: "fastfood", label: t.cuisineFastFood },
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

  const toggleCuisineType = (value) => {
    const newTypes = formData.cuisineTypes.includes(value)
      ? formData.cuisineTypes.filter((v) => v !== value)
      : [...formData.cuisineTypes, value];
    setFormData({ ...formData, cuisineTypes: newTypes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const registrationData = {
        partnerType: "restaurant",
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        description: formData.description,
        cuisineType: formData.cuisineTypes.join(", "),
        priceRange: formData.priceRange,
        specialties: formData.cuisineTypes,
        capacity: "",
        openingHours: "",
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
            {t.partnerTypeRestaurant}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.restaurantRegisterDesc}
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
              placeholder={t.restaurantNamePlaceholder}
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

      {/* Cuisine Types */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {t.supportedCuisineTypes} *
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cuisineOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleCuisineType(option.value)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                formData.cuisineTypes.includes(option.value)
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-orange-300"
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
          placeholder={t.restaurantDescriptionPlaceholder}
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
          className="flex-1 h-12 font-semibold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {t.submitRegistration}
        </Button>
      </div>
    </form>
  );
}

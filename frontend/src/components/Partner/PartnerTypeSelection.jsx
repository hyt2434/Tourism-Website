import { Building2, Car, UtensilsCrossed } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function PartnerTypeSelection({ onSelectType }) {
  const { translations: t } = useLanguage();

  const partnerTypes = [
    {
      id: "transportation",
      title: t.partnerTypeTransportation,
      description: t.partnerTypeTransportationDesc,
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-500",
    },
    {
      id: "restaurant",
      title: t.partnerTypeRestaurant,
      description: t.partnerTypeRestaurantDesc,
      icon: UtensilsCrossed,
      color: "from-orange-500 to-red-500",
      iconColor: "text-orange-500",
    },
    {
      id: "accommodation",
      title: t.partnerTypeAccommodation,
      description: t.partnerTypeAccommodationDesc,
      icon: Building2,
      color: "from-purple-500 to-pink-500",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {t.partnerSelectType}
        </h3>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          {t.partnerSelectTypeDesc || "Choose your business type to continue"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch w-full">
        {partnerTypes.map((type) => {
          const IconComponent = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className="group relative bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl px-4 py-5 md:px-6 md:py-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 min-h-[200px] md:min-h-[240px] flex-1 basis-0"
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-all duration-300`} />
              
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${type.color} opacity-5 group-hover:opacity-15 rounded-bl-full rounded-tr-2xl transition-all duration-300`} />
              
              {/* Icon container */}
              <div className="relative mb-5 flex justify-center">
                <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${type.color} p-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 rotate-0 group-hover:rotate-6`}>
                  <IconComponent className="w-full h-full text-white drop-shadow-lg" />
                  
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.color} blur-2xl opacity-0 group-hover:opacity-50 rounded-2xl transition-opacity duration-300`} />
                </div>
              </div>
              
              {/* Title */}
              <h4 className={`relative text-xl md:text-2xl font-bold mb-3 bg-gradient-to-br ${type.color} bg-clip-text text-transparent text-center leading-tight`}>
                {type.title}
              </h4>
              
              {/* Description */}
              <p className="relative text-xs md:text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed px-3">
                {type.description}
              </p>

              {/* Hover indicator */}
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1.5 bg-gradient-to-r ${type.color} group-hover:w-3/4 transition-all duration-300 rounded-full`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

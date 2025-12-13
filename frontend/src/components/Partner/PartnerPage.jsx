import { useEffect, useMemo, useState } from "react";
import { Card, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { PlusCircle, Star, Users, Globe, Award, TrendingUp, Shield, CheckCircle2, ArrowRight, Calendar, Mail, Phone } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import PartnerTypeSelection from "./PartnerTypeSelection";
import TransportationRegistration from "./TransportationRegistration";
import RestaurantRegistration from "./RestaurantRegistration";
import AccommodationRegistration from "./AccommodationRegistration";
import { getPartnersSummary } from "../../api/partners";
import { useNavigate } from "react-router-dom";


export default function PartnerPage() {
  const { translations: t } = useLanguage();
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [registrationStep, setRegistrationStep] = useState("selection"); // "selection", "transportation", "restaurant", "accommodation"
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  const handleSelectType = (type) => {
    setRegistrationStep(type);
  };

  const handleBackToSelection = () => {
    setRegistrationStep("selection");
  };

  const handleRegistrationSubmit = (data) => {
    console.log("Registration submitted:", data);
    setIsRegistrationOpen(false);
    setRegistrationStep("selection");
  };

  const handleOpenRegistration = () => {
    setIsRegistrationOpen(true);
    setRegistrationStep("selection");
  };

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await getPartnersSummary();
        if (res?.success) {
          setPartners(res.partners || []);
        }
      } catch (error) {
        console.error("Failed to load partners", error);
      } finally {
        setLoadingPartners(false);
      }
    };
    fetchPartners();
  }, []);

  const carousels = useMemo(() => {
    if (!partners.length) return [[], [], []];
    const chunkSize = Math.max(1, Math.ceil(partners.length / 3));
    const rows = [
      partners.slice(0, chunkSize),
      partners.slice(chunkSize, chunkSize * 2),
      partners.slice(chunkSize * 2, chunkSize * 3),
    ];
    return rows.map((row) => row.slice(0, 5));
  }, [partners]);

  const partnerAvatar = (partner) =>
    partner.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.partner_name || partner.name || "Partner")}&background=0D8ABC&color=fff`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            {t.partnerTitle}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto px-2">
            {t.partnerSubtitle}
          </p>

          {/* Stats Bar - Enhanced Modern Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 max-w-5xl mx-auto mt-8 sm:mt-10 lg:mt-12">
            {[
              { label: t.partnerStats1, value: "1,200+", icon: Users, color: "from-blue-500 to-cyan-500", iconColor: "text-blue-500" },
              { label: t.partnerStats2, value: "15,000+", icon: Globe, color: "from-purple-500 to-pink-500", iconColor: "text-purple-500" },
              { label: t.partnerStats3, value: "500K+", icon: Star, color: "from-amber-500 to-orange-500", iconColor: "text-amber-500" },
              { label: t.partnerStats4, value: "+245%", icon: TrendingUp, color: "from-green-500 to-emerald-500", iconColor: "text-green-500" },
            ].map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div key={idx} className="group relative bg-white dark:bg-gray-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-xl sm:rounded-2xl transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <IconComponent className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 ${stat.iconColor} dark:${stat.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  
                  {/* Value */}
                  <div className={`relative text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="relative text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap truncate">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 py-8 sm:py-12 lg:py-16">
        {/* Partner Carousels (3 chains, 5 partners each) */}
        <div className="mb-8 sm:mb-12 lg:mb-16 overflow-hidden">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2 sm:mb-3 px-4">
            {t.partnerPremium}
          </h2>
          <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 px-4">
            {t.partnerPremiumSubtitle || "All verified partners with their completed tours"}
          </p>

          {loadingPartners ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {carousels.map((row, rowIdx) => (
                <div key={`carousel-${rowIdx}`} className="overflow-hidden">
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>

                    <div className="flex gap-3 sm:gap-4 animate-infinite-scroll">
                      {[...row, ...row].map((p, idx) => (
                        <div
                          key={`${rowIdx}-${p.partner_id}-${idx}`}
                          className="flex-shrink-0 w-48 sm:w-56 md:w-64 mx-2 sm:mx-3 cursor-pointer group"
                          onClick={() => navigate(`/partner/${p.partner_id}`)}
                        >
                          <div className="bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 h-full">
                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                                <img
                                  src={partnerAvatar(p)}
                                  alt={p.partner_name}
                                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900/30 group-hover:ring-blue-200 dark:group-hover:ring-blue-800/50 transition-all duration-300"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-3 border-white dark:border-gray-700 flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                              </div>

                              <div className="text-center space-y-1.5 sm:space-y-2 w-full">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-1 px-1">
                                  {p.partner_name}
                                </h3>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  {p.partner_type || t.partnerTypeLabel || "Partner"}
                                </div>
                                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                                  <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  {p.support_tours ?? 0} {t.supportTour || "Support Tour"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {row.length === 0 && (
                        <div className="w-full text-center text-gray-500 dark:text-gray-400 py-6">
                          {t.noPartners || "No partners to display yet."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partner Detail Modal - Smaller and Centered */}
        {selectedPartner && (
          <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] my-4 sm:my-8 overflow-y-auto bg-white dark:bg-gray-800 backdrop-blur-2xl border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                  {selectedPartner.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Logo with Premium Effect */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40"></div>
                    <img
                      src={selectedPartner.logo}
                      alt={selectedPartner.name}
                      className="relative w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-2xl ring-4 ring-blue-100 dark:ring-blue-900/30"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-green-400 to-emerald-500 w-8 h-8 rounded-full border-3 border-white dark:border-gray-700 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < selectedPartner.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {selectedPartner.rating}.0 {t.rating}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700/20 w-full">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                      {selectedPartner.tourCore}
                    </p>
                  </div>

                  {/* Benefits Badge */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700/30 rounded-xl p-3 w-full">
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 p-1 flex-shrink-0">
                        <TrendingUp className="w-full h-full text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">{t.partnerSuccessStory}</p>
                        <p className="text-xs text-green-700 dark:text-green-400">{selectedPartner.benefit}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info Grid */}
                  <div className="grid grid-cols-1 gap-2 w-full">
                    <div className="bg-gray-50 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700/20 text-left">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.partnerContactEmail}</p>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            contact@{selectedPartner.name.replace(/\s+/g, "").toLowerCase()}.com
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700/20 text-left">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.partnerContactPhone}</p>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">+84 123 456 789</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700/20 text-left">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.partnerContactWebsite}</p>
                          <a
                            href={`https://www.${selectedPartner.name.replace(/\s+/g, "").toLowerCase()}.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 text-sm"
                          >
                            www.{selectedPartner.name.replace(/\s+/g, "").toLowerCase()}.com
                            <ArrowRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full mt-3 h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.location.href = `/partner/${selectedPartner.id}`}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {t.partnerExploreBook}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Become a Partner CTA - Brighter Colors */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36 pb-12 sm:pb-16">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t.partnerCTA}
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
                {t.partnerCTASubtitle}
              </p>

              {/* Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-6 sm:my-8">
                {[
                  t.partnerBenefit1,
                  t.partnerBenefit2,
                  t.partnerBenefit3
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium text-xs sm:text-sm md:text-base text-center">{benefit}</span>
                  </div>
                ))}
              </div>

              <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    onClick={handleOpenRegistration}
                    className="h-11 sm:h-12 md:h-14 px-4 sm:px-6 md:px-8 text-sm sm:text-base md:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                  >
                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2" />
                    {t.partnerRegisterBtn}
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ml-2" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="!max-w-[95vw] sm:!max-w-[90vw] lg:!max-w-5xl w-full max-h-[90vh] !top-[50%] !left-[50%] !translate-x-[-50%] !translate-y-[-50%] overflow-hidden bg-white dark:bg-gray-800 backdrop-blur-2xl border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col">
                  <DialogHeader className="pb-3 sm:pb-4 flex-shrink-0">
                    <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent text-center mb-2 leading-tight">
                      {t.partnerRegisterTitle}
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-center text-sm sm:text-base md:text-lg px-2">
                      {t.partnerRegisterSubtitle}
                    </p>
                  </DialogHeader>

                  <div className="mt-4 flex-1 overflow-y-auto pr-2 -mr-2">
                    {registrationStep === "selection" && (
                      <PartnerTypeSelection onSelectType={handleSelectType} />
                    )}
                    {registrationStep === "transportation" && (
                      <TransportationRegistration 
                        onBack={handleBackToSelection} 
                        onSubmit={handleRegistrationSubmit}
                      />
                    )}
                    {registrationStep === "restaurant" && (
                      <RestaurantRegistration 
                        onBack={handleBackToSelection} 
                        onSubmit={handleRegistrationSubmit}
                      />
                    )}
                    {registrationStep === "accommodation" && (
                      <AccommodationRegistration 
                        onBack={handleBackToSelection} 
                        onSubmit={handleRegistrationSubmit}
                      />
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-4">
                {t.partnerTermsText}{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">{t.partnerTermsLink}</a> {t.privacy && "và"}{" "}
                <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">{t.partnerPrivacyLink}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

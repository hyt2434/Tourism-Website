import React from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Globe,
  Heart,
  Users,
  Award,
  MapPin,
  Star,
  Plane,
  Shield,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

export default function AboutUs() {
  const { translations } = useLanguage();
  const t = translations.aboutUs;

  const stats = [
    { icon: Users, value: "10,000+", label: t.happyTravelers },
    { icon: MapPin, value: "100+", label: t.destinations },
    { icon: Award, value: "100+", label: t.activePartners },
    { icon: Star, value: "4.9/5", label: t.averageRating },
  ];

  const values = [
    {
      icon: Heart,
      title: t.passionTitle,
      description: t.passionDesc,
    },
    {
      icon: Shield,
      title: t.trustTitle,
      description: t.trustDesc,
    },
    {
      icon: Globe,
      title: t.expertiseTitle,
      description: t.expertiseDesc,
    },
    {
      icon: TrendingUp,
      title: t.innovationTitle,
      description: t.innovationDesc,
    },
  ];

  const milestones = [
    { year: "Q1 2025", event: t.milestone2025Q1, description: t.milestone2025Q1Desc },
    { year: "Q2 2025", event: t.milestone2025Q2, description: t.milestone2025Q2Desc },
    { year: "Q3 2025", event: t.milestone2025Q3, description: t.milestone2025Q3Desc },
    { year: "Q4 2025", event: t.milestone2025Q4, description: t.milestone2025Q4Desc },
    { year: "2026", event: t.milestone2026, description: t.milestone2026Desc },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-200/30 to-purple-200/30 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 -right-1/4 w-1/2 h-1/2 bg-gradient-to-br from-purple-200/30 to-pink-200/30 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {t.leadingPlatform}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            {t.heroTitle}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              {t.heroTitleHighlight}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12">
            {t.heroDescription}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t.ourStory}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p className="text-lg leading-relaxed">
                  {t.storyParagraph1}
                </p>
                <p className="text-lg leading-relaxed">
                  {t.storyParagraph2}
                </p>
                <p className="text-lg leading-relaxed">
                  {t.storyParagraph3}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop"
                  alt="Ha Long Bay"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-2xl font-bold mb-2">{t.halongBay}</p>
                  <p className="text-sm opacity-90">
                    {t.popularDestination}
                  </p>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-xs">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {t.verifiedPartners}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t.allPartnersVerified}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.coreValues}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.coreValuesDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 group flex flex-col h-full"
              >
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 min-h-[3rem] flex items-center">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.ourJourney}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.journeyDesc}
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400 dark:from-blue-600 dark:to-purple-600" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row gap-8 items-center ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1" />
                  
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10 relative px-2">
                      <span className="text-xs md:text-sm text-center leading-tight">
                        {milestone.year}
                      </span>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {milestone.event}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t.readyToStart}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t.ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (window.location.href = "/tour")}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              {t.exploreTours}
            </button>
            <button
              onClick={() => (window.location.href = "/partner")}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
            >
              {t.becomePartner}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { mockPartners } from "./PartnerData";
import { Button } from "../ui/button";
import { Star, MapPin, Phone, Globe, Mail, Award, Users, TrendingUp, CheckCircle2, ArrowRight, Calendar, DollarSign, Clock, MessageCircle, Heart, Share2, Sparkles } from "lucide-react";

export default function PartnerDetail() {
  const { id } = useParams();
  const partner = mockPartners.find((p) => p.id === parseInt(id));

  if (!partner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">❌</div>
          <p className="text-xl text-gray-600 font-medium">Partner not found</p>
          <Link to="/partner">
            <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Back Button */}
        <Link to="/partner" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="font-medium">Back to Partners</span>
        </Link>

        {/* Hero Header Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-white/20 relative overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Logo with premium effect */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40"></div>
              <img
                src={partner.logo}
                alt={partner.name}
                className="relative w-48 h-48 rounded-full object-cover border-8 border-white shadow-2xl ring-4 ring-blue-100"
              />
              <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 w-14 h-14 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-3 -left-3 bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg flex items-center gap-1">
                <Award className="w-3 h-3" />
                Verified
              </div>
            </div>

            <div className="flex-1 space-y-5 text-center md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-3">
                  <Sparkles className="w-3 h-3" />
                  Premium Partner
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent mb-3">
                  {partner.name}
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                  {partner.description || partner.tourCore}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${i < (partner.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-semibold">
                  {partner.rating || 4}.0
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: Users, label: "Guests", value: "15K+" },
                  { icon: Calendar, label: "Since", value: partner.date },
                  { icon: TrendingUp, label: "Growth", value: "+45%" },
                  { icon: Award, label: "Rating", value: "5.0★" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                    <stat.icon className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-4">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Now
                </Button>
                <Button variant="outline" className="h-11 px-6 border-2 hover:bg-white/80">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact
                </Button>
                <Button variant="outline" className="h-11 w-11 p-0 border-2 hover:bg-white/80">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="h-11 w-11 p-0 border-2 hover:bg-white/80">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 flex-shrink-0">
                <Mail className="w-full h-full text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-900 text-sm">contact@{partner.name.replace(/\s+/g, "").toLowerCase()}.com</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 flex-shrink-0">
                <Phone className="w-full h-full text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-900">+84 123 456 789</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 flex-shrink-0">
                <Globe className="w-full h-full text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Website</p>
                <a 
                  href={`https://www.${partner.name.replace(/\s+/g, "").toLowerCase()}.com`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline text-sm flex items-center gap-1"
                >
                  Visit site
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 mb-8">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
            About {partner.name}
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed text-lg">
              {partner.name} has been one of our trusted travel partners, providing guests with exceptional
              service, comfort, and unforgettable experiences. Whether you're exploring Vietnam's
              breathtaking landscapes or relaxing at a seaside resort, {partner.name} ensures every trip is memorable.
            </p>

            {/* Success metrics */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 flex-shrink-0">
                  <TrendingUp className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">Partnership Success Story</h3>
                  <p className="text-green-700 leading-relaxed">{partner.benefit}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tours Section */}
        <section className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Available Tours
            </h2>
            <Button variant="outline" className="border-2">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Tour Image */}
                <div className="relative overflow-hidden h-48">
                  <img
                    src={`https://source.unsplash.com/600x400/?travel,vietnam,${i}`}
                    alt="Tour"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                  
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">Tour Package #{i}</h3>
                      <p className="text-white/90 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {2 + i} days / {1 + i} nights
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tour Details */}
                <div className="p-5 space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    A specially curated travel experience with {partner.name}. Enjoy breathtaking landscapes and cultural immersion.
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Starting from</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${299 * i}
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                      Book Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="relative bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              <MessageCircle className="w-4 h-4" />
              We're here to help
            </div>

            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 bg-clip-text text-transparent">
              Get in Touch with {partner.name}
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              Have questions or special requests? Contact {partner.name} directly or message through our platform.
              Our team is available 24/7 to assist you.
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Partner
              </Button>
              <Button variant="outline" className="h-12 px-8 border-2">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

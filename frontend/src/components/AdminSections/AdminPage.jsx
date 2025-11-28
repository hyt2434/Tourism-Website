import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardHeader, CardDescription, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Users,
  UserCheck,
  MessageSquare,
  Download,
  TrendingUp,
  Clock,
  Shield,
  Bell,
  Map,
} from "lucide-react";
import UserManagementTab from "./UserManagementTab";
import PartnerManagementTab from "./PartnerManagementTab";
import SocialModerationTab from "./SocialModerationTab";
import TourManagementTab from "./TourManagementTab";
import { useLanguage } from "../../context/LanguageContext";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { translations } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Enhanced Stats Cards */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                {translations.totalUsers}
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>1,248</span>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </CardTitle>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% {translations.fromLastMonth}
              </p>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-purple-100 dark:border-purple-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                {translations.activePartners}
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>156</span>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
              </CardTitle>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +8% {translations.fromLastMonth}
              </p>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-orange-100 dark:border-orange-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-orange-700 dark:text-orange-300 font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {translations.pendingApprovals}
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>23</span>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </CardTitle>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                {translations.requiresAttention}
              </p>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-green-100 dark:border-green-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-green-700 dark:text-green-300 font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {translations.socialPosts}
              </CardDescription>
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>892</span>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </CardTitle>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +24% {translations.engagementIncrease}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-2">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 h-auto gap-2">
              <TabsTrigger
                value="users"
                className="flex items-center gap-3 px-6 py-4 text-base font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">{translations.userManagement}</span>
                <span className="sm:hidden">{translations.totalUsers}</span>
              </TabsTrigger>
              <TabsTrigger
                value="partners"
                className="flex items-center gap-3 px-6 py-4 text-base font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <UserCheck className="w-5 h-5" />
                <span className="hidden sm:inline">{translations.partnerManagement}</span>
                <span className="sm:hidden">{translations.partner}s</span>
              </TabsTrigger>
              <TabsTrigger
                value="tours"
                className="flex items-center gap-3 px-6 py-4 text-base font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Map className="w-5 h-5" />
                <span className="hidden sm:inline">Tour Management</span>
                <span className="sm:hidden">Tours</span>
              </TabsTrigger>
              <TabsTrigger
                value="social"
                className="flex items-center gap-3 px-6 py-4 text-base font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">{translations.socialModeration}</span>
                <span className="sm:hidden">{translations.social}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6">
            <TabsContent value="users" className="mt-0">
              <UserManagementTab />
            </TabsContent>

            <TabsContent value="partners" className="mt-0">
              <PartnerManagementTab />
            </TabsContent>

            <TabsContent value="tours" className="mt-0">
              <TourManagementTab />
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              <SocialModerationTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

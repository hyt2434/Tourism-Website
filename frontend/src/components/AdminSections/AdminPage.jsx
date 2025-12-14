import { useState, useEffect } from "react";
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
  Package,
} from "lucide-react";
import UserManagementTab from "./UserManagementTab";
import PartnerManagementTab from "./PartnerManagementTab";
import SocialModerationTab from "./SocialModerationTab";
import TourManagementTab from "./TourManagementTab";
import BookingManagementTab from "./BookingManagementTab";
import ScheduleManagementTab from "./ScheduleManagementTab";
import { useLanguage } from "../../context/LanguageContext";
import { getDashboardStats } from "../../api/admin";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { translations } = useLanguage();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePartners: 0,
    pendingApprovals: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getDashboardStats();
      setStats({
        totalUsers: data.total_users || 0,
        activePartners: data.active_partners || 0,
        pendingApprovals: data.pending_approvals || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Enhanced Stats Cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-blue-100 dark:border-blue-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                {translations.totalUsers}
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>{loadingStats ? "..." : stats.totalUsers.toLocaleString()}</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-purple-100 dark:border-purple-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-purple-700 dark:text-purple-300 font-semibold flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                {translations.activePartners}
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>{loadingStats ? "..." : stats.activePartners.toLocaleString()}</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden bg-white dark:bg-gray-900 border-2 border-orange-100 dark:border-orange-900 hover:shadow-2xl transition-all duration-300 hover:scale-105 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-bl-full" />
            <CardHeader className="pb-3 relative">
              <CardDescription className="text-orange-700 dark:text-orange-300 font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {translations.pendingApprovals}
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2 flex items-center justify-between">
                <span>{loadingStats ? "..." : stats.pendingApprovals.toLocaleString()}</span>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </CardTitle>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                {translations.requiresAttention}
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
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-1.5 sm:p-2">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-lg sm:rounded-xl p-1 sm:p-1.5 h-auto gap-1.5 sm:gap-2">
              <TabsTrigger
                value="users"
                className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base font-semibold rounded-md sm:rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden md:inline">{translations.userManagement}</span>
                <span className="md:hidden">{translations.totalUsers}</span>
              </TabsTrigger>
              <TabsTrigger
                value="partners"
                className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base font-semibold rounded-md sm:rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden md:inline">{translations.partnerManagement}</span>
                <span className="md:hidden">{translations.partner}s</span>
              </TabsTrigger>
              <TabsTrigger
                value="tours"
                className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base font-semibold rounded-md sm:rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Map className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden md:inline">{translations.tourManagement || "Tour Management"}</span>
                <span className="md:hidden">{translations.toursAdmin || "Tours"}</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base font-semibold rounded-md sm:rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden md:inline">{translations.bookingManagement || "Bookings"}</span>
                <span className="md:hidden">{translations.bookings || "Bookings"}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6">
            <TabsContent value="users" className="mt-0">
              <UserManagementTab />
            </TabsContent>

            <TabsContent value="partners" className="mt-0">
              <PartnerManagementTab />
            </TabsContent>

            <TabsContent value="tours" className="mt-0">
              <TourManagementTab />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <div className="space-y-6">
                {/* Sub-tabs for Bookings and Schedules */}
                <Tabs defaultValue="bookings" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 h-auto">
                    <TabsTrigger
                      value="bookings"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow transition-all text-gray-700 dark:text-gray-300"
                    >
                      <Package className="w-4 h-4" />
                      {translations.individualBookings || "Individual Bookings"}
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedules"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow transition-all text-gray-700 dark:text-gray-300"
                    >
                      <Clock className="w-4 h-4" />
                      {translations.scheduleManagement || "Schedule Management"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bookings" className="mt-0">
                    <BookingManagementTab />
                  </TabsContent>

                  <TabsContent value="schedules" className="mt-0">
                    <ScheduleManagementTab />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardHeader, CardDescription, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  PackageIcon,
  Building,
  Bus,
  Tag,
  ShoppingCart,
  MessageSquare,
  Download,
  TrendingUp,
} from "lucide-react";
import ToursTab from "./ToursTab";
import AccommodationTab from "./AccommodationTab";
import TransportTab from "./TransportTab";
import PromotionsTab from "./PromotionsTab";
import OrdersTab from "./OrdersTab";
import SocialModerationTab from "./SocialModerationTab";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("tours");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-title dark:text-white">Admin Dashboard</h1>
              <p className="text-muted-foreground dark:text-gray-400">
                Manage services, promotions and orders
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-600 dark:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Avatar>
                <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground dark:text-gray-400">
                Pending Approval
              </CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>8</span>
                <PackageIcon className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground dark:text-gray-400">
                New Orders
              </CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>24</span>
                <ShoppingCart className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground dark:text-gray-400">
                Active Promotions
              </CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>12</span>
                <Tag className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground dark:text-gray-400">
                Monthly Revenue
              </CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>125M</span>
                <TrendingUp className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="tours"
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <PackageIcon className="w-4 h-4" />
              Tours
            </TabsTrigger>
            <TabsTrigger
              value="accommodation"
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <Building className="w-4 h-4" />
              Accommodation
            </TabsTrigger>
            <TabsTrigger
              value="transport"
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <Bus className="w-4 h-4" />
              Transport
            </TabsTrigger>
            <TabsTrigger
              value="promotions"
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <Tag className="w-4 h-4" />
              Promotions
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="flex items-center gap-2 text-black dark:text-white"
            >
              <MessageSquare className="w-4 h-4" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tours">
            <ToursTab />
          </TabsContent>

          <TabsContent value="accommodation">
            <AccommodationTab />
          </TabsContent>

          <TabsContent value="transport">
            <TransportTab />
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionsTab />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="social">
            <SocialModerationTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

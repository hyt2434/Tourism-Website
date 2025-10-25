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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1>Bảng điều khiển Admin</h1>
              <p className="text-muted-foreground">
                Quản lý dịch vụ, khuyến mãi và đơn hàng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
              <Avatar>
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Chờ duyệt</CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>8</span>
                <PackageIcon className="w-5 h-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Đơn hàng mới</CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>24</span>
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Khuyến mãi đang chạy</CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>12</span>
                <Tag className="w-5 h-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Doanh thu tháng</CardDescription>
              <CardTitle className="flex items-center justify-between">
                <span>125M</span>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="tours" className="flex items-center gap-2">
              <PackageIcon className="w-4 h-4" />
              Tour
            </TabsTrigger>
            <TabsTrigger
              value="accommodation"
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Lưu trú
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center gap-2">
              <Bus className="w-4 h-4" />
              Nhà xe
            </TabsTrigger>
            <TabsTrigger value="promotions" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Khuyến mãi
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Đơn hàng
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
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

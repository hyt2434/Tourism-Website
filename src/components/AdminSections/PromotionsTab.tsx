import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Plus, Edit, XCircle } from "lucide-react";
import { mockPromotions, getStatusBadge } from "./mockData";

export default function PromotionsTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý Khuyến mãi</CardTitle>
            <CardDescription>
              Tạo mã giảm giá và theo dõi hiệu quả
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tạo khuyến mãi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo khuyến mãi mới</DialogTitle>
                <DialogDescription>
                  Thiết lập mã giảm giá và điều kiện áp dụng
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mã khuyến mãi</Label>
                    <Input placeholder="VD: SUMMER2025" />
                  </div>
                  <div className="space-y-2">
                    <Label>Loại giảm giá</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Phần trăm (%)</SelectItem>
                        <SelectItem value="fixed">
                          Số tiền cố định (đ)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Giá trị giảm</Label>
                    <Input type="number" placeholder="VD: 20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượt sử dụng tối đa</Label>
                    <Input type="number" placeholder="VD: 500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Điều kiện áp dụng</Label>
                  <Textarea
                    placeholder="VD: Áp dụng cho đơn hàng từ 1,000,000đ"
                    rows={3}
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-apply">Tự động áp dụng</Label>
                    <Switch id="auto-apply" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-homepage">Hiển thị trang chủ</Label>
                    <Switch id="show-homepage" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Hủy</Button>
                <Button>Tạo khuyến mãi</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã khuyến mãi</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Lượt dùng</TableHead>
              <TableHead>Hạn sử dụng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPromotions.map((promo) => {
              const statusConfig = getStatusBadge(promo.status);
              return (
                <TableRow key={promo.id}>
                  <TableCell className="font-mono">{promo.code}</TableCell>
                  <TableCell>{promo.discount}</TableCell>
                  <TableCell>
                    {promo.uses} / {promo.maxUses}
                  </TableCell>
                  <TableCell>{promo.validUntil}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <XCircle className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

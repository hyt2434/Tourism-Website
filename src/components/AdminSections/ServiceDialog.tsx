import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { Edit } from "lucide-react";

interface ServiceDialogProps {
  service: any;
  type: string;
}

export default function ServiceDialog({ service, type }: ServiceDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-black">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa {type}</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và trạng thái của {type.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên {type}</Label>
              <Input defaultValue={service.name} />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select defaultValue={service.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="hidden">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {type === "Tour" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá</Label>
                  <Input defaultValue={service.price} />
                </div>
                <div className="space-y-2">
                  <Label>Ngày khởi hành</Label>
                  <Input type="date" defaultValue={service.startDate} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Input defaultValue={service.provider} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea placeholder="Nhập mô tả chi tiết..." rows={5} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id="featured" />
              <Label htmlFor="featured">Nổi bật</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="notifications" defaultChecked />
              <Label htmlFor="notifications">Thông báo khi có đặt chỗ</Label>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Hủy</Button>
          <Button>Lưu thay đổi</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

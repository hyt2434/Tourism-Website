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

export default function ServiceDialog({ service, type }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4 text-black dark:text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Chỉnh sửa {type}</DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-gray-400">
            Cập nhật thông tin và trạng thái của {type.toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên {type}</Label>
              <Input
                defaultValue={service.name}
                className="bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select defaultValue={service.status}>
                <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
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
                  <Input
                    defaultValue={service.price}
                    className="bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ngày khởi hành</Label>
                  <Input
                    type="date"
                    defaultValue={service.startDate}
                    className="bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Input
                  defaultValue={service.provider}
                  className="bg-white dark:bg-gray-800 text-black dark:text-white"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              placeholder="Nhập mô tả chi tiết..."
              rows={5}
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>

          <Separator className="dark:bg-gray-700" />

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
          <Button variant="outline" className="dark:border-gray-600 dark:text-white">
            Hủy
          </Button>
          <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

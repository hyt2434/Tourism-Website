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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Search, Eye } from "lucide-react";
import { mockOrders, getStatusBadge } from "./mockData";

export default function OrdersTab() {
  return (
    <Card className="bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-title dark:text-white">Quản lý Đơn hàng</CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-400">
          Tra cứu và xử lý đơn đặt chỗ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              className="pl-9 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
              <SelectItem value="all">Tất cả đơn</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="refund">Hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead className="text-black dark:text-white">Mã đơn</TableHead>
              <TableHead className="text-black dark:text-white">Khách hàng</TableHead>
              <TableHead className="text-black dark:text-white">Dịch vụ</TableHead>
              <TableHead className="text-black dark:text-white">Số tiền</TableHead>
              <TableHead className="text-black dark:text-white">Ngày đặt</TableHead>
              <TableHead className="text-black dark:text-white">Trạng thái</TableHead>
              <TableHead className="text-right text-black dark:text-white">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => {
              const statusConfig = getStatusBadge(order.status);
              return (
                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} className="dark:border-gray-600">
                      {statusConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 text-black dark:text-white" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-gray-900 text-black dark:text-white">
                        <DialogHeader>
                          <DialogTitle>
                            Chi tiết đơn hàng {order.id}
                          </DialogTitle>
                          <DialogDescription>
                            {translations.orderDetailDescription || "View detailed information about this order"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-muted-foreground dark:text-gray-400">Khách hàng</p>
                            <p>{order.customer}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground dark:text-gray-400">Dịch vụ</p>
                            <p>{order.service}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground dark:text-gray-400">Số tiền</p>
                            <p>{order.amount}</p>
                          </div>
                          <Separator className="dark:bg-gray-700" />
                          {order.status === "refund_requested" && (
                            <Alert className="bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700">
                              <AlertDescription>
                                Khách hàng yêu cầu hoàn tiền. Vui lòng xem xét
                                và xử lý.
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-white">
                              Đổi lịch
                            </Button>
                            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-white">
                              Hủy đơn
                            </Button>
                            <Button className="flex-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                              Hoàn tiền
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
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

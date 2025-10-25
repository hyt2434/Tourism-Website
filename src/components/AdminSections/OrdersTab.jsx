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
    <Card>
      <CardHeader>
        <CardTitle>Quản lý Đơn hàng</CardTitle>
        <CardDescription>Tra cứu và xử lý đơn đặt chỗ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng..."
              className="pl-9"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="refund">Hoàn tiền</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Ngày đặt</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrders.map((order) => {
              const statusConfig = getStatusBadge(order.status);
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.service}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Chi tiết đơn hàng {order.id}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-muted-foreground">Khách hàng</p>
                            <p>{order.customer}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Dịch vụ</p>
                            <p>{order.service}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Số tiền</p>
                            <p>{order.amount}</p>
                          </div>
                          <Separator />
                          {order.status === "refund_requested" && (
                            <Alert>
                              <AlertDescription>
                                Khách hàng yêu cầu hoàn tiền. Vui lòng xem xét
                                và xử lý.
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1">
                              Đổi lịch
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Hủy đơn
                            </Button>
                            <Button className="flex-1">Hoàn tiền</Button>
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

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
import { Plus, Search, Filter, CheckCircle, EyeOff } from "lucide-react";
import ServiceDialog from "./ServiceDialog";
import { mockTransport, getStatusBadge } from "./mockData";

export default function TransportTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý Nhà xe</CardTitle>
            <CardDescription>Quản lý các dịch vụ vận chuyển</CardDescription>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Nhà xe
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm nhà xe..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên nhà xe</TableHead>
              <TableHead>Tuyến đường</TableHead>
              <TableHead>Loại xe</TableHead>
              <TableHead>Số ghế</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransport.map((transport) => {
              const statusConfig = getStatusBadge(transport.status);
              return (
                <TableRow key={transport.id}>
                  <TableCell>{transport.name}</TableCell>
                  <TableCell>{transport.route}</TableCell>
                  <TableCell>{transport.type}</TableCell>
                  <TableCell>{transport.seats} ghế</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ServiceDialog service={transport} type="Nhà xe" />
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <EyeOff className="w-4 h-4 text-orange-600" />
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

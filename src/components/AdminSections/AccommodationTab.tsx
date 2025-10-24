import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Plus, Search, Filter, CheckCircle, EyeOff } from 'lucide-react';
import ServiceDialog from './ServiceDialog';
import { mockAccommodations, getStatusBadge } from './mockData';

export default function AccommodationTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý Lưu trú</CardTitle>
            <CardDescription>Quản lý khách sạn, resort và chỗ nghỉ</CardDescription>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Thêm Lưu trú
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm kiếm lưu trú..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên cơ sở</TableHead>
              <TableHead>Địa điểm</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Số phòng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAccommodations.map((acc) => {
              const statusConfig = getStatusBadge(acc.status);
              return (
                <TableRow key={acc.id}>
                  <TableCell>{acc.name}</TableCell>
                  <TableCell>{acc.location}</TableCell>
                  <TableCell>⭐ {acc.rating}</TableCell>
                  <TableCell>{acc.rooms} phòng</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>{statusConfig.text}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ServiceDialog service={acc} type="Lưu trú" />
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

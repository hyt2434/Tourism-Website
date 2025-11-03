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
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function OrdersTab() {
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <Card className="bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-title dark:text-white">
          {translations.orderManagement}
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-400">
          {translations.orderDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder={translations.searchOrder}
              className="pl-9 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
              <SelectItem value="all">{translations.allOrders}</SelectItem>
              <SelectItem value="pending">{translations.pending}</SelectItem>
              <SelectItem value="completed">{translations.completed}</SelectItem>
              <SelectItem value="refund">{translations.refund}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead className="text-black dark:text-white">{translations.orderId}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.customer}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.service}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.amount}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.orderDate}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.status}</TableHead>
              <TableHead className="text-right text-black dark:text-white">{translations.actions}</TableHead>
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
                            {translations.orderDetail} {order.id}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-muted-foreground dark:text-gray-400">{translations.customer}</p>
                            <p>{order.customer}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground dark:text-gray-400">{translations.service}</p>
                            <p>{order.service}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground dark:text-gray-400">{translations.amount}</p>
                            <p>{order.amount}</p>
                          </div>
                          <Separator className="dark:bg-gray-700" />
                          {order.status === "refund_requested" && (
                            <Alert className="bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700">
                              <AlertDescription>
                                {translations.refundRequest}
                              </AlertDescription>
                            </Alert>
                          )}
                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-white">
                              {translations.reschedule}
                            </Button>
                            <Button variant="outline" className="flex-1 dark:border-gray-600 dark:text-white">
                              {translations.cancelOrder}
                            </Button>
                            <Button className="flex-1 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                              {translations.refund}
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

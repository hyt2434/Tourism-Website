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
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function TransportTab() {
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <Card className="bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="dark:text-white">
              {translations.transportManagement}
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-gray-400">
              {translations.transportDescription}
            </CardDescription>
          </div>
          <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {translations.addTransport}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder={translations.searchTransport}
              className="pl-9 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="dark:border-gray-600 dark:text-white"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead className="text-black dark:text-white">
                {translations.transportName}
              </TableHead>
              <TableHead className="text-black dark:text-white">
                {translations.route}
              </TableHead>
              <TableHead className="text-black dark:text-white">
                {translations.vehicleType}
              </TableHead>
              <TableHead className="text-black dark:text-white">
                {translations.seats}
              </TableHead>
              <TableHead className="text-black dark:text-white">
                {translations.status}
              </TableHead>
              <TableHead className="text-right text-black dark:text-white">
                {translations.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTransport.map((transport) => {
              const statusConfig = getStatusBadge(transport.status);
              return (
                <TableRow
                  key={transport.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <TableCell>{transport.name}</TableCell>
                  <TableCell>{transport.route}</TableCell>
                  <TableCell>{transport.type}</TableCell>
                  <TableCell>
                    {transport.seats} {translations.seatUnit}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusConfig.variant}
                      className="dark:border-gray-600"
                    >
                      {statusConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <ServiceDialog service={transport} type={translations.transport} />
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <EyeOff className="w-4 h-4 text-orange-600 dark:text-orange-400" />
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

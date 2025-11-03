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
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function PromotionsTab() {
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <Card className="bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="dark:text-white">
              {translations.promotionManagement}
            </CardTitle>
            <CardDescription className="text-muted-foreground dark:text-gray-400">
              {translations.promotionDescription}
            </CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                {translations.createPromotion}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 text-black dark:text-white">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  {translations.newPromotion}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground dark:text-gray-400">
                  {translations.promotionSetup}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Form fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{translations.promoCode}</Label>
                    <Input
                      placeholder="SUMMER2025"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{translations.discountType}</Label>
                    <Select>
                      <SelectTrigger className="bg-white dark:bg-gray-800 text-black dark:text-white">
                        <SelectValue placeholder={translations.selectType} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
                        <SelectItem value="percent">
                          {translations.percent}
                        </SelectItem>
                        <SelectItem value="fixed">
                          {translations.fixed}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{translations.discountValue}</Label>
                    <Input
                      type="number"
                      placeholder="20"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{translations.maxUses}</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{translations.startDate}</Label>
                    <Input
                      type="date"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{translations.endDate}</Label>
                    <Input
                      type="date"
                      className="bg-white dark:bg-gray-800 text-black dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{translations.conditions}</Label>
                  <Textarea
                    placeholder={translations.conditionsPlaceholder}
                    rows={3}
                    className="bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-apply">
                      {translations.autoApply}
                    </Label>
                    <Switch id="auto-apply" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-homepage">
                      {translations.showHomepage}
                    </Label>
                    <Switch id="show-homepage" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="dark:border-gray-600 dark:text-white">
                  {translations.cancel}
                </Button>
                <Button className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700">
                  {translations.createPromotion}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead className="text-black dark:text-white">{translations.promoCode}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.discount}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.uses}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.validUntil}</TableHead>
              <TableHead className="text-black dark:text-white">{translations.status}</TableHead>
              <TableHead className="text-right text-black dark:text-white">{translations.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPromotions.map((promo) => {
              const statusConfig = getStatusBadge(promo.status);
              return (
                <TableRow key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-mono">{promo.code}</TableCell>
                  <TableCell>{promo.discount}</TableCell>
                  <TableCell>{promo.uses} / {promo.maxUses}</TableCell>
                  <TableCell>{promo.validUntil}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} className="dark:border-gray-600">
                      {statusConfig.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 text-black dark:text-white" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
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

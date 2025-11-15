import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { mockSocialPosts, getStatusBadge } from "./mockData";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function SocialModerationTab() {
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <Card className="bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">
          {translations.socialModeration}
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-gray-400">
          {translations.socialDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Select defaultValue="pending">
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
              <SelectItem value="all">{translations.allPosts}</SelectItem>
              <SelectItem value="pending">{translations.pendingApproval}</SelectItem>
              <SelectItem value="approved">{translations.approved}</SelectItem>
              <SelectItem value="reported">{translations.reported}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          {mockSocialPosts.map((post) => {
            const statusConfig = getStatusBadge(post.status);
            return (
              <Card
                key={post.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
                          {post.user[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-black dark:text-white">{post.user}</p>
                          <Badge
                            variant={statusConfig.variant}
                            className="dark:border-gray-600"
                          >
                            {statusConfig.text}
                          </Badge>
                          {post.reports > 0 && (
                            <Badge
                              variant="destructive"
                              className="dark:border-red-600 dark:text-red-300"
                            >
                              {post.reports} {translations.reports}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground dark:text-gray-400 mt-1">
                          {post.date}
                        </p>
                        <p className="mt-2 text-black dark:text-white">
                          {post.content}
                        </p>
                        <div className="mt-3 bg-muted dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center">
                          <p className="text-muted-foreground dark:text-gray-400">
                            [{translations.media}]
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 dark:border-gray-600 dark:text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {translations.detail}
                    </Button>
                    {post.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {translations.approve}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {translations.reject}
                        </Button>
                      </>
                    )}
                    {post.reports > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1 dark:bg-red-700 dark:text-white dark:hover:bg-red-800"
                      >
                        {translations.viewReports}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

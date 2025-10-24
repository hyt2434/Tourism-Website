import React from "react";
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

export default function SocialModerationTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kiểm duyệt Social</CardTitle>
        <CardDescription>Duyệt bài đăng và xử lý báo cáo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Select defaultValue="pending">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bài</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="reported">Bị báo cáo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-4">
          {mockSocialPosts.map((post) => {
            const statusConfig = getStatusBadge(post.status);
            return (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{post.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p>{post.user}</p>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.text}
                          </Badge>
                          {post.reports > 0 && (
                            <Badge variant="destructive">
                              {post.reports} báo cáo
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {post.date}
                        </p>
                        <p className="mt-2">{post.content}</p>
                        <div className="mt-3 bg-muted rounded-lg h-48 flex items-center justify-center">
                          <p className="text-muted-foreground">[Ảnh/Video]</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                    {post.status === "pending" && (
                      <>
                        <Button size="sm" className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Duyệt
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    {post.reports > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        Xem báo cáo
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

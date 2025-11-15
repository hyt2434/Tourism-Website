import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Grid3x3, Bookmark, MapPin } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function UserProfileDialog({
  open,
  onOpenChange,
  user,
  userPosts,
}) {
  const { translations } = useLanguage();
  const [activeTab, setActiveTab] = useState("posts");

  // 👈 Kiểm tra user có tồn tại không
  if (!user) return null;

  // Mock user stats
  const stats = {
    posts: userPosts?.length || 0,
    followers: 1234,
    following: 567,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 bg-white dark:bg-gray-900 overflow-hidden">
        {/* Header - Profile Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white text-3xl">
                {user?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-semibold text-black dark:text-white">
                  {user?.username || "username"}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-white"
                >
                  Theo dõi
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-4">
                <div className="text-center">
                  <p className="font-semibold text-black dark:text-white">
                    {stats.posts}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    bài viết
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-black dark:text-white">
                    {stats.followers.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    người theo dõi
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-black dark:text-white">
                    {stats.following}
                  </p>
                  <p className="text-sm text-muted-foreground dark:text-gray-400">
                    đang theo dõi
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="font-semibold text-black dark:text-white">
                  {user?.displayName || "Display Name"}
                </p>
                <p className="text-muted-foreground dark:text-gray-400 mt-1">
                  🌏 Travel enthusiast | 📸 Explorer | ✈️ Adventure seeker
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-transparent border-b border-gray-200 dark:border-gray-700 rounded-none h-12">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none"
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Bài viết
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Đã lưu
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="posts"
            className="p-4 overflow-y-auto max-h-[50vh]"
          >
            {userPosts && userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-gray-200 dark:bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity relative group"
                  >
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay with stats */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">❤️ {post.likes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          💬 {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground dark:text-gray-400" />
                <p className="text-muted-foreground dark:text-gray-400">
                  Chưa có bài viết nào
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="saved"
            className="p-4 overflow-y-auto max-h-[50vh]"
          >
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground dark:text-gray-400" />
              <p className="text-muted-foreground dark:text-gray-400">
                Chưa có bài viết đã lưu
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

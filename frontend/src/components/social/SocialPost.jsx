import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  MapPin,
  Flag,
  Trash2,
} from "lucide-react";
import ImageWithFallback from "../../figma/ImageWithFallback.jsx";
import { useLanguage } from "../../context/LanguageContext";
import CommentDialog from "./CommentDialog";
import UserProfileDialog from "./UserProfileDialog";
import { Link, useNavigate } from "react-router-dom";
import { toggleLike, deletePost, getHashtagInfo } from "../../api/social";
import { useToast } from "../../context/ToastContext";

export default function SocialPost({
  post,
  onServiceClick,
  onReport,
  getUserPosts,
  onLikeUpdate, // Callback to update parent state
}) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { translations } = useLanguage();
  const { toast } = useToast();

  // Get current user to check if admin
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost(post.id);
      toast.success("Post deleted successfully");
      // Refresh posts by calling parent callback if available
      if (onLikeUpdate) {
        onLikeUpdate(post.id, false, true); // Pass delete flag
      }
      // Reload page or refresh posts list
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error(error.message || "Failed to delete post");
    }
  };

  // Helper function to detect if text contains Vietnamese characters
  const containsVietnamese = (text) => {
    if (!text) return false;
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
    return vietnameseRegex.test(text);
  };

  // Use content from post caption
  const displayContent = post.caption || "";

  // 👈 Lấy tất cả posts của user này
  const userPosts = getUserPosts ? getUserPosts(post?.user?.id) : [post];

  const handleLike = async () => {
    if (!post?.id) return;

    try {
      setIsLiking(true);
      const result = await toggleLike(post.id);
      const newLiked = result.status === "liked";
      setLiked(newLiked);
      
      // Update parent if callback provided
      if (onLikeUpdate) {
        onLikeUpdate(post.id, newLiked);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <>
      <Card className="mb-0 sm:mb-4 overflow-hidden border-0 sm:border border-gray-200 dark:border-gray-800 bg-white dark:bg-black shadow-none sm:shadow-sm rounded-none sm:rounded-lg">
        {/* Post Header */}
        <div className="p-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setShowUserProfile(true)}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                <Avatar className="w-full h-full border-2 border-white dark:border-black">
                  <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white text-sm font-semibold">
                    {post?.user?.displayName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="leading-none font-semibold text-sm text-black dark:text-white group-hover:opacity-60 transition-opacity">
                {post?.user?.username || "Unknown"}
              </p>
              {post.location && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  {post.location}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900">
                <MoreHorizontal className="w-5 h-5 text-black dark:text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700"
            >
              <DropdownMenuItem
                onClick={() => onServiceClick(post.linkedService)}
                className="cursor-pointer"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {translations.viewLinkedService}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onReport(post.id)}
                className="cursor-pointer text-red-600 dark:text-red-400"
              >
                <Flag className="w-4 h-4 mr-2" />
                {translations.reportPost}
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem 
                  onClick={handleDeletePost}
                  className="cursor-pointer text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post Image */}
        <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-900 overflow-hidden">
          <ImageWithFallback
            src={post.image}
            alt={post.caption}
            className="w-full h-full object-cover max-w-full max-h-full"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          {post.status === "pending" && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="secondary"
                className="bg-yellow-100/90 dark:bg-yellow-900/90 text-yellow-800 dark:text-yellow-300 border-0 backdrop-blur-sm"
              >
                {translations.pending}
              </Badge>
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent hover:scale-110 transition-transform"
                onClick={handleLike}
                disabled={isLiking}
              >
                <Heart
                  className={`w-7 h-7 transition-all ${
                    liked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-black dark:text-white"
                  }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent hover:scale-110 transition-transform"
                onClick={() => setShowComments(true)}
              >
                <MessageCircle className="w-7 h-7 text-black dark:text-white" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent hover:scale-110 transition-transform"
              >
                <Send className="w-7 h-7 text-black dark:text-white" />
              </Button>
            </div>
          </div>

          {/* Likes count */}
          <p className="mb-2 text-sm font-semibold text-black dark:text-white">
            {post.likes?.toLocaleString() || 0}{" "}
            {translations.likes}
          </p>

          {/* Caption */}
          <div className="mb-2 text-sm text-black dark:text-white">
            <span className="font-semibold mr-2">
              {post?.user?.username || "Unknown"}
            </span>
            <span className="text-gray-800 dark:text-gray-200">{displayContent}</span>
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.hashtags.map((tag, index) => {
                const hashtagText = tag.startsWith('#') ? tag : `#${tag}`;
                return (
                  <span
                    key={index}
                    className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (onHashtagClick) {
                        onHashtagClick(hashtagText);
                      } else {
                        // Fallback: handle directly if no prop provided
                        try {
                          const hashtagInfo = await getHashtagInfo(hashtagText);
                          if (hashtagInfo && hashtagInfo.name) {
                            navigate(`/tour?search=${encodeURIComponent(hashtagInfo.name)}`);
                          } else {
                            toast.error("Could not find information for this hashtag");
                          }
                        } catch (error) {
                          console.error("Failed to get hashtag info:", error);
                          toast.error("Failed to load hashtag information");
                        }
                      }
                    }}
                  >
                    {hashtagText}
                  </span>
                );
              })}
            </div>
          )}

          {/* Comments preview */}
          {post.comments > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto text-gray-500 dark:text-gray-400 hover:bg-transparent text-sm mb-1"
              onClick={() => setShowComments(true)}
            >
              {translations.viewAllComments.replace("{count}", post.comments)}
            </Button>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase">
            {post.timestamp}
          </p>

          {/* Linked Service */}
          {post.linkedService && (
            <Link to="/login" className="block mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                onClick={() => onServiceClick(post.linkedService)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {translations.bookNow}: {post.linkedService}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Comment Dialog */}

      <CommentDialog
        open={showComments}
        onOpenChange={setShowComments}
        post={post}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        user={post?.user}
        userPosts={userPosts}
      />
    </>
  );
}

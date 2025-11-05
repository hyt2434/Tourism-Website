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
  Bookmark,
  MoreHorizontal,
  MapPin,
  Flag,
} from "lucide-react";
import ImageWithFallback from "../../figma/ImageWithFallback.jsx";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function SocialPost({ post, onServiceClick, onReport }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const { translations } = useLanguage(); // 👈 lấy translations

  return (
    <Card className="mb-4 overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      {/* Post Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
              {post.user.displayName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="leading-none text-black dark:text-white">
              {post.user.username}
            </p>
            {post.location && (
              <p className="text-muted-foreground dark:text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {post.location}
              </p>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4 text-black dark:text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white dark:bg-gray-800 text-black dark:text-white"
          >
            <DropdownMenuItem onClick={() => onServiceClick(post.linkedService)}>
              <MapPin className="w-4 h-4 mr-2" />
              {translations.viewLinkedService}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReport(post.id)}>
              <Flag className="w-4 h-4 mr-2" />
              {translations.reportPost}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Image */}
      <div className="relative w-full aspect-square bg-muted dark:bg-gray-800">
        <ImageWithFallback
          src={post.image}
          alt={post.caption}
          className="w-full h-full object-cover"
        />
        {post.status === "pending" && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-600"
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
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => setLiked(!liked)}
            >
              <Heart
                className={`w-6 h-6 ${liked
                    ? "fill-red-500 text-red-500"
                    : "text-black dark:text-white"
                  }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
            >
              <MessageCircle className="w-6 h-6 text-black dark:text-white" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
            >
              <Send className="w-6 h-6 text-black dark:text-white" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            onClick={() => setSaved(!saved)}
          >
            <Bookmark
              className={`w-6 h-6 ${saved
                  ? "fill-current text-black dark:text-white"
                  : "text-black dark:text-white"
                }`}
            />
          </Button>
        </div>

        {/* Likes count */}
        <p className="mb-2 text-black dark:text-white">
          {(post.likes + (liked ? 1 : 0)).toLocaleString()} {translations.likes}
        </p>

        {/* Caption */}
        <div className="mb-2 text-black dark:text-white">
          <span className="mr-2 font-semibold">{post.user.username}</span>
          <span>{post.caption}</span>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {post.hashtags.map((tag, index) => (
            <span
              key={index}
              className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Linked Service */}
        {post.linkedService && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 dark:border-gray-600 dark:text-white"
            onClick={() => onServiceClick(post.linkedService)}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {translations.bookNow}: {post.linkedService}
          </Button>
        )}

        {/* Comments preview */}
        {post.comments > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-muted-foreground dark:text-gray-400 hover:bg-transparent mt-2"
          >
            {translations.viewAllComments.replace("{count}", post.comments)}
          </Button>
        )}

        {/* Timestamp */}
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          {post.timestamp}
        </p>
      </div>
    </Card>
  );
}

import { useState } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Heart, Smile } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// 👈 MOCK CURRENT USER
const currentUser = {
  id: "user_123",
  username: "current_user",
  displayName: "Minh Hoàng",
};

export default function CommentDialog({ open, onOpenChange, post }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      username: "traveler_vn",
      displayName: "Nguyễn Văn A",
      text: "Đẹp quá! Mình cũng muốn đi đây",
      timestamp: "2h",
      likes: 5,
    },
    {
      id: 2,
      username: "explorer_sg",
      displayName: "Sarah Lee",
      text: "Amazing view! How was the weather?",
      timestamp: "5h",
      likes: 2,
    },
  ]);

  const { translations } = useLanguage();

  const handlePostComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      username: currentUser.username,
      displayName: currentUser.displayName,
      text: comment,
      timestamp: "Vừa xong",
      likes: 0,
    };

    setComments([...comments, newComment]);
    setComment("");
  };

  // 👈 Kiểm tra post có tồn tại không
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{
          width: "90vw",
          height: "90vh",
          maxWidth: "none",
          transform: "translate(-50%, calc(-50% + 32px))", // dịch xuống 32px
        }}
        className=" !max-w-none !w-[80vw] !h-[90vh]  p-0 bg-white dark:bg-gray-900 overflow-hidden flex rounded-2xl"
      >
        {/* Left - Image */}
        <div className="w-1/2 bg-black flex items-center justify-center">
          <img
            src={post?.image}
            alt={post?.caption}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Right - Comments */}
        <div className="w-1/2 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
                {post?.user?.displayName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-black dark:text-white">
                {post?.user?.username || "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                {post?.location || ""}
              </p>
            </div>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Original Caption */}
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
                  {post?.user?.displayName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-black dark:text-white">
                    {post?.user?.username || "Unknown"}
                  </span>
                  <span className="text-muted-foreground dark:text-gray-400 text-xs">
                    {post?.timestamp || ""}
                  </span>
                </div>
                <p className="text-black dark:text-white mt-1">
                  {post?.caption || ""}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {post?.hashtags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-blue-600 dark:text-blue-400 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* User Comments */}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
                    {c.displayName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-black dark:text-white">
                      {c.username}
                    </span>
                    <span className="text-muted-foreground dark:text-gray-400 text-xs">
                      {c.timestamp}
                    </span>
                  </div>
                  <p className="text-black dark:text-white mt-1">{c.text}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button className="text-xs text-muted-foreground dark:text-gray-400 hover:text-black dark:hover:text-white">
                      Trả lời
                    </button>
                    {c.likes > 0 && (
                      <span className="text-xs text-muted-foreground dark:text-gray-400">
                        {c.likes} lượt thích
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <Heart className="w-3 h-3 text-muted-foreground dark:text-gray-400" />
                </Button>
              </div>
            ))}
          </div>

          {/* Footer - Actions & Input */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Action Buttons */}
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <Heart className="w-6 h-6 text-black dark:text-white" />
                </Button>
                <Button variant="ghost" size="sm" className="h-auto p-0">
                  <Smile className="w-6 h-6 text-black dark:text-white" />
                </Button>
              </div>
            </div>

            {/* Likes Count */}
            <div className="px-4 pb-2">
              <p className="font-semibold text-black dark:text-white">
                {post?.likes?.toLocaleString()} {translations.likes}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                {post?.timestamp}
              </p>
            </div>

            {/* Comment Input */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <Smile className="w-6 h-6 text-muted-foreground dark:text-gray-400 cursor-pointer" />
              <Input
                placeholder="Thêm bình luận..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePostComment()}
                className="border-0 focus-visible:ring-0 bg-transparent text-black dark:text-white"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePostComment}
                disabled={!comment.trim()}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-30"
              >
                Đăng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Heart, Smile, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { getPost, addComment, deleteComment, getHashtagInfo } from "../../api/social";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

// Get current user from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export default function CommentDialog({ open, onOpenChange, post }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { translations } = useLanguage();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment(post.id, commentId);
      toast.success("Comment deleted successfully");
      // Refresh comments
      fetchPostDetails();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(error.message || "Failed to delete comment");
    }
  };

  // Fetch post details when dialog opens
  useEffect(() => {
    if (open && post?.id) {
      fetchPostDetails();
    }
  }, [open, post?.id]);

  const fetchPostDetails = async () => {
    if (!post?.id) return;
    
    try {
      setLoading(true);
      const postData = await getPost(post.id);
      // Only set comments if post exists and is not deleted
      if (postData && postData.id) {
        setComments(postData.comments || []);
      } else {
        setComments([]);
        toast.error("Post not found or has been deleted");
        onOpenChange(false); // Close dialog if post is deleted
      }
    } catch (error) {
      console.error("Failed to fetch post details:", error);
      toast.error(error.message || "Failed to load comments");
      setComments([]);
      // Close dialog if post is deleted (404 error)
      if (error.message && error.message.includes("deleted")) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim() || !post?.id) return;
    
    if (!currentUser) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await addComment(post.id, comment);
      
      // Check if comment was successfully added
      if (result && result.id) {
        const newComment = {
          id: result.id,
          author: result.author,
          content: result.content,
          created_at: result.created_at,
        };

        setComments([...comments, newComment]);
        setComment("");
        toast.success("Comment added successfully");
      } else {
        throw new Error("Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      const errorMessage = error.message || "Failed to add comment";
      toast.error(errorMessage);
      
      // If post is deleted, close dialog and refresh comments
      if (errorMessage.includes("deleted") || errorMessage.includes("not found")) {
        fetchPostDetails(); // Refresh to get updated state
      }
    } finally {
      setIsSubmitting(false);
    }
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
                  {post?.hashtags?.map((tag, idx) => {
                    const hashtagText = tag.startsWith('#') ? tag : `#${tag}`;
                    return (
                      <span
                        key={idx}
                        className="text-blue-600 dark:text-blue-400 text-sm cursor-pointer hover:underline"
                        onClick={async (e) => {
                          e.stopPropagation();
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
                        }}
                      >
                        {hashtagText}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Comments */}
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">{translations.noComments || "No comments yet"}</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
                      {c.author?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-black dark:text-white">
                          {c.author || "Unknown"}
                        </span>
                        <span className="text-muted-foreground dark:text-gray-400 text-xs">
                          {c.created_at ? new Date(c.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-black dark:text-white mt-1">{c.content}</p>
                  </div>
                </div>
              ))
            )}
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
                disabled={!comment.trim() || isSubmitting}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-30"
              >
                {isSubmitting ? (translations.posting || "Posting...") : (translations.post || "Post")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


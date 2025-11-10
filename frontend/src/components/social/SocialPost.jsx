import { useState, useCallback } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
import { useLanguage } from "../../context/LanguageContext";
import { toggleLike, addComment } from "../../api/social";

export default function SocialPost({ post, onServiceClick, onReport, onUpdate }) {

  const normalizedPost = {
    id: post.id,
    content: post.content || post.caption,
    image_url: post.image_url || post.image,
    author: post.author || { 
      username: post.user?.username || 'Unknown',
      email: post.user?.email
    },
    like_count: post.like_count || post.likes || 0,
    tags: post.tags || (post.hashtags || []).map(tag => tag.replace('#', '')),
    location: post.location,
    created_at: post.created_at || post.timestamp,
    comments: post.comments || [],
    comment_count: post.comment_count || post.comments?.length || 0
  };

  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(normalizedPost.like_count);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { translations } = useLanguage();

  const handleLike = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        throw new Error('Please login to like posts');
      }

      const result = await toggleLike(post.id, user.email);
      setLiked(result.status === 'liked');
      setLikeCount(prev => result.status === 'liked' ? prev + 1 : prev - 1);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [post.id, onUpdate]);

  const handleComment = useCallback(async (content) => {
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        throw new Error('Please login to comment');
      }

      await addComment(post.id, {
        authorEmail: user.email,
        content
      });
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [post.id, onUpdate]);

  return (
    <Card className="mb-4 overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      {/* Post Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
              {post.author?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="leading-none text-black dark:text-white">
              {post.author?.username || 'Unknown User'}
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
      {post.image_url && (
        <div className="relative w-full aspect-square bg-muted dark:bg-gray-800">
          <ImageWithFallback
            src={post.image_url}
            alt={post.content}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={handleLike}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-red-500"/>
              ) : (
                <Heart
                  className={`w-6 h-6 ${liked
                      ? "fill-red-500 text-red-500"
                      : "text-black dark:text-white"
                    } transition-colors duration-200`}
                />
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <MessageCircle className="w-6 h-6 text-black dark:text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900">
                <DialogHeader>
                  <DialogTitle className="text-black dark:text-white">{translations.comments}</DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400">
                    {translations.commentsDescription || "View and add comments on this post"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Danh sách comments */}
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto py-4">
                    {(normalizedPost.comments || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{comment.author?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-black dark:text-white">{comment.author}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{comment.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Form thêm comment */}
                  <div className="flex items-center gap-2 pt-4 border-t dark:border-gray-700">
                    <Input
                      placeholder={translations.addComment}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(newComment);
                          setNewComment('');
                        }
                      }}
                    />
                    <Button 
                      onClick={() => {
                        handleComment(newComment);
                        setNewComment('');
                      }}
                      disabled={isSubmitting || !newComment.trim()}
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"/>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
          {likeCount.toLocaleString()} {translations.likes}
        </p>

        {/* Caption */}
        <div className="mb-2 text-black dark:text-white">
          <span className="mr-2 font-semibold">{post.author?.username}</span>
          <span>{post.content}</span>
        </div>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {(post.tags || []).map((tag, index) => (
            <span
              key={index}
              className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            >
              #{tag}
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
        {normalizedPost.comment_count > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-muted-foreground dark:text-gray-400 hover:bg-transparent mt-2"
              >
                {translations.viewAllComments.replace("{count}", normalizedPost.comment_count)}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle className="text-black dark:text-white">
                  {translations.comments}
                </DialogTitle>
                <DialogDescription className="text-gray-500 dark:text-gray-400">
                  {translations.commentsDescription || "View and respond to comments"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Comments list */}
                <div className="space-y-4 max-h-[50vh] overflow-y-auto py-4">
                  {normalizedPost.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {comment.author?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-black dark:text-white">
                          {comment.author}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add comment form */}
                <div className="flex items-center gap-2 pt-4 border-t dark:border-gray-700">
                  <Input
                    placeholder={translations.addComment}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment(newComment);
                        setNewComment('');
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      handleComment(newComment);
                      setNewComment('');
                    }}
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"/>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Timestamp */}
        <p className="text-muted-foreground dark:text-gray-400 mt-2">
          {post.timestamp}
        </p>
      </div>
    </Card>
  );
}

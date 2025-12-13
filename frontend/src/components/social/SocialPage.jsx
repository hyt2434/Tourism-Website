import React, { useState, useMemo, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import { Search, Check, Home, Plus, User, ShoppingBag, Heart, MessageCircle, Send, MoreHorizontal, MapPin, X, Smile, ChevronLeft, Trash2 } from "lucide-react";
import SocialPost from "./SocialPost";
import CreatePostSection from "./CreatePostSection";
import ReportDialog from "./ReportDialog";
import { Dialog, DialogContent } from "../ui/dialog";

import BottomNavigation from "./BottomNavigation";
import { useLanguage } from "../../context/LanguageContext";
import { getPosts, searchPosts, toggleLike, addComment, deletePost, deleteComment, getPost } from "../../api/social";
import { useToast } from "../../context/ToastContext";

/**
 * Transform API post format to component expected format
 */
const transformPost = (apiPost) => {
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  // Helper function to detect if text contains Vietnamese characters
  const containsVietnamese = (text) => {
    if (!text) return false;
    // Vietnamese characters include: àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ
    const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
    return vietnameseRegex.test(text);
  };

  // Use content column from posts table
  const content = apiPost.content || "";
  
  const isVietnamese = containsVietnamese(content);
  const isEnglish = !isVietnamese && content.length > 0;

  return {
    id: apiPost.id,
    user: {
      id: apiPost.author?.email || "",
      username: apiPost.author?.username || "Unknown",
      displayName: apiPost.author?.username || "Unknown",
      avatar: "",
    },
    image: apiPost.image_url || "",
    caption: content,
    hashtags: apiPost.hashtags || [], // Use hashtags array directly from API
    likes: apiPost.like_count || 0,
    comments: apiPost.comment_count || 0,
    timestamp: formatTimeAgo(apiPost.created_at),
    location: "",
    status: "approved",
    // Language detection
    isVietnamese,
    isEnglish,
    // Store original API data for API calls
    _apiData: apiPost,
  };
};

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportedPostId, setReportedPostId] = useState(null);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Search posts when query changes
  useEffect(() => {
    if (activeTab === "search" && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500); // Debounce search
      return () => clearTimeout(timeoutId);
    } else if (activeTab === "search" && !searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, activeTab]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const apiPosts = await getPosts();
      const transformedPosts = apiPosts.map(transformPost);
      setPosts(transformedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const apiPosts = await searchPosts(query);
      const transformedPosts = apiPosts.map(transformPost);
      setSearchResults(transformedPosts);
    } catch (error) {
      console.error("Failed to search posts:", error);
      toast.error("Failed to search posts");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitPost = async () => {
    // Refresh posts after creating
    await fetchPosts();
    setShowSubmitSuccess(true);
    setShowCreatePost(false);
    setTimeout(() => setShowSubmitSuccess(false), 3000);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost(postId);
      toast.success("Post deleted successfully");
      // Close dialog and refresh posts
      setShowPostDialog(false);
      setSelectedPost(null);
      await fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
      const errorMessage = error?.message || error?.error || "Failed to delete post";
      toast.error(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await deleteComment(commentId);
      toast.success("Comment deleted successfully");
      // Refresh post details to update comments
      if (selectedPost?.id) {
        const postData = await getPost(selectedPost.id);
        setSelectedPost(transformPost(postData));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      const errorMessage = error?.message || error?.error || "Failed to delete comment";
      toast.error(errorMessage);
    }
  };

  // Generate uniform square grid pattern - memoized to prevent re-renders
  const gridPattern = useMemo(() => {
    const postsToUse = activeTab === "search" ? searchResults : posts;
    if (postsToUse.length === 0) return [];
    
    // All posts are displayed as uniform squares
    return postsToUse.map(post => ({
      type: 'square',
      span: 1,
      posts: [post]
    }));
  }, [posts, searchResults, activeTab]);

  const handleServiceClick = (serviceName) => {
    console.log("Navigate to service:", serviceName);
  };

  const handleReport = (postId) => {
    setReportedPostId(postId);
    setShowReportDialog(true);
  };

  const getUserPosts = (userId) => {
    return posts.filter((p) => p?.user?.id === userId);
  };

  const handleLike = async (post) => {
    try {
      const result = await toggleLike(post.id);
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => {
          if (p.id === post.id) {
            const newLiked = result.status === "liked";
            return {
              ...p,
              likes: newLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
            };
          }
          return p;
        })
      );
      if (selectedPost?.id === post.id) {
        setSelectedPost(prev => ({
          ...prev,
          likes: result.status === "liked" ? prev.likes + 1 : Math.max(0, prev.likes - 1),
        }));
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast.error("Failed to like post");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedPost) return;

    try {
      const result = await addComment(selectedPost.id, comment);
      // Update selected post with new comment
      setSelectedPost(prev => ({
        ...prev,
        comments: prev.comments + 1,
        _apiData: {
          ...prev._apiData,
          comments: [...(prev._apiData?.comments || []), result],
          comment_count: (prev._apiData?.comment_count || 0) + 1,
        },
      }));
      setComment("");
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowPostDialog(true);
  };

  const sidebarItems = [
    { icon: Home, label: translations.home || "Home", tab: "home" },
    { icon: Plus, label: translations.create || "Create", tab: "create", isCreate: true },
    { icon: Search, label: translations.search || "Search", tab: "search" },
  ];

  const renderGrid = (posts) => {
    return (
      <div className="grid grid-cols-4 gap-4 p-5">
        {gridPattern.map((pattern, idx) => {
          const post = pattern.posts[0];
          if (!post) return null;
          
          return (
            <div
              key={`${post.id}-${idx}`}
              className="relative cursor-pointer group overflow-hidden w-full"
              style={{ aspectRatio: '1 / 1' }}
              onClick={() => handlePostClick(post)}
            >
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-5 h-5 fill-white" />
                    <span className="font-semibold text-sm">{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span className="font-semibold text-sm">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === "search") {
      return (
        <div className="p-4 md:p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder={translations.searchPlaceholder || "Search by hashtag (e.g., #Hanoi, #HaLongTour)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg h-12"
            />
          </div>
          {loading || isSearching ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : searchResults.length === 0 && searchQuery.trim() ? (
            <div className="text-center py-10 text-gray-500">
              {translations.noResults || "No posts found"}
            </div>
          ) : (
            renderGrid(searchResults)
          )}
        </div>
      );
    }

    // Home tab - Dynamic Photo grid
    if (loading) {
      return (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          {translations.noPosts || "No posts yet"}
        </div>
      );
    }

    return <div>{renderGrid(posts)}</div>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Success Alert */}
      {showSubmitSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <Alert className="bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-700 shadow-lg">
            <Check className="w-4 h-4 text-green-600 dark:text-green-300" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {translations.postSubmitted || "Post submitted successfully!"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex">
        {/* Left Sidebar - Desktop */}
        <aside className={`hidden lg:flex lg:flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-black z-[90] transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-20 xl:w-64'}`}>
          {/* Navigation */}
          <nav className="flex-1 px-2 xl:px-3 py-6">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab && !item.isCreate;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    if (item.isCreate) {
                      setShowCreatePost(true);
                    } else {
                      setActiveTab(item.tab);
                    }
                  }}
                  className={`w-full flex items-center justify-center xl:justify-start gap-4 px-3 xl:px-4 py-3.5 rounded-2xl mb-2 transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg shadow-lg"
                      : "hover:bg-gray-100 dark:hover:bg-gray-900/70 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Icon className={`${isSidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6'} ${isActive ? "" : "group-hover:scale-110"} transition-all`} />
                  {!isSidebarCollapsed && <span className="hidden xl:block text-base font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Collapse/Expand Button */}
          <div className="p-2 xl:p-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center xl:justify-start gap-3 px-2 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-all group"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={`${isSidebarCollapsed ? 'w-7 h-7' : 'w-6 h-6'} text-gray-700 dark:text-gray-300 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              {!isSidebarCollapsed && <span className="hidden xl:block text-sm font-medium text-gray-700 dark:text-gray-300">{translations.collapse || "Collapse"}</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-20 xl:ml-64'}`}>
          {/* Top Bar - Mobile */}
          <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 backdrop-blur-lg bg-white/80 dark:bg-black/80">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              {translations.travelCommunity || "Travel Social"}
            </h1>
          </div>

          {/* Content */}
          {renderContent()}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCreatePost={() => setShowCreatePost(!showCreatePost)}
      />

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className={`max-w-3xl w-[min(90vw,900px)] max-h-[80vh] p-0 bg-white dark:bg-black border-0 [&>button]:hidden !left-[50%] !top-[calc(50%+2rem)] !translate-x-[-50%] !translate-y-[-50%] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:!left-[calc(50%+2.5rem)] xl:!left-[calc(50%+2.5rem)]' : 'lg:!left-[calc(50%+2.5rem)] xl:!left-[calc(50%+8rem)]'}`}>
          <CreatePostSection onSubmit={handleSubmitPost} />
        </DialogContent>
      </Dialog>

      {/* Post Detail Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className={`!max-w-[1100px] !w-[85vw] !max-h-[80vh] !p-0 !gap-0 bg-white dark:bg-gray-900 overflow-hidden !border-gray-200 dark:!border-gray-700 rounded-xl !left-[50%] !top-[calc(50%+2rem)] !translate-x-[-50%] !translate-y-[-50%] transition-all duration-300 ${isSidebarCollapsed ? 'lg:!left-[calc(50%+2.5rem)] xl:!left-[calc(50%+2.5rem)]' : 'lg:!left-[calc(50%+2.5rem)] xl:!left-[calc(50%+8rem)]'}`}>
          {selectedPost && (
            <div className="grid md:grid-cols-[2fr_1fr] h-[80vh]">
              {/* Image Side */}
              <div className="relative bg-black dark:bg-gray-900 flex items-center justify-center">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.caption}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Post Details Side */}
              <div className="flex flex-col h-full bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 p-0.5">
                      <Avatar className="w-full h-full border-2 border-white dark:border-gray-900">
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {selectedPost?.user?.displayName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{selectedPost?.user?.username || "Unknown"}</p>
                      {selectedPost.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{selectedPost.location}</p>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleDeletePost(selectedPost.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                {/* Caption & Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Original Post */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                      {selectedPost?.user?.displayName?.[0] || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold mr-2 text-gray-900 dark:text-gray-100">{selectedPost?.user?.username}</span>
                        <span className="text-gray-800 dark:text-gray-200">
                          {selectedPost.caption || ""}
                        </span>
                      </p>
                      {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedPost.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{selectedPost.timestamp}</p>
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {selectedPost._apiData?.comments && selectedPost._apiData.comments.length > 0 ? (
                      selectedPost._apiData.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                            {comment.author?.[0] || "U"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-semibold mr-2 text-gray-900 dark:text-gray-100">{comment.author || "Unknown"}</span>
                                  <span className="text-gray-800 dark:text-gray-200">{comment.content}</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {comment.created_at ? new Date(comment.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ""}
                                </p>
                              </div>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-4">
                        {translations.noComments || "No comments yet"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent"
                        onClick={() => {
                          setLiked(!liked);
                          if (selectedPost) handleLike(selectedPost);
                        }}
                      >
                        <Heart className={`w-7 h-7 transition-all ${liked ? "fill-red-500 text-red-500" : "text-gray-700 dark:text-gray-300"}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                        <MessageCircle className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                        <Send className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {(selectedPost.likes + (liked ? 1 : 0)).toLocaleString()} likes
                  </p>

                  {/* Comment Input */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                      <Smile className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </Button>
                    <Input
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    {comment && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm h-auto p-0"
                        onClick={handleAddComment}
                      >
                        Post
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        postId={reportedPostId}
      />
    </div>
  );
}

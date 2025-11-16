import React, { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import { Search, Check, Home, Plus, User, ShoppingBag, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, MapPin, X, Smile, ChevronLeft } from "lucide-react";
import SocialPost from "./SocialPost";
import CreatePostSection from "./CreatePostSection";
import ReportDialog from "./ReportDialog";
import { Dialog, DialogContent } from "../ui/dialog";

import BottomNavigation from "./BottomNavigation";
import { mockPosts } from "./mockData";
import { useLanguage } from "../../context/LanguageContext";

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
  const [saved, setSaved] = useState(false);
  const [comment, setComment] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { translations } = useLanguage();

  // Generate random layout pattern - memoized to prevent re-renders
  const gridPattern = useMemo(() => {
    const patterns = [];
    let index = 0;
    
    while (index < mockPosts.length) {
      const rand = Math.random();
      
      if (rand < 0.2 && index < mockPosts.length) {
        // 20% chance: Vertical rectangle (tall, spans 2 rows)
        patterns.push({ type: 'rect-tall', span: 2, posts: [mockPosts[index]] });
        index += 1;
      } else if (rand < 0.35 && index + 1 < mockPosts.length) {
        // 15% chance: Two squares side by side
        patterns.push({ type: 'square', span: 1, posts: [mockPosts[index]] });
        patterns.push({ type: 'square', span: 1, posts: [mockPosts[index + 1]] });
        index += 2;
      } else {
        // 65% chance: Regular square
        patterns.push({ type: 'square', span: 1, posts: [mockPosts[index]] });
        index += 1;
      }
    }
    
    return patterns;
  }, []);

  const handleServiceClick = (serviceName) => {
    console.log("Navigate to service:", serviceName);
  };

  const handleReport = (postId) => {
    setReportedPostId(postId);
    setShowReportDialog(true);
  };

  const handleSubmitPost = () => {
    setShowSubmitSuccess(true);
    setShowCreatePost(false);
    setTimeout(() => setShowSubmitSuccess(false), 3000);
  };

  const getUserPosts = (userId) => {
    return mockPosts.filter((p) => p?.user?.id === userId);
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
      <div className="grid grid-cols-3 gap-1 auto-rows-[180px] p-1">
        {gridPattern.map((pattern, idx) => {
          const post = pattern.posts[0];
          if (!post) return null;
          
          return (
            <div
              key={`${post.id}-${idx}`}
              className={`relative cursor-pointer group overflow-hidden ${
                pattern.type === 'rect-tall' ? 'col-span-1 row-span-2' : 'col-span-1 row-span-1'
              }`}
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
              placeholder={translations.searchPlaceholder || "Search posts, users, locations..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg h-12"
            />
          </div>
          {renderGrid(mockPosts)}
        </div>
      );
    }

    // Home tab - Dynamic Photo grid
    return (
      <div>
        {renderGrid(mockPosts)}
      </div>
    );
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </Button>
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
                        <span className="text-gray-800 dark:text-gray-200">{selectedPost.caption}</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedPost.hashtags.map((tag, idx) => (
                          <span key={idx} className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{selectedPost.timestamp}</p>
                    </div>
                  </div>

                  {/* Mock Comments */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                        J
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold mr-2 text-gray-900 dark:text-gray-100">john_traveler</span>
                          <span className="text-gray-800 dark:text-gray-200">Amazing view! 😍</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">2h</p>
                      </div>
                    </div>
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
                        onClick={() => setLiked(!liked)}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => setSaved(!saved)}
                    >
                      <Bookmark className={`w-7 h-7 ${saved ? "fill-current text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`} />
                    </Button>
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
                        onClick={() => setComment("")}
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

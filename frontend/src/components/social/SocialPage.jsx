import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Search, Check } from "lucide-react";
import SocialPost from "./SocialPost";
import CreatePostDialog from "./CreatePostDialog";
import ReportDialog from "./ReportDialog";
import StoriesSection from "./StoriesSection";
import BottomNavigation from "./BottomNavigation";
import { mockPosts } from "./mockData";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportedPostId, setReportedPostId] = useState(null);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  const handleServiceClick = (serviceName) => {
    console.log("Navigate to service:", serviceName);
    // Logic chuyển đến trang chi tiết dịch vụ
  };

  const handleReport = (postId) => {
    setReportedPostId(postId);
    setShowReportDialog(true);
  };

  const handleSubmitPost = () => {
    setShowCreatePost(false);
    setShowSubmitSuccess(true);
    setTimeout(() => setShowSubmitSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Section */}
      <div className="bg-white border-b">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="m-0">Cộng đồng Du lịch</h2>
              <p className="text-muted-foreground mt-1">
                Chia sẻ và khám phá hành trình của bạn
              </p>
            </div>
            <CreatePostDialog
              open={showCreatePost}
              onOpenChange={setShowCreatePost}
              onSubmit={handleSubmitPost}
            />
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {showSubmitSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
          <Alert className="bg-green-50 border-green-200">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Bài viết đã được gửi và đang chờ kiểm duyệt!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bài viết, hashtag..."
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        {/* Stories Section */}
        <StoriesSection />

        {/* Posts Feed */}
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <SocialPost
              key={post.id}
              post={post}
              onServiceClick={handleServiceClick}
              onReport={handleReport}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <Button variant="outline">Xem thêm bài viết</Button>
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setShowCreatePost(true)}
      />

      {/* Report Dialog */}
      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        postId={reportedPostId}
      />
    </div>
  );
}

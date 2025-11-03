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
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportedPostId, setReportedPostId] = useState(null);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  const { translations } = useLanguage(); // 👈 lấy translations

  const handleServiceClick = (serviceName) => {
    console.log("Navigate to service:", serviceName);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white">
      {/* Top Section */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="m-0 text-title dark:text-white">
                {translations.travelCommunity}
              </h2>
              <p className="text-muted-foreground dark:text-gray-400 mt-1">
                {translations.shareJourney}
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
          <Alert className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
            <Check className="w-4 h-4 text-green-600 dark:text-green-300" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {translations.postSubmitted}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder={translations.searchPlaceholder}
              className="pl-9 bg-muted/50 dark:bg-gray-800 dark:text-white"
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
          <Button variant="outline" className="dark:border-gray-600 dark:text-white">
            {translations.loadMore}
          </Button>
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

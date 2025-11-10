import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Search, Check } from "lucide-react";
import SocialPost from "./SocialPost";
import CreatePostDialog from "./CreatePostDialog";
import ReportDialog from "./ReportDialog";
import StoriesSection from "./StoriesSection";
import BottomNavigation from "./BottomNavigation";
import { useLanguage } from "../../context/LanguageContext";
import { getAllPosts, createPost, getAllTags, searchPosts } from "../../api/social";

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportedPostId, setReportedPostId] = useState(null);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { translations } = useLanguage();

  // Load posts when component mounts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getAllPosts();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const loadTags = async () => {
      try {
        const data = await getAllTags();
        setTags(data);
      } catch (err) {
        console.error('Error loading tags:', err);
      }
    };

    loadPosts();
    loadTags();
  }, []);

  // Handle search with detailed error handling
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        setHasSearched(true);
        setError(null);
        
        try {
          const results = await searchPosts(searchQuery);
          setSearchResults(results);
          if (results.length === 0) {
            setError(translations.noResults || 'No posts found matching your search.');
          }
        } catch (err) {
          console.error('Error searching posts:', err);
          // Try to extract detailed error message if available
          let errorMessage = translations.networkError || 'Search failed. Please try again.';
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          }
          setError(errorMessage);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setHasSearched(false);
        setError(null);
      }
    }, 500); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery, translations.networkError]);

  const handleServiceClick = (serviceName) => {
    console.log("Navigate to service:", serviceName);
  };

  const handleReport = (postId) => {
    setReportedPostId(postId);
    setShowReportDialog(true);
  };

  const handleSubmitPost = async (postData) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      if (!user) {
        setError('Please login to create a post');
        return;
      }

      const result = await createPost({
        authorEmail: user.email,
        content: postData.content,
        imageUrl: postData.image_url
      });


      setPosts(prev => [result, ...prev]);
      if (searchQuery) {
        setSearchResults(prev => [result, ...prev]);
      }
      
      setShowCreatePost(false);
      setShowSubmitSuccess(true);
      setTimeout(() => setShowSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'Failed to create post');
    }
  };

  const handleTagClick = async (tagName) => {
    setSearchQuery(`#${tagName}`);
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="p-2 border-b dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {translations.hashtagResults}
                  </p>
                </div>
                {tags
                  .filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(tag => (
                    <button
                      key={tag.name}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleTagClick(tag.name)}
                    >
                      <span className="text-blue-500 dark:text-blue-400">#{tag.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {tag.post_count} {translations.posts}
                      </span>
                    </button>
                  ))}
                {searchQuery.startsWith('#') && (
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-blue-500 dark:text-blue-400"
                    onClick={() => handleTagClick(searchQuery.substring(1))}
                  >
                    {translations.searchForTag} {searchQuery}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stories Section */}
        <StoriesSection />

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
            <AlertDescription className="text-red-800 dark:text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
                {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {searchQuery ? (
              // Show search results
              isSearching ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                </div>
              ) : (
                <>
                  {searchResults.map((post) => (
                    <SocialPost
                      key={post.id}
                      post={post}
                      onServiceClick={handleServiceClick}
                      onReport={handleReport}
                    />
                  ))}
                  {searchResults.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                      {translations.noResults}
                    </div>
                  )}
                </>
              )
            ) : (
              // Show regular feed
              <>
                {posts.map((post) => (
                  <SocialPost
                    key={post.id}
                    post={post}
                    onServiceClick={handleServiceClick}
                    onReport={handleReport}
                  />
                ))}
                {posts.length === 0 && !error && (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {translations.noPosts}
                  </div>
                )}
              </>
            )}
          </div>
        )}

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

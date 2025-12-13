import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Image, MapPin, X, Camera, AlertCircle, Hash } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { createPost, uploadImage, searchHashtags } from "../../api/social";
import { useToast } from "../../context/ToastContext";

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

export default function CreatePostSection({ onSubmit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [hashtagSuggestions, setHashtagSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const hashtagInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { translations, language } = useLanguage();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  // Search hashtags when query changes
  useEffect(() => {
    if (hashtagQuery.trim()) {
      const timeoutId = setTimeout(async () => {
        try {
          const results = await searchHashtags(hashtagQuery, 10);
          setHashtagSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to search hashtags:", error);
        }
      }, 300); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      setHashtagSuggestions([]);
      setShowSuggestions(false);
    }
  }, [hashtagQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        hashtagInputRef.current &&
        !hashtagInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Show preview immediately
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages([...selectedImages, ...previewUrls]);

    // Upload images to server
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadImage(file);
        return result.url;
      });
      const urls = await Promise.all(uploadPromises);
      setUploadedImageUrls([...uploadedImageUrls, ...urls]);
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
      // Remove previews on error
      setSelectedImages(selectedImages.filter((_, i) => i < selectedImages.length));
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("Please log in to create a post");
      return;
    }

    if (!caption.trim() && uploadedImageUrls.length === 0) {
      toast.error("Please add a caption or image");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Combine caption with hashtags
      const hashtagText = selectedHashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
      const fullContent = [caption, hashtagText, location ? `📍 ${location}` : ''].filter(Boolean).join('\n');

      // Use first uploaded image URL (or empty if none)
      const imageUrl = uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null;

      await createPost({
        content: caption,
        image_url: imageUrl,
        hashtags: selectedHashtags,
      });

      toast.success("Post created successfully!");
      onSubmit();
      
      // Reset form
      setCaption("");
      setLocation("");
      setSelectedHashtags([]);
      setSelectedImages([]);
      setUploadedImageUrls([]);
      setHashtagQuery("");
      setHashtagSuggestions([]);
      setShowSuggestions(false);
      setIsExpanded(false);
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(error.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setCaption("");
    setLocation("");
    setSelectedHashtags([]);
    setSelectedImages([]);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    // Collapsed view - simplified modern design
    return (
      <Card className="mb-0 sm:mb-6 p-4 bg-white dark:bg-black border-0 sm:border border-gray-200 dark:border-gray-800 rounded-none sm:rounded-lg shadow-none sm:shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md">
            U
          </div>

          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-gray-200 dark:border-gray-800 text-sm"
          >
            {translations.whatAreYouThinking || "What's on your mind?"}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-900 flex items-center justify-around">
          <Button
            variant="ghost"
            className="flex-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
            onClick={() => setIsExpanded(true)}
          >
            <Image className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium">{translations.photoVideo || "Photo/Video"}</span>
          </Button>
        </div>
      </Card>
    );
  }

  // Expanded view - Full create post form
  return (
    <div className="w-full max-h-[80vh] bg-white dark:bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <h3 className="font-bold text-lg text-black dark:text-white">
          {translations.createPost || "Create Post"}
        </h3>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30">
          U
        </div>
        <div>
          <p className="font-semibold text-sm text-black dark:text-white">{currentUser?.username || "User"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email || ""}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {/* Caption */}
        <div className="space-y-2">
          <Textarea
            placeholder={
              translations.captionPlaceholder ||
              "Share your story... ✨"
            }
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-white dark:bg-gray-900/50 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none border border-gray-200 dark:border-gray-700 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 rounded-xl text-base p-4"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          {selectedImages.length === 0 ? (
            <div className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                id="media-upload"
                onChange={handleImageUpload}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <p className="text-black dark:text-white font-semibold text-sm mb-1">
                  {translations.uploadMedia || "Click to upload photo or video"}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {translations.dragDropHint || "Drag and drop or click to browse"}
                </p>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {selectedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {selectedImages.length < 10 && (
                <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-all border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    id="media-upload-more"
                    onChange={handleImageUpload}
                  />
                  <label
                    htmlFor="media-upload-more"
                    className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                  >
                    <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Add more</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder={translations.addLocation || "Add location..."}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-900/50 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-gray-700 rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
            />
          </div>
        </div>

        {/* Hashtags with Autocomplete */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-black dark:text-white">
            {translations.addHashtags || "Add Hashtags"}
          </Label>
          <div className="relative">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <Input
                ref={hashtagInputRef}
                placeholder={
                  language === 'vi' 
                    ? "Nhập hashtag (ví dụ: #HaNoi, #TourSapa)..."
                    : "Enter hashtag (e.g., #HaNoi, #TourSapa)..."
                }
                value={hashtagQuery}
                onChange={(e) => setHashtagQuery(e.target.value)}
                onFocus={() => hashtagQuery.trim() && setShowSuggestions(true)}
                className="pl-10 bg-gray-50 dark:bg-gray-900/50 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-gray-700 rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400"
              />
            </div>
            {showSuggestions && hashtagSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
              >
                {hashtagSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const hashtag = suggestion.hashtag.startsWith('#') 
                        ? suggestion.hashtag 
                        : `#${suggestion.hashtag}`;
                      if (!selectedHashtags.includes(hashtag)) {
                        setSelectedHashtags([...selectedHashtags, hashtag]);
                      }
                      setHashtagQuery("");
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {suggestion.hashtag}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {suggestion.usage_count} {translations.uses || "uses"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Selected Hashtags */}
          {selectedHashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedHashtags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="default"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedHashtags(selectedHashtags.filter((_, i) => i !== idx))}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
          
          {/* Hint text */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'vi' 
              ? "💡 Gợi ý: Sử dụng hashtag tên thành phố (ví dụ: #HaNoi) hoặc tên tour (ví dụ: #TourSapa)"
              : "💡 Tip: Use city name hashtags (e.g., #HaNoi) or tour name hashtags (e.g., #TourSapa)"}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 flex flex-col gap-3 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80">
        <Alert className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 py-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs ml-2">
            {translations.moderationNotice || "Your post will be reviewed before being published"}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 h-10 rounded-xl font-semibold border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {translations.cancel || "Cancel"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={(!caption.trim() && uploadedImageUrls.length === 0) || isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white border-0 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed h-10 rounded-xl font-semibold"
          >
            {isSubmitting ? (translations.posting || "Posting...") : (translations.post || "Post")}
          </Button>
        </div>
      </div>
    </div>
  );
}

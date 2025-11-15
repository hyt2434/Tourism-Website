import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { Image, MapPin, X, Camera, AlertCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { suggestedHashtags } from "./mockData";

// 👈 MOCK CURRENT USER
const currentUser = {
  id: "user_123",
  username: "current_user",
  displayName: "Minh Hoàng",
};

export default function CreatePostSection({ onSubmit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const { translations } = useLanguage();

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setSelectedImages([...selectedImages, ...imageUrls]);
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log("Submit post:", {
      caption,
      location,
      selectedHashtags,
      selectedImages,
    });
    onSubmit();
    // Reset form
    setCaption("");
    setLocation("");
    setSelectedHashtags([]);
    setSelectedImages([]);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setCaption("");
    setLocation("");
    setSelectedHashtags([]);
    setSelectedImages([]);
    setIsExpanded(false);
  };

  if (!isExpanded) {
    // Collapsed view
    return (
      <Card className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-black dark:text-white">
              U
            </AvatarFallback>
          </Avatar>

          <button
            onClick={() => setIsExpanded(true)}
            className="flex-1 text-left px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-muted-foreground dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Bạn đang nghĩ gì?
          </button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around">
          <Button
            variant="ghost"
            className="flex-1 text-muted-foreground dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsExpanded(true)}
          >
            <Image className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            <span>Ảnh/video</span>
          </Button>
        </div>
      </Card>
    );
  }

  // Expanded view - Full create post form
  return (
    <Card className="mb-6 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-black dark:text-white">
          {translations.createPost || "Tạo bài viết"}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          {translations.moderationNotice ||
            "Bài viết sẽ được kiểm duyệt trước khi hiển thị"}
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* Caption */}
        <div className="space-y-2">
          <Label className="text-black dark:text-white">
            {translations.caption || "Nội dung"}
          </Label>
          <Textarea
            placeholder={
              translations.captionPlaceholder ||
              "Chia sẻ trải nghiệm của bạn..."
            }
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="bg-white dark:bg-gray-800 text-black dark:text-white resize-none"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label className="text-black dark:text-white">
            {translations.media || "Hình ảnh/Video"}
          </Label>

          {selectedImages.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-600">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                id="media-upload"
                onChange={handleImageUpload}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Camera className="w-10 h-10 mx-auto mb-2 text-muted-foreground dark:text-gray-400" />
                <p className="text-black dark:text-white">
                  {translations.uploadMedia || "Tải ảnh/video lên"}
                </p>
                <p className="text-muted-foreground dark:text-gray-400 text-sm mt-1">
                  {translations.maxFiles || "Tối đa 10 file"}
                </p>
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {selectedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {selectedImages.length < 10 && (
                <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-300 dark:border-gray-600">
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
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Camera className="w-8 h-8 text-muted-foreground dark:text-gray-400" />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-black dark:text-white">
            {translations.location || "Địa điểm"}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
            <Input
              placeholder={translations.addLocation || "Thêm địa điểm..."}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-9 bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <Label className="text-black dark:text-white">
            {translations.hashtags || "Hashtags"}
          </Label>
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {translations.hashtagsHint || "Chọn hashtags phù hợp"}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedHashtags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedHashtags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  if (selectedHashtags.includes(tag)) {
                    setSelectedHashtags(
                      selectedHashtags.filter((t) => t !== tag)
                    );
                  } else {
                    setSelectedHashtags([...selectedHashtags, tag]);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="dark:border-gray-600 dark:text-white"
          >
            {translations.cancel || "Hủy"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!caption.trim() && selectedImages.length === 0}
            className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
          >
            {translations.post || "Đăng"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

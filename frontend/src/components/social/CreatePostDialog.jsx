import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import { Plus, Camera, MapPin, X, AlertCircle } from "lucide-react";
import { suggestedHashtags } from "./mockData";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function CreatePostDialog({ open, onOpenChange, onSubmit }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [caption, setCaption] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState([]);

  const { translations } = useLanguage(); // 👈 lấy translations

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    console.log("Upload images:", files);
  };

  const handleSubmit = () => {
    console.log("Submit post:", { caption, selectedHashtags });
    onSubmit();
    setSelectedImages([]);
    setCaption("");
    setSelectedHashtags([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {translations.createPost}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>{translations.newPost}</DialogTitle>
          <DialogDescription>
            {translations.shareExperience}
          </DialogDescription>
        </DialogHeader>

        <Alert className="mt-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {translations.moderationNotice}
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{translations.media}</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                id="media-upload"
                onChange={handleImageUpload}
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground dark:text-gray-400" />
                <p>{translations.uploadMedia}</p>
                <p className="text-muted-foreground dark:text-gray-400">
                  {translations.maxFiles}
                </p>
              </label>
            </div>
            {/* ... giữ nguyên phần preview ảnh */}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label>{translations.caption}</Label>
            <Textarea
              placeholder={translations.captionPlaceholder}
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>{translations.hashtags}</Label>
            <p className="text-muted-foreground dark:text-gray-400">
              {translations.hashtagsHint}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedHashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant={
                    selectedHashtags.includes(tag) ? "default" : "outline"
                  }
                  className="cursor-pointer"
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

          {/* Location */}
          <div className="space-y-2">
            <Label>{translations.location}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
              <Input
                placeholder={translations.addLocation}
                className="pl-9 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
          </div>

          <Separator />

          {/* Privacy Notice */}
          <Alert className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <AlertDescription>{translations.privacyNotice}</AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-white"
            onClick={() => onOpenChange(false)}
          >
            {translations.cancel}
          </Button>
          <Button
            className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {translations.post}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

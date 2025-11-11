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
import { uploadImage } from "../../api/social";

export default function CreatePostDialog({ open, onOpenChange, onSubmit }) {
  const [selectedImages, setSelectedImages] = useState([]);
  const [caption, setCaption] = useState("");
  const [selectedHashtags, setSelectedHashtags] = useState([]);

  const { translations } = useLanguage(); // 👈 lấy translations

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const uploaded = [];
    for (const f of files) {
      try {
        // optimistic preview while uploading
        const preview = URL.createObjectURL(f);
        setSelectedImages((prev) => [...prev, { file: f, preview, url: null, uploading: true }]);

        const res = await uploadImage(f);
        const url = res?.url || null;

        // replace the last uploading item with final url
        setSelectedImages((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((p) => p.preview === preview && p.uploading);
          if (idx !== -1) {
            copy[idx] = { file: f, preview, url, uploading: false };
          } else {
            copy.push({ file: f, preview, url, uploading: false });
          }
          return copy;
        });
        uploaded.push(url);
      } catch (err) {
        console.error('Image upload failed', err);
        // mark uploading as false and include error flag
        setSelectedImages((prev) => {
          const copy = [...prev];
          const idx = copy.findIndex((p) => p.uploading);
          if (idx !== -1) {
            copy[idx] = { ...copy[idx], uploading: false, error: true };
          }
          return copy;
        });
      }
    }
  };

  const handleSubmit = () => {
    const postData = {
      content: caption,
      image_url: selectedImages[0]?.url || null
    };

    onSubmit(postData);
    
    // Reset form
    setSelectedImages([]);
    setCaption("");
    setSelectedHashtags([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Tạo bài viết
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm du lịch của bạn với cộng đồng
          </DialogDescription>
        </DialogHeader>

        <Alert className="mt-4 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Bài viết của bạn sẽ được kiểm duyệt trước khi hiển thị công khai.
            Vui lòng không đăng nội dung vi phạm hoặc thông tin nhạy cảm.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Ảnh/Video</Label>
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
                <p>Nhấn để tải ảnh hoặc video</p>
                <p className="text-muted-foreground dark:text-gray-400">Tối đa 10 tệp</p>
              </label>
            </div>
            {/* Image previews */}
            {selectedImages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img.url || img.preview}
                      alt={`preview-${i}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    {img.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-xs">
                        Uploading...
                      </div>
                    )}
                    {img.error && (
                      <div className="absolute top-1 right-1 text-red-500">
                        !
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute top-1 left-1 bg-white/80 rounded-full p-1"
                      onClick={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              placeholder="Chia sẻ câu chuyện của bạn..."
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtag dịch vụ</Label>
            <p className="text-muted-foreground dark:text-gray-400">
              Gắn hashtag để liên kết với tour, khách sạn, nhà hàng...
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
            <Label>Vị trí</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-gray-400" />
              <Input
                placeholder="Thêm vị trí..."
                className="pl-9 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
            </div>
          </div>

          <Separator />

          {/* Privacy Notice */}
          <Alert className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <AlertDescription>
              <strong>Quyền riêng tư:</strong> Hồ sơ của bạn chỉ hiển thị tên và
              ảnh đại diện. Thông tin cá nhân khác sẽ được ẩn.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="dark:border-gray-600 dark:text-white"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Đăng bài
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

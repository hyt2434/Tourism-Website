import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

const reportReasons = [
  "Nội dung không phù hợp",
  "Spam hoặc lừa đảo",
  "Thông tin sai sự thật",
  "Vi phạm bản quyền",
  "Khác",
];

export default function ReportDialog({ open, onOpenChange, postId }) {
  const handleReport = (reason) => {
    console.log("Report reason:", reason, "Post ID:", postId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-title dark:text-white">
            Báo cáo bài viết
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-gray-400">
            Vui lòng chọn lý do báo cáo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {reportReasons.map((reason) => (
            <Button
              key={reason}
              variant="outline"
              className="w-full justify-start border-gray-300 dark:border-gray-600 text-black dark:text-white"
              onClick={() => handleReport(reason)}
            >
              {reason}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

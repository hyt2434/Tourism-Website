import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useLanguage } from "../../context/LanguageContext"; // 👈 thêm

export default function ReportDialog({ open, onOpenChange, postId }) {
  const { translations } = useLanguage(); // 👈 lấy translations

  const reportReasons = [
    translations.reasonInappropriate,
    translations.reasonSpam,
    translations.reasonFalseInfo,
    translations.reasonCopyright,
    translations.reasonOther,
  ];

  const handleReport = (reason) => {
    console.log("Report reason:", reason, "Post ID:", postId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-900 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-title dark:text-white">
            {translations.reportPost}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-gray-400">
            {translations.chooseReason}
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

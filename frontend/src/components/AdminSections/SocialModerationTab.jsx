import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { 
  Eye, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  MessageSquare,
  Image as ImageIcon,
  Search,
  Filter,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Calendar,
  Clock
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../ui/dialog";

export default function SocialModerationTab() {
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  // Mock data for social posts
  const mockSocialPosts = [
    {
      id: 1,
      user: "Nguyen Van A",
      userAvatar: "N",
      content: "Just visited Ha Long Bay! The scenery was absolutely breathtaking. Can't wait to go back! 🌊✨",
      image: "https://via.placeholder.com/400x300",
      likes: 245,
      comments: 32,
      shares: 18,
      status: "pending",
      reports: 0,
      date: "2025-11-15 14:30",
      location: "Ha Long Bay, Quang Ninh"
    },
    {
      id: 2,
      user: "Tran Thi B",
      userAvatar: "T",
      content: "Amazing food tour in Hanoi Old Quarter! The street food here is incredible. Highly recommend the pho and banh mi! 🍜",
      image: "https://via.placeholder.com/400x300",
      likes: 189,
      comments: 24,
      shares: 12,
      status: "pending",
      reports: 0,
      date: "2025-11-15 10:15",
      location: "Hanoi Old Quarter"
    },
    {
      id: 3,
      user: "Le Van C",
      userAvatar: "L",
      content: "This is spam content trying to advertise services. Contact me for cheap tours!",
      image: null,
      likes: 5,
      comments: 2,
      shares: 0,
      status: "pending",
      reports: 3,
      date: "2025-11-14 18:45",
      location: null
    },
    {
      id: 4,
      user: "Pham Thi D",
      userAvatar: "P",
      content: "Sunset at Phu Quoc beach was magical! 🌅 Perfect end to a perfect day.",
      image: "https://via.placeholder.com/400x300",
      likes: 512,
      comments: 67,
      shares: 45,
      status: "approved",
      reports: 0,
      date: "2025-11-13 19:20",
      location: "Phu Quoc Island"
    },
    {
      id: 5,
      user: "Hoang Van E",
      userAvatar: "H",
      content: "Terrible experience with this hotel. Dirty rooms and rude staff. Avoid at all costs!",
      image: "https://via.placeholder.com/400x300",
      likes: 23,
      comments: 8,
      shares: 2,
      status: "pending",
      reports: 5,
      date: "2025-11-14 12:00",
      location: "Da Nang"
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "pending":
        return { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", icon: <AlertTriangle className="w-3 h-3" />, text: "Pending Review" };
      case "approved":
        return { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: <CheckCircle2 className="w-3 h-3" />, text: "Approved" };
      case "rejected":
        return { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: <XCircle className="w-3 h-3" />, text: "Rejected" };
      default:
        return { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300", icon: null, text: status };
    }
  };

  const filteredPosts = mockSocialPosts.filter(post => {
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search posts by content or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            className="h-12"
          >
            All Posts
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
            className="h-12 bg-orange-600 hover:bg-orange-700 data-[state=active]:bg-orange-600"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </Button>
          <Button
            variant={filterStatus === "approved" ? "default" : "outline"}
            onClick={() => setFilterStatus("approved")}
            className="h-12"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approved
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            Social Post Moderation
          </CardTitle>
          <CardDescription>
            Review and moderate user-generated social media content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const statusBadge = getStatusBadge(post.status);
              
              return (
                <Card
                  key={post.id}
                  className="bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* User Avatar */}
                      <Avatar className="w-12 h-12 ring-2 ring-gray-200 dark:ring-gray-700">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-lg">
                          {post.userAvatar}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-lg">{post.user}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3" />
                              {post.date}
                              {post.location && (
                                <>
                                  <span>•</span>
                                  <span>📍 {post.location}</span>
                                </>
                              )}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusBadge.color} border-0 font-semibold flex items-center gap-1`}>
                              {statusBadge.icon}
                              {statusBadge.text}
                            </Badge>
                            {post.reports > 0 && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-0 font-semibold flex items-center gap-1">
                                <Flag className="w-3 h-3" />
                                {post.reports} Reports
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                          {post.content}
                        </p>

                        {/* Post Image */}
                        {post.image && (
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 flex items-center justify-center mb-4 overflow-hidden">
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-6 py-3 border-t border-b border-gray-200 dark:border-gray-700 mb-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-semibold">{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MessageCircle className="w-4 h-4" />
                            <span className="font-semibold">{post.comments}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Share2 className="w-4 h-4" />
                            <span className="font-semibold">{post.shares}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => setSelectedPost(post)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Post Details</DialogTitle>
                                <DialogDescription>
                                  Review complete post information
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 mt-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                                      {selectedPost?.userAvatar}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-bold">{selectedPost?.user}</p>
                                    <p className="text-sm text-gray-500">{selectedPost?.date}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Content</h4>
                                  <p className="text-gray-700 dark:text-gray-300">{selectedPost?.content}</p>
                                </div>
                                
                                {selectedPost?.location && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Location</h4>
                                    <p className="text-gray-700 dark:text-gray-300">📍 {selectedPost?.location}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Engagement</h4>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Likes</p>
                                      <p className="text-2xl font-bold">{selectedPost?.likes}</p>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Comments</p>
                                      <p className="text-2xl font-bold">{selectedPost?.comments}</p>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                                      <p className="text-sm text-gray-600 dark:text-gray-400">Shares</p>
                                      <p className="text-2xl font-bold">{selectedPost?.shares}</p>
                                    </div>
                                  </div>
                                </div>

                                {selectedPost?.reports > 0 && (
                                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                                      ⚠️ This post has been reported {selectedPost?.reports} times
                                    </h4>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                      Please review carefully for policy violations
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {post.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No posts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

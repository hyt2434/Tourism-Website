import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  Search, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle2,
  Mail,
  Calendar,
  Shield,
  User,
  Key,
  MoreVertical,
  UserX,
  UserCheck,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../ui/dialog";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { useLanguage } from "../../context/LanguageContext";
import { getAllUsers, updateUser, updateUserStatus, resetUserPassword, deleteUser } from "../../api/admin";

export default function UserManagementTab() {
  const { translations: t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordInfo, setResetPasswordInfo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", description: "", onConfirm: () => {} });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize] = useState(10);
  
  // Form state for edit dialog
  const [editForm, setEditForm] = useState({ username: "", email: "", role: "" });

  // Fetch users on component mount and when page changes
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers(page, pageSize);
      setUsers(data.users || []);
      setTotalPages(data.total_pages || 1);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // Handle user role update
  const handleUpdateUser = async (userId, username, email, role) => {
    try {
      console.log("[DEBUG Frontend] Updating user:", { userId, username, email, role });
      await updateUser(userId, { username, email, role });
      await fetchUsers(currentPage); // Refresh the list
      setEditDialogOpen(false);
      showToast("User updated successfully", "success");
    } catch (err) {
      showToast(`Failed to update user: ${err.message}`, "error");
    }
  };

  // Handle user status toggle (ban/unban)
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    const action = newStatus === "banned" ? "ban" : "unban";
    
    setConfirmDialog({
      open: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      description: `Are you sure you want to ${action} this user?`,
      onConfirm: async () => {
        try {
          await updateUserStatus(userId, newStatus);
          await fetchUsers(currentPage);
          showToast(`User ${action}ned successfully`, "success");
        } catch (err) {
          showToast(`Failed to ${action} user: ${err.message}`, "error");
        }
      }
    });
  };

  // Handle password reset
  const handleResetPassword = async (userId) => {
    setConfirmDialog({
      open: true,
      title: "Reset Password",
      description: "Are you sure you want to reset this user's password?",
      onConfirm: async () => {
        try {
          const result = await resetUserPassword(userId);
          setResetPasswordInfo(result);
          setResetPasswordDialogOpen(true);
          await fetchUsers(currentPage);
        } catch (err) {
          showToast(`Failed to reset password: ${err.message}`, "error");
        }
      }
    });
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    setConfirmDialog({
      open: true,
      title: "Delete User",
      description: "Are you sure you want to delete this user? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteUser(userId);
          await fetchUsers(currentPage);
          showToast("User deleted successfully", "success");
        } catch (err) {
          showToast(`Failed to delete user: ${err.message}`, "error");
        }
      }
    });
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "partner": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "client": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "banned": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-5 duration-300">
          <div className={`min-w-[300px] max-w-md rounded-lg shadow-2xl border-l-4 p-4 backdrop-blur-sm ${
            toast.type === "success" 
              ? "bg-white/95 dark:bg-gray-800/95 border-green-500" 
              : "bg-white/95 dark:bg-gray-800/95 border-red-500"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-1 rounded-full ${
                toast.type === "success" 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-red-100 dark:bg-red-900/30"
              }`}>
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {toast.type === "success" ? "Success" : "Error"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={t.searchUsers}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filterRole === "all" ? "default" : "outline"}
            onClick={() => setFilterRole("all")}
            className="h-12"
          >
            {t.allUsers}
          </Button>
          <Button
            variant={filterRole === "client" ? "default" : "outline"}
            onClick={() => setFilterRole("client")}
            className="h-12"
          >
            <User className="w-4 h-4 mr-2" />
            {t.clients}
          </Button>
          <Button
            variant={filterRole === "partner" ? "default" : "outline"}
            onClick={() => setFilterRole("partner")}
            className="h-12"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {t.partners}
          </Button>
          <Button
            variant={filterRole === "admin" ? "default" : "outline"}
            onClick={() => setFilterRole("admin")}
            className="h-12"
          >
            <Shield className="w-4 h-4 mr-2" />
            {t.admins}
          </Button>
        </div>
      </div>

      {/* User Table */}
      <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {t.userManagement}
          </CardTitle>
          <CardDescription>
            {t.userManagementDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 dark:text-gray-300 mt-4">Loading users...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 font-semibold">Error: {error}</p>
              <Button onClick={fetchUsers} className="mt-4 bg-blue-600 hover:bg-blue-700">Retry</Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.username}</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.role}</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.status}</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.joined}</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.lastLogin}</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.bookings}</th>
                      <th className="text-right py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getRoleBadgeColor(user.role)} border-0 font-semibold`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getStatusBadgeColor(user.status)} border-0 font-semibold flex items-center gap-1 w-fit`}>
                        {user.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <UserX className="w-3 h-3" />
                        )}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        {user.createdAt}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200 text-sm">
                      {user.lastLogin}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {user.totalBookings}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                              onClick={() => {
                                setSelectedUser(user);
                                setEditForm({ username: user.username, email: user.email, role: user.role });
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {t.edit}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-gray-900 dark:text-white">{t.editUser}: {selectedUser?.username}</DialogTitle>
                              <DialogDescription className="text-gray-600 dark:text-gray-300">
                                {t.updateUserInfo}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label className="text-gray-700 dark:text-gray-200">{t.username}</Label>
                                <Input 
                                  value={editForm.username}
                                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" 
                                />
                              </div>
                              <div>
                                <Label className="text-gray-700 dark:text-gray-200">{t.email}</Label>
                                <Input 
                                  type="email" 
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" 
                                />
                              </div>
                              <div>
                                <Label className="text-gray-700 dark:text-gray-200">{t.role}</Label>
                                <select 
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                  value={editForm.role}
                                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                >
                                  <option value="client">{t.client}</option>
                                  <option value="partner">{t.partner}</option>
                                  <option value="admin">{t.adminRole}</option>
                                </select>
                              </div>
                            </div>
                            
                            <DialogFooter className="mt-6">
                              <Button 
                                variant="outline" 
                                onClick={() => setEditDialogOpen(false)}
                                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {t.cancel}
                              </Button>
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  handleUpdateUser(selectedUser.id, editForm.username, editForm.email, editForm.role);
                                }}
                              >
                                {t.saveChanges}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                          onClick={() => handleResetPassword(user.id)}
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </Button>

                        {user.status === "active" ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            title="Unban User"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t.noUsersFound}</p>
            </div>
          )}
            </>
          )}
          
          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-9 w-9"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-green-600 dark:text-green-400">Password Reset Successful</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              The user's password has been reset successfully.
            </DialogDescription>
          </DialogHeader>
          
          {resetPasswordInfo && (
            <div className="space-y-4 mt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">User</Label>
                <p className="font-semibold text-gray-900 dark:text-white">{resetPasswordInfo.user?.username}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600 dark:text-gray-400">Email</Label>
                <p className="font-semibold text-gray-900 dark:text-white">{resetPasswordInfo.user?.email}</p>
              </div>
              <div className="border-t pt-4 border-gray-200 dark:border-gray-600">
                <Label className="text-sm text-gray-600 dark:text-gray-400">New Password</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-white dark:bg-gray-900 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 font-mono text-lg text-gray-900 dark:text-white">
                    {resetPasswordInfo.new_password}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(resetPasswordInfo.new_password);
                      showToast("Password copied to clipboard!", "success");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Please share this password with the user securely.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button 
              onClick={() => setResetPasswordDialogOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

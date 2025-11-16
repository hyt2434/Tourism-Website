import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
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
  Filter
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../ui/dialog";

export default function UserManagementTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");

  // Mock data
  const users = [
    {
      id: 1,
      username: "John Doe",
      email: "john.doe@example.com",
      role: "client",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2025-11-15",
      totalBookings: 12
    },
    {
      id: 2,
      username: "Jane Smith",
      email: "jane.smith@example.com",
      role: "partner",
      status: "active",
      createdAt: "2024-03-20",
      lastLogin: "2025-11-14",
      totalBookings: 0
    },
    {
      id: 3,
      username: "Mike Johnson",
      email: "mike.j@example.com",
      role: "client",
      status: "banned",
      createdAt: "2024-06-10",
      lastLogin: "2025-10-20",
      totalBookings: 5
    },
    {
      id: 4,
      username: "Sarah Wilson",
      email: "sarah.w@example.com",
      role: "admin",
      status: "active",
      createdAt: "2023-12-01",
      lastLogin: "2025-11-16",
      totalBookings: 0
    },
    {
      id: 5,
      username: "David Brown",
      email: "david.brown@example.com",
      role: "client",
      status: "active",
      createdAt: "2024-09-05",
      lastLogin: "2025-11-13",
      totalBookings: 28
    }
  ];

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
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
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
            All Users
          </Button>
          <Button
            variant={filterRole === "client" ? "default" : "outline"}
            onClick={() => setFilterRole("client")}
            className="h-12"
          >
            <User className="w-4 h-4 mr-2" />
            Clients
          </Button>
          <Button
            variant={filterRole === "partner" ? "default" : "outline"}
            onClick={() => setFilterRole("partner")}
            className="h-12"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Partners
          </Button>
          <Button
            variant={filterRole === "admin" ? "default" : "outline"}
            onClick={() => setFilterRole("admin")}
            className="h-12"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admins
          </Button>
        </div>
      </div>

      {/* User Table */}
      <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Joined</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Last Login</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Bookings</th>
                  <th className="text-right py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {user.createdAt}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700 dark:text-gray-300 text-sm">
                      {user.lastLogin}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {user.totalBookings}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
                              <DialogDescription>
                                Update user information and settings
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 mt-4">
                              <div>
                                <Label>Username</Label>
                                <Input defaultValue={selectedUser?.username} className="mt-1" />
                              </div>
                              <div>
                                <Label>Email</Label>
                                <Input type="email" defaultValue={selectedUser?.email} className="mt-1" />
                              </div>
                              <div>
                                <Label>Role</Label>
                                <select className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
                                  <option value="client" selected={selectedUser?.role === "client"}>Client</option>
                                  <option value="partner" selected={selectedUser?.role === "partner"}>Partner</option>
                                  <option value="admin" selected={selectedUser?.role === "admin"}>Admin</option>
                                </select>
                              </div>
                            </div>
                            
                            <DialogFooter className="mt-6">
                              <Button variant="outline">Cancel</Button>
                              <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                        >
                          <Key className="w-4 h-4" />
                        </Button>

                        {user.status === "active" ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
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
              <p className="text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

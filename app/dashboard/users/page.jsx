"use client";

import React, { useState, useEffect } from "react";
import { userManagementService } from "@/services/user-management.service";
import { useShops } from "@/services/shop-service";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  UserPlus,
  Settings,
  Building2,
  Shield,
  Crown,
  Scissors,
  Store,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Activity,
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { AdminAccess } from "@/components/ProtectedRotue";

// Role বাংলা নাম
const roleNames = {
  superAdmin: "সুপার অ্যাডমিন",
  admin: "অ্যাডমিন",
  manager: "ম্যানেজার",
  salesman: "বিক্রয়কর্মী",
  tailor: "দর্জি",
  embroideryMan: "এমব্রয়ডারি কারিগর",
  stoneMan: "স্টোন ওয়ার্ক কারিগর",
  user: "সাধারণ ইউজার",
};

// Role icons and colors
const roleConfig = {
  superAdmin: { icon: Crown, color: "bg-red-500" },
  admin: { icon: Shield, color: "bg-purple-500" },
  manager: { icon: Settings, color: "bg-blue-500" },
  salesman: { icon: Store, color: "bg-orange-500" },
  tailor: { icon: Scissors, color: "bg-green-500" },
  embroideryMan: { icon: Settings, color: "bg-pink-500" },
  stoneMan: { icon: Settings, color: "bg-yellow-500" },
  user: { icon: User, color: "bg-gray-500" },
};

function UserManagementContent() {
  const { userProfile, getUserRole } = useAuthStore();
  const currentUserRole = getUserRole();
  const { data: shops, isLoading: shopsLoading } = useShops();


  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Dialog states
  const [assignRoleDialog, setAssignRoleDialog] = useState({
    open: false,
    user: null,
    assignment: null,
  });

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedShop, setSelectedShop] = useState("");

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsers, pending] = await Promise.all([
        userManagementService.getAllUsersWithShops(),
        userManagementService.getPendingUsers(),
      ]);
      setUsers(allUsers);
      setPendingUsers(pending);
    } catch (error) {
      toast.error("ইউজার লোড করতে ব্যর্থ হয়েছে");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Get assignable roles for current user
  const assignableRoles = userManagementService.getAssignableRoles(currentUserRole);


  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.primaryRole === roleFilter;

    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "active" && user.activeShops > 0) ||
      (selectedTab === "inactive" && user.activeShops === 0);

    return matchesSearch && matchesRole && matchesTab;
  });

  // Handle role assignment
  const handleAssignRole = async () => {
    if (!selectedRole || !selectedShop) {
      toast.error("দয়া করে role এবং shop নির্বাচন করুন");
      return;
    }

    try {
      if (assignRoleDialog.assignment) {
        // Update existing assignment
        await userManagementService.updateUserRole(
          assignRoleDialog.assignment.assignmentId,
          selectedRole,
          currentUserRole
        );
        toast.success("Role সফলভাবে আপডেট হয়েছে");
      } else {
        // Create new assignment
        await userManagementService.assignUserRole(
          assignRoleDialog.user.$id,
          selectedShop,
          selectedRole,
          userProfile.$id,
          currentUserRole
        );
        toast.success("Role সফলভাবে assign হয়েছে");
      }

      setAssignRoleDialog({ open: false, user: null, assignment: null });
      setSelectedRole("");
      setSelectedShop("");
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Role assign করতে ব্যর্থ");
      console.error(error);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (assignment, newStatus) => {
    try {
      await userManagementService.toggleUserStatus(
        assignment.assignmentId,
        newStatus,
        currentUserRole
      );
      toast.success(`Status ${newStatus === "active" ? "active" : "inactive"} করা হয়েছে`);
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Status পরিবর্তন করতে ব্যর্থ");
    }
  };

  // Remove user from shop
  const handleRemoveFromShop = async (assignment) => {
    if (!confirm("আপনি কি নিশ্চিত এই ইউজারকে shop থেকে remove করতে চান?")) {
      return;
    }

    try {
      await userManagementService.removeUserFromShop(
        assignment.assignmentId,
        currentUserRole
      );
      toast.success("ইউজার shop থেকে remove করা হয়েছে");
      await loadUsers();
    } catch (error) {
      toast.error(error.message || "Remove করতে ব্যর্থ");
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    const config = roleConfig[role] || roleConfig.user;
    const Icon = config.icon;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ইউজার ম্যানেজমেন্ট</h1>
          <p className="text-muted-foreground mt-1">
            সব ইউজার এবং তাদের role পরিচালনা করুন
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">মোট ইউজার</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">সব ইউজার</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">সক্রিয় ইউজার</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.activeShops > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Shop এ assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">অপেক্ষমান</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">Shop নেই</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">কর্মী</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) =>
                ["tailor", "embroideryMan", "stoneMan", "salesman"].includes(
                  u.primaryRole
                )
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">কাজের ইউজার</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Role ফিল্টার" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব Role</SelectItem>
                {Object.entries(roleNames).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="all">সব ইউজার</TabsTrigger>
          <TabsTrigger value="active">সক্রিয়</TabsTrigger>
          <TabsTrigger value="inactive">নিষ্ক্রিয়</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>লোড হচ্ছে...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>কোন ইউজার পাওয়া যায়নি</AlertTitle>
              <AlertDescription>
                আপনার ফিল্টার অনুযায়ী কোন ইউজার নেই
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ইউজার</TableHead>
                      <TableHead>যোগাযোগ</TableHead>
                      <TableHead>Shop & Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>যোগদান</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.$id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <Badge
                                variant="outline"
                                className={`mt-1 ${roleConfig[user.primaryRole]?.color || "bg-gray-500"
                                  } text-white`}
                              >
                                {getRoleIcon(user.primaryRole)}
                                <span className="ml-1">
                                  {roleNames[user.primaryRole]}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {user.assignments.length > 0 ? (
                            <div className="space-y-2">
                              {user.assignments.map((assignment) => (
                                <div
                                  key={assignment.assignmentId}
                                  className="flex items-center gap-2"
                                >
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <div className="text-sm">
                                    <span className="font-medium">
                                      {assignment.shop?.name}
                                    </span>
                                    <Badge variant="outline" className="ml-2">
                                      {roleNames[assignment.role]}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              কোন shop নেই
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {user.activeShops > 0 ? (
                            <Badge className="bg-green-500">
                              <UserCheck className="w-3 h-3 mr-1" />
                              সক্রিয়
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <UserX className="w-3 h-3 mr-1" />
                              নিষ্ক্রিয়
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(user.$createdAt).toLocaleDateString("bn-BD")}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.assignments.map((assignment) => (
                              <div key={assignment.assignmentId} className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAssignRoleDialog({ open: true, user, assignment })}
                                  title="Role পরিবর্তন"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant={assignment.status === "active" ? "secondary" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleStatus(assignment, assignment.status === "active" ? "inactive" : "active")}
                                  title={assignment.status === "active" ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                                >
                                  {assignment.status === "active" ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRemoveFromShop(assignment)}
                                  title="Shop থেকে remove"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Role Assignment Dialog */}
      <Dialog open={assignRoleDialog.open} onOpenChange={(open) => setAssignRoleDialog({ ...assignRoleDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Role Assign করুন</DialogTitle>
            <DialogDescription>
              {assignRoleDialog.user?.name} এর জন্য role এবং shop নির্বাচন করুন
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Shop নির্বাচন</Label>
            <Select value={selectedShop} onValueChange={setSelectedShop}>
              <SelectTrigger>
                <SelectValue placeholder="Shop নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {shops?.map((shop) => (
                  <SelectItem key={shop.$id} value={shop.$id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Role নির্বাচন</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignRoleDialog({ open: false, user: null, assignment: null })}>
              বাতিল
            </Button>
            <Button onClick={handleAssignRole}>
              {assignRoleDialog.assignment ? "আপডেট" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminAccess>
      <UserManagementContent />
    </AdminAccess>
  );
}
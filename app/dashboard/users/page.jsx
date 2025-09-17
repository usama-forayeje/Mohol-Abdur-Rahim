"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    useUsers,
    useUpdateUserRole,
    useUpdateUserStatus,
    useUpdateUserShop,
    useDeleteUser,
    useCreateUser,
    useUpdateUserPhone,
} from "@/services/user-service";
import { useShops } from "@/services/shop-service";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog";
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
import {
    Plus,
    Trash2,
    Edit2,
    Eye,
    Search,
    Loader2,
    Filter,
    User,
    Shield,
    Crown,
    Settings,
    Scissors,
    Store,
    UserCheck,
    UserX,
    X,
    Mail,
    Phone,
    Calendar,
    BadgeCheck,
    BadgeX,
} from "lucide-react";
import Image from "next/image";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/user-store";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

const roleSchema = z.object({
    role: z.string().min(1, "Role is required"),
    status: z.string().min(1, "Status is required"),
    phone: z.string().optional(),
    shopId: z.string().optional(),
});

const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    role: z.string().min(1, "Role is required"),
    phone: z.string().optional(),
    shopId: z.string().optional(),
});

const ROLES = [
    { value: "superAdmin", label: "Super Admin", icon: Crown, color: "text-red-600" },
    { value: "admin", label: "Admin", icon: Shield, color: "text-purple-600" },
    { value: "manager", label: "Manager", icon: Settings, color: "text-blue-600" },
    { value: "tailor", label: "Tailor", icon: Scissors, color: "text-green-600" },
    { value: "user", label: "User", icon: User, color: "text-gray-600" },
    { value: "salesman", label: "Salesman", icon: Store, color: "text-orange-600" },
    { value: "embroideryMan", label: "Embroidery", icon: Settings, color: "text-pink-600" },
    { value: "stoneMan", label: "Stone Work", icon: Settings, color: "text-yellow-600" },
];

const STATUSES = [
    { value: "active", label: "Active", icon: UserCheck, color: "text-green-600" },
    { value: "inactive", label: "Inactive", icon: UserX, color: "text-red-600" },
    { value: "suspended", label: "Suspended", icon: BadgeX, color: "text-orange-600" },
];

export default function UsersPage() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const { user: currentUser } = useAuthStore();

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            role: "",
            phone: "",
            status: "active",
            shopId: "",
        },
    });

    const { control: createControl, handleSubmit: handleCreateSubmit, reset: resetCreate, formState: { errors: createErrors } } = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            role: "user",
            phone: "",
            shopId: "",
        },
    });

    const { isLoading } = useUsers();
    const users = useUserStore((state) => state.users);
    const { data: shops, isLoading: shopsLoading } = useShops();

    const updateUserRole = useUpdateUserRole();
    const updateUserStatus = useUpdateUserStatus();
    const updateUserShop = useUpdateUserShop();
    const updateUserPhone = useUpdateUserPhone();
    const deleteUser = useDeleteUser();
    const createUser = useCreateUser();

    // Apply filters to users
    const filteredUsers = users.filter((user) => {
        // Search filter
        const searchMatch =
            searchQuery === "" ||
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchQuery.toLowerCase());

        // Role filter
        const roleMatch = roleFilter === "all" || user.role === roleFilter;

        // Status filter
        const statusMatch = statusFilter === "all" || user.status === statusFilter;

        return searchMatch && roleMatch && statusMatch;
    });

    useEffect(() => {
        if (selectedUser && isEditDialogOpen) {
            setValue("role", selectedUser.role || "user");
            setValue("status", selectedUser.status || "active");
            setValue("shopId", selectedUser.shopId || "");
            setValue("phone", selectedUser.phone || "");
        }
    }, [selectedUser, isEditDialogOpen, setValue]);

    const onSubmit = async (values) => {
        try {
            if (selectedUser) {
                // Update role if changed
                if (values.role !== selectedUser.role) {
                    await updateUserRole.mutateAsync({
                        userId: selectedUser.$id,
                        newRole: values.role,
                    });
                }

                // Update status if changed
                if (values.status !== selectedUser.status) {
                    await updateUserStatus.mutateAsync({
                        userId: selectedUser.$id,
                        newStatus: values.status,
                    });
                }

                // Update shop if changed
                if (values.shopId !== selectedUser.shopId) {
                    await updateUserShop.mutateAsync({
                        userId: selectedUser.$id,
                        shopId: values.shopId,
                    });
                }

                // Update phone if changed
                if (values.phone !== selectedUser.phone) {
                    await updateUserPhone.mutateAsync({
                        userId: selectedUser.$id,
                        phone: values.phone,
                    });
                }

                toast.success("User updated successfully");
                setIsEditDialogOpen(false);
                setSelectedUser(null);
                reset();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to update user");
        }
    };

    const onCreateSubmit = async (values) => {
        try {
            await createUser.mutateAsync(values);
            toast.success("User created successfully");
            setIsCreateDialogOpen(false);
            resetCreate();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create user");
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser.mutateAsync(userId);
            toast.success("User deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete user");
        }
    };

    const resetForm = () => {
        reset();
        setSelectedUser(null);
    };

    const getRoleIcon = (role) => {
        const roleConfig = ROLES.find(r => r.value === role);
        return roleConfig ? React.createElement(roleConfig.icon, { className: `h-4 w-4 ${roleConfig.color}` }) : <User className="h-4 w-4" />;
    };

    const getStatusIcon = (status) => {
        const statusConfig = STATUSES.find(s => s.value === status);
        return statusConfig ? React.createElement(statusConfig.icon, { className: `h-4 w-4 ${statusConfig.color}` }) : <UserCheck className="h-4 w-4" />;
    };

    const getRoleLabel = (role) => {
        return ROLES.find(r => r.value === role)?.label || role;
    };

    const getStatusLabel = (status) => {
        return STATUSES.find(s => s.value === status)?.label || status;
    };

    const canEditUser = (user) => {
        if (!currentUser?.profile) return false;

        const currentUserRole = currentUser.profile.role;
        const targetUserRole = user.role;

        // Super admin can edit everyone
        if (currentUserRole === "superAdmin") return true;

        // Admin can edit everyone except super admin
        if (currentUserRole === "admin" && targetUserRole !== "superAdmin") return true;

        // Manager can edit tailors, salesmen, and users
        if (currentUserRole === "manager" &&
            ["tailor", "salesman", "embroideryMan", "stoneMan", "user"].includes(targetUserRole)) {
            return true;
        }

        return false;
    };

    const canDeleteUser = (user) => {
        if (!currentUser?.profile) return false;

        const currentUserRole = currentUser.profile.role;
        const targetUserRole = user.role;

        // Only super admin and admin can delete users
        if (!["superAdmin", "admin"].includes(currentUserRole)) return false;

        // Super admin can delete everyone except themselves
        if (currentUserRole === "superAdmin" && user.$id !== currentUser.$id) return true;

        // Admin can delete everyone except super admin and themselves
        if (currentUserRole === "admin" &&
            targetUserRole !== "superAdmin" &&
            user.$id !== currentUser.$id) {
            return true;
        }

        return false;
    };

    const canCreateUser = () => {
        if (!currentUser?.profile) return false;
        return ["superAdmin", "admin", "manager"].includes(currentUser.profile.role);
    };

    const hasActiveFilters = roleFilter !== "all" || statusFilter !== "all" || searchQuery !== "";

    const clearFilters = () => {
        setSearchQuery("");
        setRoleFilter("all");
        setStatusFilter("all");
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage all system users and their roles</p>
                    </div>

                    {canCreateUser() && (
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add New User
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Create New User</DialogTitle>
                                    <DialogDescription>
                                        Add a new user to the system
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreateSubmit(onCreateSubmit)} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <Controller
                                                name="name"
                                                control={createControl}
                                                render={({ field }) => (
                                                    <Input
                                                        placeholder="Enter full name"
                                                        {...field}
                                                        className={createErrors.name ? "border-destructive" : ""}
                                                    />
                                                )}
                                            />
                                            {createErrors.name && (
                                                <p className="text-destructive text-sm">{createErrors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Controller
                                                name="email"
                                                control={createControl}
                                                render={({ field }) => (
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter email address"
                                                        {...field}
                                                        className={createErrors.email ? "border-destructive" : ""}
                                                    />
                                                )}
                                            />
                                            {createErrors.email && (
                                                <p className="text-destructive text-sm">{createErrors.email.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Controller
                                                name="phone"
                                                control={createControl}
                                                render={({ field }) => (
                                                    <Input
                                                        placeholder="Enter phone number"
                                                        {...field}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Controller
                                                name="role"
                                                control={createControl}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className={createErrors.role ? "border-destructive" : ""}>
                                                            <SelectValue placeholder="Select role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ROLES.map((role) => (
                                                                <SelectItem key={role.value} value={role.value}>
                                                                    <div className="flex items-center gap-2">
                                                                        {React.createElement(role.icon, { className: `h-4 w-4 ${role.color}` })}
                                                                        {role.label}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {createErrors.role && (
                                                <p className="text-destructive text-sm">{createErrors.role.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Shop Assignment (Optional)</Label>
                                            <Controller
                                                name="shopId"
                                                control={createControl}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select shop" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={undefined}>No shop</SelectItem>
                                                            {shops?.map((shop) => (
                                                                <SelectItem key={shop.$id} value={shop.$id}>
                                                                    {shop.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">Create User</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{users.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">All system users</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <UserCheck className="h-4 w-4" />
                                Active Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{users.filter(u => u.status === "active").length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Admin Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{users.filter(u => ["superAdmin", "admin"].includes(u.role)).length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Admin privileges</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0 shadow-lg">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Staff Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{users.filter(u => ["manager", "tailor", "salesman", "embroideryMan", "stoneMan"].includes(u.role)).length}</div>
                            <p className="text-xs text-muted-foreground mt-1">Team members</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search users by name, email, or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        {ROLES.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                {role.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[180px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                        className="flex items-center gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                <span>Loading users...</span>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground mb-4 text-lg">
                                    {hasActiveFilters ? "No users match your filters" : "No users found"}
                                </div>
                                {hasActiveFilters && (
                                    <Button onClick={clearFilters} variant="outline">
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-lg border shadow-sm">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Role</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Shop</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredUsers.map((user) => (
                                                <TableRow key={user.$id} className="hover:bg-muted/50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative h-10 w-10 flex-shrink-0">
                                                                <Image
                                                                    src={user.avatar || `/api/placeholder/40/40`}
                                                                    alt={user.name}
                                                                    fill
                                                                    className="rounded-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">{user.name}</div>
                                                                <div className="text-sm text-muted-foreground">ID: {user.userId}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                                <span className="text-sm">{user.email}</span>
                                                            </div>
                                                            {user.phone && (
                                                                <div className="flex items-center gap-2">
                                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="text-sm">{user.phone}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            {getRoleIcon(user.role)}
                                                            {getRoleLabel(user.role)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={user.status === "active" ? "default" : "secondary"}
                                                            className="flex items-center gap-1"
                                                        >
                                                            {getStatusIcon(user.status)}
                                                            {getStatusLabel(user.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.shopId ? (
                                                            <Badge variant="outline">
                                                                {shops?.find(s => s.$id === user.shopId)?.name || "Shop"}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">No shop</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(user.$createdAt).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {canEditUser(user) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(user)}
                                                                    className="h-8 w-8 p-0"
                                                                    title="Edit user"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            {canDeleteUser(user) && (
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0 text-destructive"
                                                                            title="Delete user"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                This will delete user "{user.name}" from the system. This action cannot be undone.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDelete(user.$id)}
                                                                                className="bg-destructive hover:bg-destructive/90"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update user role, status, and shop assignment
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                                <div className="relative h-12 w-12 flex-shrink-0">
                                    <Image
                                        src={selectedUser.avatar || `/api/placeholder/48/48`}
                                        alt={selectedUser.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold">{selectedUser.name}</div>
                                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLES.map((role) => (
                                                        <SelectItem key={role.value} value={role.value}>
                                                            <div className="flex items-center gap-2">
                                                                {React.createElement(role.icon, { className: `h-4 w-4 ${role.color}` })}
                                                                {role.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <Input placeholder="Enter phone number" {...field} />
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUSES.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center gap-2">
                                                                {React.createElement(status.icon, { className: `h-4 w-4 ${status.color}` })}
                                                                {status.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Shop Assignment (Optional)</Label>
                                    <Controller
                                        name="shopId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select shop" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={undefined}>No shop</SelectItem>
                                                    {shops?.map((shop) => (
                                                        <SelectItem key={shop.$id} value={shop.$id}>
                                                            {shop.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
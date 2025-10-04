"use client"

import { useState, useEffect } from "react"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { userManagementService } from "@/services/user-management.service"
import { useShops } from "@/services/shop-service"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Settings,
  Building2,
  Shield,
  Crown,
  Scissors,
  Store,
  User,
  AlertCircle,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Users,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AdminAccess } from "@/components/ProtectedRotue"
import PageContainer from "@/components/layout/page-container"
import { cn } from "@/lib/utils"

// Role configuration
const roleNames = {
  superAdmin: "সুপার অ্যাডমিন",
  admin: "অ্যাডমিন",
  manager: "ম্যানেজার",
  salesman: "বিক্রয়কর্মী",
  tailor: "দর্জি",
  embroideryMan: "এমব্রয়ডারি কারিগর",
  stoneMan: "স্টোন ওয়ার্ক কারিগর",
}

// Role icons and colors
const roleConfig = {
  superAdmin: { icon: Crown, color: "bg-gradient-to-r from-red-500 to-red-600", textColor: "text-white" },
  admin: { icon: Shield, color: "bg-gradient-to-r from-purple-500 to-purple-600", textColor: "text-white" },
  manager: { icon: Settings, color: "bg-gradient-to-r from-blue-500 to-blue-600", textColor: "text-white" },
  salesman: { icon: Store, color: "bg-gradient-to-r from-orange-500 to-orange-600", textColor: "text-white" },
  tailor: { icon: Scissors, color: "bg-gradient-to-r from-green-500 to-green-600", textColor: "text-white" },
  embroideryMan: { icon: Settings, color: "bg-gradient-to-r from-pink-500 to-pink-600", textColor: "text-white" },
  stoneMan: { icon: Settings, color: "bg-gradient-to-r from-yellow-500 to-yellow-600", textColor: "text-white" },
}

// Status configuration
const statusConfig = {
  active: {
    label: "সক্রিয়",
    icon: UserCheck,
    color: "bg-green-100 text-green-800 border-green-200",
    dotColor: "bg-green-500",
  },
  inactive: {
    label: "নিষ্ক্রিয়",
    icon: UserX,
    color: "bg-red-100 text-red-800 border-red-200",
    dotColor: "bg-red-500",
  },
}

function UserManagementContent() {
  const { userProfile, getUserRole } = useAuthStore()
  const currentUserRole = getUserRole()
  const { data: shops, isLoading: shopsLoading } = useShops()
  const queryClient = useQueryClient()
  const deleteUser = userManagementService.useDeleteUser()

  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // Dialog states
  const [assignRoleDialog, setAssignRoleDialog] = useState({
    open: false,
    user: null,
    assignment: null,
  })

  const [deleteUserDialog, setDeleteUserDialog] = useState({
    open: false,
    user: null,
  })

  const [selectedRole, setSelectedRole] = useState("")
  const [selectedShop, setSelectedShop] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (assignRoleDialog.open) {
      if (assignRoleDialog.assignment) {
        const currentShopId = assignRoleDialog.assignment.shop?.$id
        const shopExists = shops?.some((shop) => shop.$id === currentShopId)

        setSelectedRole(assignRoleDialog.assignment.role || "")
        setSelectedShop(shopExists ? currentShopId : "")

        if (!shopExists) {
          console.warn("Current shop not found in available shops:", currentShopId)
        }
      } else {
        setSelectedRole("")
        setSelectedShop("")
      }
    } else {
      setSelectedRole("")
      setSelectedShop("")
    }
  }, [assignRoleDialog.open, assignRoleDialog.assignment, shops])

  // Infinite query for users
  const {
    data: usersData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["users", searchQuery, roleFilter, selectedTab],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 20
      const offset = pageParam * limit

      const [allUsers, pending] = await Promise.all([
        userManagementService.getAllUsersWithShops(),
        userManagementService.getPendingUsers(),
      ])

      return {
        users: allUsers,
        pendingUsers: pending,
        nextOffset: null,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 2 * 60 * 1000,
  })

  const users = usersData?.pages.flatMap((page) => page.users) || []
  const pendingUsers = usersData?.pages[0]?.pendingUsers || []

  const [sentinelRef, setSentinelRef] = useState(null)

  useEffect(() => {
    if (!sentinelRef || !usersData || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 },
    )

    observer.observe(sentinelRef)

    return () => observer.disconnect()
  }, [sentinelRef, usersData, hasNextPage, isFetchingNextPage, fetchNextPage])

  const assignableRoles = userManagementService.getAssignableRoles(currentUserRole)

  const loadUsers = () => {
    refetch()
  }

  const closeModal = () => {
    setAssignRoleDialog({ open: false, user: null, assignment: null })
    setSelectedRole("")
    setSelectedShop("")
  }

  // Filter users
  const filteredUsers = users
    ? users.filter((user) => {
        const matchesSearch =
          searchQuery === "" ||
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesRole = roleFilter === "all" || user.primaryRole === roleFilter

        const matchesTab =
          selectedTab === "all" ||
          (selectedTab === "active" && user.activeShops > 0) ||
          (selectedTab === "inactive" && user.activeShops === 0)

        return matchesSearch && matchesRole && matchesTab
      })
    : []

  const handleAssignRoleMutation = async () => {
    if (!selectedRole || !selectedShop) {
      toast.error("দয়া করে role এবং shop নির্বাচন করুন")
      return
    }

    try {
      if (assignRoleDialog.assignment) {
        const currentShopId = assignRoleDialog.assignment.shop?.$id
        const currentRole = assignRoleDialog.assignment.role

        if (currentShopId === selectedShop && currentRole === selectedRole) {
          toast.info("কোনো পরিবর্তন নেই")
          closeModal()
          return
        }

        if (currentShopId !== selectedShop) {
          await userManagementService.removeUserFromShop(assignRoleDialog.assignment.assignmentId, currentUserRole)

          await userManagementService.assignUserRole(
            assignRoleDialog.user.$id,
            selectedShop,
            selectedRole,
            userProfile.$id,
            currentUserRole,
          )

          toast.success("Shop এবং role সফলভাবে পরিবর্তন হয়েছে")
        } else {
          await userManagementService.updateUserRole(
            assignRoleDialog.assignment.assignmentId,
            selectedRole,
            currentUserRole,
          )
          toast.success("Role সফলভাবে আপডেট হয়েছে")
        }
      } else {
        await userManagementService.assignUserRole(
          assignRoleDialog.user.$id,
          selectedShop,
          selectedRole,
          userProfile.$id,
          currentUserRole,
        )
        toast.success("Role সফলভাবে assign হয়েছে")
      }

      closeModal()
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (error) {
      toast.error(error.message || "Role assign করতে ব্যর্থ")
      throw error
    }
  }

  const handleToggleStatusMutation = async (assignment, newStatus) => {
    try {
      await userManagementService.toggleUserStatus(assignment.assignmentId, newStatus, currentUserRole)
      toast.success(`Status ${newStatus === "active" ? "active" : "inactive"} করা হয়েছে`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (error) {
      toast.error(error.message || "Status পরিবর্তন করতে ব্যর্থ")
      throw error
    }
  }

  const handleRemoveFromShopMutation = async (assignment) => {
    if (!confirm("আপনি কি নিশ্চিত এই ইউজারকে shop থেকে remove করতে চান?")) {
      return
    }

    try {
      await userManagementService.removeUserFromShop(assignment.assignmentId, currentUserRole)
      toast.success("ইউজার shop থেকে remove করা হয়েছে")
      queryClient.invalidateQueries({ queryKey: ["users"] })
    } catch (error) {
      toast.error(error.message || "Remove করতে ব্যর্থ")
      throw error
    }
  }

  const handleDeleteUserClick = (user) => {
    setDeleteUserDialog({ open: true, user })
  }

  const handleDeleteUserConfirm = async () => {
    try {
      await deleteUser.mutateAsync({ userId: deleteUserDialog.user.$id, currentUserRole })
      setDeleteUserDialog({ open: false, user: null })
    } catch (error) {
      // Error handled by the mutation
    }
  }

  const closeDeleteDialog = () => {
    setDeleteUserDialog({ open: false, user: null })
  }

  const getRoleIcon = (role) => {
    const config = roleConfig[role]
    if (!config || !config.icon) {
      return <User className="w-4 h-4" />
    }
    const Icon = config.icon
    return <Icon className="w-4 h-4" />
  }

  return (
    <PageContainer>
      <div className="space-y-4 sm:space-y-6 w-full p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold">ইউজার ম্যানেজমেন্ট</h1>
            <p className="text-sm text-muted-foreground mt-1">সব ইউজার এবং তাদের role পরিচালনা করুন</p>
          </div>
          <Button onClick={() => loadUsers()} variant="outline" size="default" className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            রিফ্রেশ
          </Button>
        </div>

        {/* Stats Cards - Improved responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">মোট ইউজার</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoading ? <div className="animate-pulse bg-muted h-8 w-12 rounded"></div> : users?.length || 0}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">সক্রিয়</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      users?.filter((u) => u.activeShops > 0).length || 0
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">অপেক্ষমান</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      pendingUsers?.length || 0
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">কর্মী</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {isLoading ? (
                      <div className="animate-pulse bg-muted h-8 w-12 rounded"></div>
                    ) : (
                      users?.filter((u) => ["tailor", "embroideryMan", "stoneMan", "salesman"].includes(u.primaryRole))
                        .length || 0
                    )}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Collapsible Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Search Bar - Always Visible */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>

              {/* Toggle Filters Button - Mobile Only */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:hidden flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  ফিল্টার অপশন
                </span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              {/* Filters - Collapsible on Mobile, Always Visible on Desktop */}
              <div className={cn("space-y-3 sm:space-y-0 sm:flex sm:gap-3", !showFilters && "hidden sm:flex")}>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[200px] h-11">
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
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-11">
              <TabsTrigger value="all" className="text-sm">
                সব
              </TabsTrigger>
              <TabsTrigger value="active" className="text-sm">
                সক্রিয়
              </TabsTrigger>
              <TabsTrigger value="inactive" className="text-sm">
                নিষ্ক্রিয়
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedTab} className="mt-6">
            {isLoading || !usersData ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>লোড হচ্ছে...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>কোন ইউজার পাওয়া যায়নি</AlertTitle>
                <AlertDescription>আপনার ফিল্টার অনুযায়ী কোন ইউজার নেই</AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="lg:hidden space-y-3">
                  {filteredUsers.map((user) => (
                    <Card key={user.$id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {/* User Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-lg">{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base truncate">{user.name}</h3>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "mt-1 text-xs",
                                  roleConfig[user.primaryRole]?.color || "bg-gray-500",
                                  roleConfig[user.primaryRole]?.textColor || "text-white",
                                )}
                              >
                                {getRoleIcon(user.primaryRole)}
                                <span className="ml-1">{roleNames[user.primaryRole] || "Unknown"}</span>
                              </Badge>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <Badge className={cn("flex-shrink-0", user.activeShops > 0 ? "bg-green-500" : "bg-gray-400")}>
                            {user.activeShops > 0 ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                সক্রিয়
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                নিষ্ক্রিয়
                              </>
                            )}
                          </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>{new Date(user.$createdAt).toLocaleDateString("bn-BD")}</span>
                          </div>
                        </div>

                        {/* Shop Assignments */}
                        {user.assignments.length > 0 ? (
                          <div className="space-y-2 mb-3">
                            <p className="text-xs font-medium text-muted-foreground">Shop & Role:</p>
                            {user.assignments.map((assignment) => (
                              <div
                                key={assignment.assignmentId}
                                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{assignment.shop?.name}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {roleNames[assignment.role] || "Unknown"}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Actions Dropdown - Show for all assignments */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                      onClick={() => setAssignRoleDialog({ open: true, user, assignment })}
                                    >
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Role পরিবর্তন
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        try {
                                          await handleToggleStatusMutation(
                                            assignment,
                                            assignment.status === "active" ? "inactive" : "active",
                                          )
                                        } catch (error) {
                                          // Error handled
                                        }
                                      }}
                                    >
                                      {assignment.status === "active" ? (
                                        <>
                                          <UserX className="w-4 h-4 mr-2" />
                                          নিষ্ক্রিয় করুন
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="w-4 h-4 mr-2" />
                                          সক্রিয় করুন
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        try {
                                          await handleRemoveFromShopMutation(assignment)
                                        } catch (error) {
                                          // Error handled
                                        }
                                      }}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Shop থেকে remove
                                    </DropdownMenuItem>
                                    {/* Delete User option - only for superAdmin and admin */}
                                    {["superAdmin", "admin"].includes(currentUserRole) && (
                                      <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteUserClick(user)}
                                          className="text-destructive focus:text-destructive"
                                        >
                                          <AlertCircle className="w-4 h-4 mr-2" />
                                          ইউজার delete করুন
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-muted-foreground text-center py-2 bg-muted/30 rounded flex-1 mr-2">
                              কোন shop নেই
                            </div>

                            {/* Assign Role button for users without assignments */}
                            {["admin", "superAdmin", "manager"].includes(currentUserRole) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setAssignRoleDialog({ open: true, user, assignment: null })}
                                className="flex-shrink-0"
                              >
                                <UserCheck className="w-4 h-4 mr-1" />
                                Assign
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <Card className="hidden lg:block">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">ইউজার</TableHead>
                            <TableHead className="min-w-[180px]">যোগাযোগ</TableHead>
                            <TableHead className="min-w-[200px]">Shop & Role</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-[120px]">যোগদান</TableHead>
                            <TableHead className="min-w-[150px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((user) => (
                            <TableRow key={user.$id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{user.name}</div>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "mt-1",
                                        roleConfig[user.primaryRole]?.color || "bg-gray-500",
                                        roleConfig[user.primaryRole]?.textColor || "text-white",
                                      )}
                                    >
                                      {getRoleIcon(user.primaryRole)}
                                      <span className="ml-1">{roleNames[user.primaryRole] || "Unknown"}</span>
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
                                      <div key={assignment.assignmentId} className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        <div className="text-sm">
                                          <span className="font-medium">{assignment.shop?.name}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {roleNames[assignment.role] || "Unknown"}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">কোন shop নেই</span>
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
                                  {/* Show 3-dot menu for admin/manager/superAdmin OR if user has assignments */}
                                  {(user.assignments.length > 0 || ["admin", "superAdmin", "manager"].includes(currentUserRole)) && (
                                    <>
                                      {user.assignments.map((assignment) => (
                                        <DropdownMenu key={assignment.assignmentId}>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() => setAssignRoleDialog({ open: true, user, assignment })}
                                            >
                                              <Edit2 className="w-4 h-4 mr-2" />
                                              Role পরিবর্তন
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={async () => {
                                                try {
                                                  await handleToggleStatusMutation(
                                                    assignment,
                                                    assignment.status === "active" ? "inactive" : "active",
                                                  )
                                                } catch (error) {
                                                  // Error handled
                                                }
                                              }}
                                            >
                                              {assignment.status === "active" ? (
                                                <>
                                                  <UserX className="w-4 h-4 mr-2" />
                                                  নিষ্ক্রিয় করুন
                                                </>
                                              ) : (
                                                <>
                                                  <UserCheck className="w-4 h-4 mr-2" />
                                                  সক্রিয় করুন
                                                </>
                                              )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={async () => {
                                                try {
                                                  await handleRemoveFromShopMutation(assignment)
                                                } catch (error) {
                                                  // Error handled
                                                }
                                              }}
                                              className="text-destructive focus:text-destructive"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Shop থেকে remove
                                            </DropdownMenuItem>
                                            {/* Delete User option - only for superAdmin and admin */}
                                            {["superAdmin", "admin"].includes(currentUserRole) && (
                                              <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                  onClick={() => handleDeleteUserClick(user)}
                                                  className="text-destructive focus:text-destructive"
                                                >
                                                  <AlertCircle className="w-4 h-4 mr-2" />
                                                  ইউজার delete করুন
                                                </DropdownMenuItem>
                                              </>
                                            )}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      ))}

                                      {/* For users with no assignments, show assign role option */}
                                      {user.assignments.length === 0 && ["admin", "superAdmin", "manager"].includes(currentUserRole) && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreVertical className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() => setAssignRoleDialog({ open: true, user, assignment: null })}
                                            >
                                              <UserCheck className="w-4 h-4 mr-2" />
                                              Role Assign করুন
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Infinite Scroll Loading */}
            {usersData && hasNextPage && (
              <div className="flex justify-center py-4">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    লোড হচ্ছে...
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fetchNextPage()} className="gap-2">
                    আরও লোড করুন
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            <div ref={setSentinelRef} className="h-4" />
          </TabsContent>
        </Tabs>

        {/* Role Assignment Dialog - Improved Mobile */}
        <Dialog open={assignRoleDialog.open} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Role Assign করুন</DialogTitle>
              <DialogDescription className="text-sm">
                {assignRoleDialog.user?.name} এর জন্য role এবং shop নির্বাচন করুন
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="shop" className="text-sm font-medium">
                  Shop নির্বাচন
                </Label>
                <Select
                  key={`shop-${assignRoleDialog.assignment?.assignmentId || "new"}`}
                  value={selectedShop}
                  onValueChange={setSelectedShop}
                >
                  <SelectTrigger id="shop" className="h-11">
                    <SelectValue placeholder="Shop নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops?.map((shop) => (
                      <SelectItem key={shop.$id} value={shop.$id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {shop.name}
                        </div>
                      </SelectItem>
                    ))}
                    {assignRoleDialog.assignment && selectedShop && !shops?.some((s) => s.$id === selectedShop) && (
                      <SelectItem value={selectedShop} disabled>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          {assignRoleDialog.assignment.shop?.name || "Unknown Shop"} (পুরানো)
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Role নির্বাচন
                </Label>
                <Select
                  key={`role-${assignRoleDialog.assignment?.assignmentId || "new"}`}
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger id="role" className="h-11">
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
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={closeModal} className="w-full sm:w-auto bg-transparent">
                বাতিল
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await handleAssignRoleMutation()
                  } catch (error) {
                    // Error handled
                  }
                }}
                className="w-full sm:w-auto"
              >
                {assignRoleDialog.assignment ? "আপডেট" : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={deleteUserDialog.open} onOpenChange={(open) => !open && closeDeleteDialog()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                ইউজার Delete করুন
              </DialogTitle>
              <DialogDescription className="text-sm">
                আপনি কি নিশ্চিত যে আপনি "{deleteUserDialog.user?.name}" কে সম্পূর্ণরূপে delete করতে চান?
                এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না এবং ইউজারের সমস্ত তথ্য মুছে যাবে।
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-destructive">{deleteUserDialog.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{deleteUserDialog.user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={closeDeleteDialog} className="w-full sm:w-auto">
                বাতিল করুন
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUserConfirm}
                disabled={deleteUser.isPending}
                className="w-full sm:w-auto"
              >
                {deleteUser.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Delete করুন
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  )
}

export default function UsersPage() {
  return (
    <AdminAccess>
      <UserManagementContent />
    </AdminAccess>
  )
}

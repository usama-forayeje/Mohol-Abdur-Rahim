"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    useCatalogItems,
    useCreateCatalogItem,
    useUpdateCatalogItem,
    useDeleteCatalogItem,
    useDeleteCatalogImages,
    catalogService,
} from "@/services/catalog-service";
import { useShops } from "@/services/shop-service";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
    Upload,
    X,
    ImageIcon,
    Store,
    Tag,

} from "lucide-react";
import Image from "next/image";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useCatalogStore } from "@/store/catalogStore";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

const catalogSchema = z.object({
    shopIds: z.array(z.string()).min(1, "অন্তত একটি দোকান নির্বাচন করুন"),
    type: z.string().min(1, "ধরন প্রয়োজন"),
    name: z.string().min(1, "নাম প্রয়োজন"),
    description: z.string().optional(),
    sell_price: z.string().min(1, "মূল্য প্রয়োজন"),
    worker_price: z.string().min(1, "কর্মীর মূল্য প্রয়োজন"),
    design_code: z.string().min(1, "ডিজাইন কোড প্রয়োজন"),
    images: z.any().optional(),
});

const CATEGORY_TYPES = [
    "শাড়ি",
    "সালোয়ার কামিজ",
    "সুট",
    "ওয়েস্টার্ন",
    "ট্রাডিশনাল",
    "ব্রাইডাল",
    "এক্সেসরিজ",
    "অন্যান্য"
];

export default function CatalogPage() {
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const { user } = useAuthStore();

    const { control, register, handleSubmit, reset, setValue, watch } = useForm({
        resolver: zodResolver(catalogSchema),
        defaultValues: {
            shopIds: [],
            type: "",
            name: "",
            description: "",
            sell_price: "",
            worker_price: "",
            design_code: "",
            images: undefined,
        },
    });

    const { isLoading } = useCatalogItems();
    const catalogItems = useCatalogStore((state) => state.catalogItems);
    const getFilteredCatalogItems = useCatalogStore((state) => state.getFilteredCatalogItems);
    const { data: shops, isLoading: shopsLoading } = useShops();

    const filteredItems = getFilteredCatalogItems(search);

    const createCatalogItem = useCreateCatalogItem();
    const updateCatalogItem = useUpdateCatalogItem();
    const deleteCatalogItem = useDeleteCatalogItem();
    const deleteCatalogImages = useDeleteCatalogImages();

    const onSubmit = async (values) => {
        try {
            if (editingItem) {
                await updateCatalogItem.mutateAsync({
                    id: editingItem.$id,
                    data: {
                        shopIds: values.shopIds,
                        type: values.type,
                        name: values.name,
                        description: values.description,
                        sell_price: values.sell_price,
                        worker_price: values.worker_price,
                        design_code: values.design_code,
                    },
                    newImages: values.images,
                    previousImageIds: editingItem.images || [],
                });
                setEditingItem(null);
                toast.success("ক্যাটালগ আইটেম সফলভাবে আপডেট হয়েছে");
            } else {
                await createCatalogItem.mutateAsync(values);
                toast.success("ক্যাটালগ আইটেম সফলভাবে তৈরি হয়েছে");
            }
            resetForm();
            setIsFormOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("একটি সমস্যা হয়েছে");
        }
    };

    const resetForm = () => {
        reset();
        setSelectedImages([]);
        setImagePreviews([]);
        setExistingImageUrls([]);
        setEditingItem(null);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setValue("shopIds", item.shopIds || []);
        setValue("type", item.type);
        setValue("name", item.name);
        setValue("description", item.description || "");
        setValue("sell_price", item.sell_price.toString());
        setValue("worker_price", item.worker_price.toString());
        setValue("design_code", item.design_code);

        // Set existing image previews
        if (item.images && item.images.length > 0) {
            const urls = catalogService.getImageUrls(item.images);
            setExistingImageUrls(urls);
            setImagePreviews(urls);
        }

        setIsFormOpen(true);
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedImages(files);
            setValue("images", files);
            setExistingImageUrls([]);

            // Create previews
            const previews = files.map((file) => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const removeImage = (index) => {
        if (editingItem && existingImageUrls[index]) {
            // Delete from server
            const imageIdToDelete = editingItem.images[index];
            deleteCatalogImages.mutate({
                itemId: editingItem.$id,
                imageIds: [imageIdToDelete],
            });
        }

        // Remove from local state
        const newPreviews = [...imagePreviews];
        const newUrls = [...existingImageUrls];
        newPreviews.splice(index, 1);
        newUrls.splice(index, 1);
        setImagePreviews(newPreviews);
        setExistingImageUrls(newUrls);
    };

    const openForm = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const getCategoryIcon = (type) => {
        const icons = {
            "শাড়ি": "👗",
            "সালোয়ার কামিজ": "👘",
            "সুট": "👔",
            "ওয়েস্টার্ন": "👚",
            "ট্রাডিশনাল": "🎎",
            "ব্রাইডাল": "💍",
            "এক্সেসরিজ": "💎",
            "অন্যান্য": "📦"
        };
        return icons[type] || "📦";
    };

    return (
        <PageContainer>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ক্যাটালগ ব্যবস্থাপনা
                        </h1>
                        <p className="text-muted-foreground mt-1">আপনার পণ্য ক্যাটালগ পরিচালনা করুন</p>
                    </div>
                    <Button
                        onClick={openForm}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        নতুন আইটেম যোগ করুন
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">মোট আইটেম</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{catalogItems.length}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">ক্যাটাগরি</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(catalogItems.map(item => item.type)).size}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">সর্বোচ্চ মূল্য</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                OMR {Math.max(...catalogItems.map(item => item.sell_price || 0)).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>

                    
                </div>

                {/* Search and Table */}
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle className="text-2xl font-bold">ক্যাটালগ আইটেম</CardTitle>
                                <CardDescription>সব ক্যাটালগ আইটেমের তালিকা</CardDescription>
                            </div>
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="নাম, ধরন, বা ডিজাইন কোড দিয়ে খুঁজুন..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 w-full sm:w-80"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                <span>লোড হচ্ছে...</span>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground mb-4">কোন ক্যাটালগ আইটেম পাওয়া যায়নি</div>
                                <Button onClick={openForm}>প্রথম আইটেম তৈরি করুন</Button>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>আইকন</TableHead>
                                            <TableHead>নাম</TableHead>
                                            <TableHead>ধরন</TableHead>
                                            <TableHead>ডিজাইন কোড</TableHead>
                                            <TableHead>মূল্য</TableHead>
                                            <TableHead>দোকান</TableHead>
                                            <TableHead>ছবি</TableHead>
                                            <TableHead>ক্রিয়া</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.map((item) => (
                                            <TableRow key={item.$id} className="hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="text-2xl">
                                                        {getCategoryIcon(item.type)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{item.type}</Badge>
                                                </TableCell>
                                                <TableCell className="font-mono">{item.design_code}</TableCell>
                                                <TableCell className="font-bold">OMR {item.sell_price}</TableCell>
                                                <TableCell className="font-bold">OMR {item.worker_price}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.shopIds?.map((shopId) => {
                                                            const shop = shops?.find(s => s.$id === shopId);
                                                            return shop ? (
                                                                <Badge key={shopId} variant="outline" className="text-xs">
                                                                    <Store className="h-3 w-3 mr-1" />
                                                                    {shop.name}
                                                                </Badge>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.images && item.images.length > 0 ? (
                                                        <div className="flex gap-1">
                                                            {item.images.slice(0, 3).map((imageId, index) => (
                                                                <Image
                                                                    key={index}
                                                                    src={catalogService.getImageUrl(imageId)}
                                                                    alt={`Image ${index + 1}`}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-10 h-10 object-cover rounded border"
                                                                />
                                                            ))}
                                                            {item.images.length > 3 && (
                                                                <Badge variant="secondary" className="h-10 w-10 flex items-center justify-center">
                                                                    +{item.images.length - 3}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">নেই</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(item)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>আইটেম মুছবেন?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        "{item.name}" ক্যাটালগ আইটেম মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>বাতিল</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => deleteCatalogItem.mutate(item)}
                                                                        className="bg-destructive hover:bg-destructive/90"
                                                                    >
                                                                        মুছুন
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingItem ? "ক্যাটালগ আইটেম সম্পাদনা" : "নতুন ক্যাটালগ আইটেম"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {/* Shop Selection */}
                        <div className="space-y-2">
                            <Label>দোকান নির্বাচন করুন *</Label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {shops?.map((shop) => (
                                    <div key={shop.$id} className="flex items-center space-x-2">
                                        <Controller
                                            name="shopIds"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={field.value.includes(shop.$id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            field.onChange([...field.value, shop.$id]);
                                                        } else {
                                                            field.onChange(field.value.filter(id => id !== shop.$id));
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label className="text-sm font-normal">{shop.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <Label>ধরন *</Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="ধরন নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORY_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Name and Design Code */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>নাম *</Label>
                                <Input {...register("name")} placeholder="পণ্যের নাম" />
                            </div>
                            <div className="space-y-2">
                                <Label>ডিজাইন কোড *</Label>
                                <Input {...register("design_code")} placeholder="ইউনিক ডিজাইন কোড" />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>বিবরণ</Label>
                            <Textarea {...register("description")} placeholder="পণ্যের বিস্তারিত বিবরণ" rows={3} />
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label>মূল্য (OMR) *</Label>
                            <Input type="number" step="0.01" {...register("sell_price")} placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>মুজুরী (OMR) *</Label>
                            <Input type="number" step="0.01" {...register("worker_price")} placeholder="0.00" />
                        </div>

                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label>ছবি যোগ করুন</Label>
                            <div className="flex items-center gap-4">
                                <Label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-accent/20 w-full"
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-center">
                                        {selectedImages.length > 0
                                            ? `${selectedImages.length}টি ছবি নির্বাচিত`
                                            : "ছবি আপলোড করতে ক্লিক করুন"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        PNG, JPG, WEBP (একাধিক ছবি নির্বাচন করতে পারেন)
                                    </span>
                                </Label>
                                <Input
                                    id="image-upload"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4">
                                    <Label>প্রিভিউ:</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <Image
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    width={100}
                                                    height={100}
                                                    className="w-full h-24 object-cover rounded border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="submit" className="w-full sm:w-auto">
                                {editingItem ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
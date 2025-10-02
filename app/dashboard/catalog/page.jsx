"use client";

import React, { useState } from "react";
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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { VoiceTypingButton } from "@/components/ui/voice-typing-button";
import { useCatalogStore } from "@/store/catalogStore";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { setupLazyLoading, getOptimizedImageUrl } from "@/lib/image-optimizer";
import { VirtualTable } from "@/components/ui/virtual-table";

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
    "এমব্রয়ডারি ✨",
    "স্টোন ওয়ার্ক 💎",
    "জরি ওয়ার্ক 🌟",
    "কারচুপি 🎨",
    "ব্লক প্রিন্ট 🖼️",
    "স্ক্রিন প্রিন্ট 🖨️",
    "টাই-ডাই 🌈",
    "বাটিক 🖌️",

    // Others
    "অন্যান্য 📦"
];

export default function CatalogPage() {
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const [imagePreviewModal, setImagePreviewModal] = useState(null);
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

    const openImagePreview = (imageId, itemName) => {
        const imageUrl = getOptimizedImageUrl(imageId, { width: 800, height: 600 });
        setImagePreviewModal({ url: imageUrl, title: itemName });
    };

    const getCategoryIcon = (type) => {
        // Extract emoji from category name if present
        const emojiMatch = type.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
        return emojiMatch ? emojiMatch[0] : "📦";
    };

    return (
        <PageContainer>
            <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                                ক্যাটালগ ব্যবস্থাপনা
                            </h1>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                                <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">আপনার পণ্য ক্যাটালগ পরিচালনা করুন</p>
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    ✨ {CATEGORY_TYPES.length} ক্যাটাগরি
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    📊 {catalogItems.length} আইটেম
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    🎤 ভয়েস রেডি
                                </Badge>
                            </div>
                        </div>
                        <Button
                            onClick={openForm}
                            className="w-full sm:w-auto lg:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
                        >
                            <Plus className="h-4 w-4" />
                            নতুন আইটেম যোগ করুন
                        </Button>
                    </div>
                </div>


                {/* Search and Table */}
                <Card className="shadow-lg border-0 w-full">
                    <CardHeader className="pb-4 p-3 sm:p-6">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex flex-col gap-3">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold flex flex-wrap items-center gap-1 sm:gap-2">
                                        ক্যাটালগ আইটেম
                                        <Badge variant="outline" className="text-xs">
                                            অপ্টিমাইজড ইমেজ 📸
                                        </Badge>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                            ক্লিক করে প্রিভিউ 👁️
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="mt-1 text-sm sm:text-base">সব ক্যাটালগ আইটেমের তালিকা (স্বয়ংক্রিয় ইমেজ অপ্টিমাইজেশন এবং পেজিনেশন)</CardDescription>
                                </div>
                            </div>
                            <div className="relative w-full">
                                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4 z-10" />
                                <Input
                                    placeholder="নাম, ধরন, বা ডিজাইন কোড দিয়ে খুঁজুন..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 sm:pl-10 w-full text-sm sm:text-base h-10 sm:h-12"
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-3 sm:p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {/* Table Skeleton */}
                                <div className="rounded-md border overflow-hidden">
                                    <div className="border-b bg-muted/50 p-3 sm:p-4">
                                        <div className="flex gap-2 sm:gap-4">
                                            <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20 animate-pulse"></div>
                                            <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 animate-pulse"></div>
                                            <div className="h-3 sm:h-4 bg-muted rounded w-20 sm:w-24 animate-pulse"></div>
                                            <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 animate-pulse"></div>
                                            <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20 animate-pulse"></div>
                                            <div className="h-3 sm:h-4 bg-muted rounded w-8 sm:w-12 animate-pulse"></div>
                                            <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 animate-pulse"></div>
                                        </div>
                                    </div>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="border-b p-3 sm:p-4">
                                            <div className="flex gap-2 sm:gap-4 items-center">
                                                <div className="h-3 sm:h-4 bg-muted rounded w-24 sm:w-32 animate-pulse"></div>
                                                <div className="h-5 sm:h-6 bg-muted rounded w-16 sm:w-20 animate-pulse"></div>
                                                <div className="h-3 sm:h-4 bg-muted rounded w-20 sm:w-24 animate-pulse"></div>
                                                <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 animate-pulse"></div>
                                                <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 animate-pulse"></div>
                                                <div className="flex gap-1">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded animate-pulse"></div>
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded animate-pulse"></div>
                                                </div>
                                                <div className="flex gap-1 sm:gap-2">
                                                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                                    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Pagination Skeleton */}
                                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t gap-3 sm:gap-0">
                                    <div className="h-3 sm:h-4 bg-muted rounded w-40 sm:w-48 animate-pulse"></div>
                                    <div className="flex gap-1 sm:gap-2">
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                        <div className="h-7 w-7 sm:h-8 sm:w-8 bg-muted rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full">
                                <VirtualTable
                                    data={filteredItems}
                                    shops={shops || []}
                                    onEdit={handleEdit}
                                    onDelete={(item) => deleteCatalogItem.mutate(item)}
                                    onImagePreview={openImagePreview}
                                    isLoading={isLoading}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Form Dialog - Simple & Clean */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg sm:text-xl font-bold">
                            {editingItem ? "আইটেম সম্পাদনা" : "নতুন আইটেম"}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Shop Selection - Simplified */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm sm:text-base">
                                <Store className="h-4 w-4" />
                                দোকান নির্বাচন করুন *
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 sm:p-3 border rounded-lg bg-muted/20">
                                {shops?.map((shop) => (
                                    <div key={shop.$id} className="flex items-center space-x-2 p-2 hover:bg-background rounded transition-colors">
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
                                        <Label className="text-sm font-normal cursor-pointer flex-1 truncate">{shop.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Type Selection - Simplified */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm sm:text-base">
                                <Tag className="h-4 w-4" />
                                ধরন *
                            </Label>
                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="h-10 sm:h-12">
                                            <SelectValue placeholder="ধরন নির্বাচন করুন" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORY_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{getCategoryIcon(type)}</span>
                                                        <span className="truncate">{type.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Name and Design Code - Simplified */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Tag className="h-4 w-4" />
                                    নাম *
                                </Label>
                                <div className="relative">
                                    <Input
                                        {...register("name")}
                                        placeholder="পণ্যের নাম লিখুন"
                                        className="h-10 sm:h-12 text-sm sm:text-base pr-10 sm:pr-12"
                                    />
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <VoiceTypingButton
                                            fieldName="name"
                                            setValue={setValue}
                                            currentValue={watch("name")}
                                            placeholder="পণ্যের নাম"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Tag className="h-4 w-4" />
                                    ডিজাইন কোড *
                                </Label>
                                <Input
                                    {...register("design_code")}
                                    placeholder="যেমন: DR-2024-001"
                                    className="h-10 sm:h-12 font-mono text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Description - Simplified */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm sm:text-base">
                                <Tag className="h-4 w-4" />
                                বিবরণ
                            </Label>
                            <div className="relative">
                                <Textarea
                                    {...register("description")}
                                    placeholder="পণ্যের বিবরণ লিখুন"
                                    rows={3}
                                    className="resize-none pr-10 sm:pr-12 text-sm sm:text-base"
                                />
                                <div className="absolute right-2 top-2">
                                    <VoiceTypingButton
                                        fieldName="description"
                                        setValue={setValue}
                                        currentValue={watch("description")}
                                        placeholder="পণ্যের বিবরণ"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price - Simplified */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Tag className="h-4 w-4" />
                                    মূল্য (OMR) *
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("sell_price")}
                                    placeholder="যেমন: ১২৫.৫০"
                                    className="h-10 sm:h-12 text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Tag className="h-4 w-4" />
                                    মুজুরী (OMR) *
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("worker_price")}
                                    placeholder="যেমন: ২৫.৭৫"
                                    className="h-10 sm:h-12 text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Image Upload - Simplified */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm sm:text-base">
                                <Upload className="h-4 w-4" />
                                ছবি যোগ করুন
                            </Label>
                            <div className="flex items-center gap-4">
                                <Label
                                    htmlFor="image-upload"
                                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4 sm:p-6 cursor-pointer hover:bg-accent/20 w-full transition-all duration-200 hover:border-primary/50"
                                >
                                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2" />
                                    <span className="text-sm text-center">
                                        {selectedImages.length > 0
                                            ? `${selectedImages.length}টি ছবি নির্বাচিত`
                                            : "ছবি আপলোড করুন"}
                                    </span>
                                    <span className="text-xs text-muted-foreground mt-1">
                                        PNG, JPG, WEBP
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
                                                    loading="lazy"
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

                        <DialogFooter className="pt-4 border-t">
                            <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-3 sm:gap-0">
                                <div className="text-xs text-muted-foreground text-center sm:text-left">
                                    ভয়েস টাইপিং ব্যবহার করুন
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto min-w-[100px] sm:min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    {editingItem ? "আপডেট" : "সংরক্ষণ"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Image Preview Modal - Simple & Clean */}
            <Dialog open={!!imagePreviewModal} onOpenChange={() => setImagePreviewModal(null)}>
                <DialogContent className="max-w-[95vw] sm:max-w-[85vw] max-h-[90vh] p-2 sm:p-4">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="truncate">{imagePreviewModal?.title || "ছবি প্রিভিউ"}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] bg-muted/20 rounded-lg">
                        {imagePreviewModal?.url ? (
                            <Image
                                src={imagePreviewModal.url}
                                alt="Preview"
                                width={600}
                                height={400}
                                className="max-w-full max-h-[70vh] object-contain rounded"
                                loading="lazy"
                                onError={(e) => {
                                    console.error('Image failed to load');
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                ছবি লোড করতে সমস্যা হয়েছে
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}
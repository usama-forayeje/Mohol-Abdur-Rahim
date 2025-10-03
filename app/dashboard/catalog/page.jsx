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
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
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
    Plus,
    Eye,
    Search,
    Upload,
    X,
    Store,
    Tag,

} from "lucide-react";
import Image from "next/image";
import PageContainer from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { VoiceTypingButton } from "@/components/ui/voice-typing-button";
import { MultiSelect } from "@/components/multi-select";
import { useCatalogStore } from "@/store/catalogStore";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { getOptimizedImageUrl } from "@/lib/image-optimizer";
import { VirtualTable } from "@/components/ui/virtual-table";
import { roleHelpers } from "@/lib/roles";

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

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length > 0) {
            setSelectedImages(imageFiles);
            setValue("images", imageFiles);
            setExistingImageUrls([]);

            // Create previews
            const previews = imageFiles.map((file) => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };

    const getCategoryIcon = (type) => {
        // Extract emoji from category name if present
        const emojiMatch = type.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
        return emojiMatch ? emojiMatch[0] : "📦";
    };

    return (
        <PageContainer>
            <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden px-1 sm:px-0">
                {/* Header - Title, Badges, Search & Add Button */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Top Row - Title and Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1 min-w-0 w-full">
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                                ক্যাটালগ ব্যবস্থাপনা
                            </h1>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 w-full">
                                <p className="text-xs sm:text-sm text-muted-foreground flex-1 min-w-0">আপনার পণ্য ক্যাটালগ পরিচালনা করুন</p>
                                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                    <Badge variant="outline" className="text-xs">
                                        ✨ {CATEGORY_TYPES.length} ক্যাটাগরি
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        📊 {catalogItems.length} আইটেম
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Controls - Search & Add Button */}
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                            {/* Search Bar */}
                            <div className="w-full sm:w-48 flex-shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                                    <Input
                                        placeholder="খুঁজুন..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-7 h-8 text-sm w-full"
                                    />
                                </div>
                            </div>

                            {/* Add Button */}
                            <Button
                                onClick={openForm}
                                className="w-full sm:w-auto flex items-center justify-center gap-1 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                            >
                                <Plus className="h-3 w-3 flex-shrink-0" />
                                <span className="hidden xs:inline">যোগ করুন</span>
                                <span className="xs:hidden">যোগ</span>
                            </Button>
                        </div>
                    </div>
                </div>


                {/* Table */}
                <Card className="shadow-lg border-0 w-full mx-auto max-w-full overflow-hidden">

                    <CardContent className="p-2 sm:p-3 md:p-4">

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
                <DialogContent className="max-w-[95vw] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] xl:max-w-[1000px] p-3 sm:p-6 md:p-8 mx-1 sm:mx-auto max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-3 sm:pb-4 space-y-2">
                        <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-center sm:text-left">
                            {editingItem ? "ক্যাটালগ আইটেম সম্পাদনা করুন" : "নতুন ক্যাটালগ আইটেম যোগ করুন"}
                        </DialogTitle>
                        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                            {editingItem ? "আপনার ক্যাটালগ আইটেমের তথ্য আপডেট করুন" : "নতুন পণ্য ক্যাটালগে যোগ করুন"}
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Shop Selection & Type Selection - Side by Side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            {/* Shop Selection - Multi-Select Dropdown */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Store className="h-4 w-4 flex-shrink-0" />
                                    দোকান নির্বাচন করুন *
                                </Label>

                                <Controller
                                    name="shopIds"
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={shops?.map(shop => ({
                                                value: shop.$id,
                                                label: shop.name
                                            })) || []}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="দোকান নির্বাচন করুন..."
                                            className="w-full"
                                        />
                                    )}
                                />

                                {/* Selection Summary */}
                                {watch("shopIds")?.length > 0 && (
                                    <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                                        নির্বাচিত দোকান: <span className="font-medium text-blue-600">{watch("shopIds").length}টি</span>
                                    </div>
                                )}
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
                        </div>

                        {/* Name and Design Code - Simplified */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Tag className="h-4 w-4 flex-shrink-0" />
                                    নাম *
                                </Label>
                                <div className="relative">
                                    <Input
                                        {...register("name")}
                                        placeholder="পণ্যের নাম লিখুন"
                                        className="h-9 sm:h-10 md:h-12 text-sm sm:text-base pr-9 sm:pr-10 md:pr-12"
                                    />
                                    <div className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2">
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
                                    <Tag className="h-4 w-4 flex-shrink-0" />
                                    ডিজাইন কোড *
                                </Label>
                                <Input
                                    {...register("design_code")}
                                    placeholder="যেমন: DR-2024-001"
                                    className="h-9 sm:h-10 md:h-12 font-mono text-sm sm:text-base"
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
                                    <Tag className="h-4 w-4 flex-shrink-0" />
                                    মূল্য (OMR) *
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("sell_price")}
                                    placeholder="যেমন: ১২৫.৫০"
                                    className="h-9 sm:h-10 md:h-12 text-sm sm:text-base"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm sm:text-base">
                                    <Tag className="h-4 w-4 flex-shrink-0" />
                                    মুজুরী (OMR) *
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register("worker_price")}
                                    placeholder="যেমন: ২৫.৭৫"
                                    className="h-9 sm:h-10 md:h-12 text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Image Upload - Two Column Layout */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-sm sm:text-base">
                                <Upload className="h-4 w-4 flex-shrink-0" />
                                ছবি যোগ করুন
                            </Label>

                            {/* Two Column Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Left Column - Upload Area */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">ছবি আপলোড করুন:</Label>
                                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-primary/50 transition-colors">
                                        <div
                                            className="flex flex-col items-center justify-center cursor-pointer hover:bg-accent/20 rounded-md p-3 transition-all duration-200 min-h-[120px]"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                        >
                                            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                            <span className="text-sm text-center mb-1">
                                                {selectedImages.length > 0
                                                    ? `${selectedImages.length}টি ছবি নির্বাচিত`
                                                    : "এখানে ছবি টেনে আনুন"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                অথবা ক্লিক করে নির্বাচন করুন
                                            </span>
                                            <span className="text-xs text-muted-foreground mt-1">
                                                PNG, JPG, WEBP (সর্বোচ্চ ৫টি)
                                            </span>
                                        </div>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Preview Area */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">প্রিভিউ:</Label>
                                    <div className="border rounded-lg p-2 bg-muted/20 min-h-[120px] max-h-[200px] overflow-y-auto">
                                        {imagePreviews.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {imagePreviews.map((preview, index) => (
                                                    <div key={index} className="relative group">
                                                        <Image
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            width={80}
                                                            height={80}
                                                            className="w-full h-16 object-cover rounded border"
                                                            loading="lazy"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-1 -right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <X className="h-2 w-2" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                                কোনো ছবি নেই
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-3 sm:pt-4 border-t">
                            <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-2 sm:gap-0">
                                <div className="text-xs text-muted-foreground text-center sm:text-left order-2 sm:order-1">
                                    ভয়েস টাইপিং ব্যবহার করুন
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full sm:w-auto min-w-[90px] sm:min-w-[100px] md:min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base h-9 sm:h-10 order-1 sm:order-2"
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
                <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] max-h-[90vh] p-2 sm:p-3 md:p-4 mx-1 sm:mx-auto">
                    <DialogHeader className="pb-3 sm:pb-4">
                        <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2 sm:gap-3">
                            <Eye className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-blue-600" />
                            <span className="truncate">{imagePreviewModal?.title || "পণ্যের ছবি"}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-3 sm:p-4">
                        {imagePreviewModal?.url ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                <Image
                                    src={imagePreviewModal.url}
                                    alt="পণ্যের বড় ছবি"
                                    width={800}
                                    height={600}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    loading="lazy"
                                    onError={(e) => {
                                        console.error('Image failed to load');
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8 sm:py-12">
                                <Eye className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                                <p className="text-base sm:text-lg font-medium mb-2">ছবি লোড করতে সমস্যা হয়েছে</p>
                                <p className="text-sm opacity-75">ছবিটি অস্থিত্বহীন বা অ্যাক্সেস করা যাচ্ছে না</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </PageContainer>
    );
}

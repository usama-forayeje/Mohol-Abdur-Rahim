"use client";

import React, { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Eye, Edit2, Trash2, Store, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/image-optimizer";

const columnHelper = createColumnHelper();

export function VirtualTable({
    data,
    shops = [],
    onEdit,
    onDelete,
    onImagePreview,
    isLoading = false,
    className = "",
}) {
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Memoize columns to prevent unnecessary re-renders
    const columns = useMemo(() => [
        columnHelper.accessor("name", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent text-xs sm:text-sm"
                    onClick={() => column.toggleSorting()}
                >
                    নাম
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-3 w-3" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-3 w-3" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ getValue, row }) => (
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{getValue()}</span>
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 hidden sm:inline-flex">
                        🎤
                    </Badge>
                </div>
            ),
            size: window.innerWidth < 640 ? 150 : 200,
        }),
        columnHelper.accessor("type", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => column.toggleSorting()}
                >
                    ধরন
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-3 w-3" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-3 w-3" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ getValue }) => {
                const getCategoryIcon = (type) => {
                    const emojiMatch = type.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
                    return emojiMatch ? emojiMatch[0] : "📦";
                };

                return (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        {getCategoryIcon(getValue())}
                        {getValue().replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()}
                    </Badge>
                );
            },
            size: 150,
        }),
        columnHelper.accessor("design_code", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => column.toggleSorting()}
                >
                    ডিজাইন কোড
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-3 w-3" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-3 w-3" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ getValue }) => (
                <div className="flex items-center gap-1 font-mono">
                    {getValue()}
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        🆔
                    </Badge>
                </div>
            ),
            size: 120,
        }),
        columnHelper.accessor("sell_price", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => column.toggleSorting()}
                >
                    মূল্য
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-3 w-3" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-3 w-3" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ getValue }) => (
                <div className="flex items-center gap-1 font-bold">
                    OMR {getValue()}
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        বিক্রয়
                    </Badge>
                </div>
            ),
            size: 100,
        }),
        columnHelper.accessor("worker_price", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                    onClick={() => column.toggleSorting()}
                >
                    মুজুরী
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-3 w-3" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-3 w-3" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-3 w-3" />}
                </Button>
            ),
            cell: ({ getValue }) => (
                <div className="flex items-center gap-1 font-bold">
                    OMR {getValue()}
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        কর্মী
                    </Badge>
                </div>
            ),
            size: 100,
        }),
        columnHelper.accessor("shopIds", {
            header: "দোকান",
            cell: ({ getValue }) => {
                const shopIds = getValue() || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {shopIds.map((shopId) => {
                            const shop = shops.find(s => s.$id === shopId);
                            return shop ? (
                                <Badge key={shopId} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    <Store className="h-3 w-3 mr-1" />
                                    {shop.name}
                                </Badge>
                            ) : null;
                        })}
                        {shopIds.length === 0 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                                কোন দোকান নেই
                            </Badge>
                        )}
                    </div>
                );
            },
            size: 180,
        }),
        columnHelper.accessor("images", {
            header: "ছবি",
            cell: ({ getValue, row }) => {
                const images = getValue() || [];
                if (images.length === 0) {
                    return <span className="text-muted-foreground text-sm">নেই</span>;
                }

                return (
                    <div className="flex gap-1">
                        {images.slice(0, 3).map((imageId, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={getOptimizedImageUrl(imageId, { width: 40, height: 40 })}
                                    alt={`Image ${index + 1}`}
                                    className="w-10 h-10 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                    loading="lazy"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (onImagePreview && typeof onImagePreview === 'function') {
                                            onImagePreview(imageId, row.original.name);
                                        }
                                    }}
                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                    onError={(e) => {
                                        console.error('Image failed to load in table:', imageId);
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                    <Eye className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        ))}
                        {images.length > 3 && (
                            <Badge variant="secondary" className="h-10 w-10 flex items-center justify-center">
                                +{images.length - 3}
                            </Badge>
                        )}
                    </div>
                );
            },
            size: 120,
        }),
        columnHelper.display({
            id: "actions",
            header: "ক্রিয়া",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit && onEdit(row.original)}
                        className="h-8 w-8 p-0"
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete && onDelete(row.original)}
                        className="h-8 w-8 p-0"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
            size: 100,
        }),
    ], [shops, onEdit, onDelete, onImagePreview]);

    // Filter data based on global filter
    const filteredData = useMemo(() => {
        if (!globalFilter) return data;

        return data.filter((item) => {
            const searchTerm = globalFilter.toLowerCase();
            return (
                item.name?.toLowerCase().includes(searchTerm) ||
                item.type?.toLowerCase().includes(searchTerm) ||
                item.design_code?.toLowerCase().includes(searchTerm) ||
                item.sell_price?.toString().includes(searchTerm) ||
                item.worker_price?.toString().includes(searchTerm) ||
                item.shopIds?.some(shopId => {
                    const shop = shops.find(s => s.$id === shopId);
                    return shop?.name?.toLowerCase().includes(searchTerm);
                })
            );
        });
    }, [data, globalFilter, shops]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [globalFilter]);

    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        manualPagination: true,
        pageCount: totalPages,
    });

    // Virtual scrolling setup
    const tableContainerRef = React.useRef(null);
    const { rows } = table.getRowModel();
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 60, // Estimated row height
        overscan: 5,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
                <span>লোড হচ্ছে...</span>
            </div>
        );
    }

    if (filteredData.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                    {globalFilter ? "কোন আইটেম পাওয়া যায়নি" : "কোন ক্যাটালগ আইটেম পাওয়া যায়নি"}
                </div>
                {globalFilter && (
                    <Button onClick={() => setGlobalFilter("")} variant="outline">
                        সব দেখান
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            {/* Table Container with Virtual Scrolling */}
            <div className="w-full">
                <div className="relative">
                    {/* Horizontal scroll indicator for mobile */}
                    <div className="sm:hidden bg-muted/30 text-xs text-muted-foreground text-center py-1 border-b">
                        ← সোয়াইপ করে দেখুন →
                    </div>
                    <div
                        ref={tableContainerRef}
                        className="rounded-md border max-h-[300px] sm:max-h-[400px] lg:max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                        style={{
                            height: Math.min(rows.length * 60 + 120, window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 400 : 600)
                        }}
                    >
                        <Table className="min-w-full">
                            <TableHeader className="sticky top-0 bg-background z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="min-w-full">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                style={{
                                                    width: header.getSize(),
                                                    minWidth: header.column.id === 'name' ? '150px' :
                                                        header.column.id === 'type' ? '120px' :
                                                            header.column.id === 'design_code' ? '100px' :
                                                                header.column.id === 'sell_price' ? '80px' :
                                                                    header.column.id === 'worker_price' ? '80px' :
                                                                        header.column.id === 'shopIds' ? '140px' :
                                                                            header.column.id === 'images' ? '100px' :
                                                                                header.column.id === 'actions' ? '80px' : 'auto'
                                                }}
                                                className="bg-muted/50 text-xs sm:text-sm"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const row = rows[virtualRow.index];
                                    return (
                                        <TableRow
                                            key={row.id}
                                            data-index={virtualRow.index}
                                            ref={virtualRow.measureElement}
                                            className="hover:bg-muted/50"
                                            style={{
                                                height: `${virtualRow.size}px`,
                                            }}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Table Info and Pagination Controls */}
            <div className="flex flex-col gap-4 pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span>সারি প্রতি:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-20 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-xs sm:text-sm">
                            পৃষ্ঠা {currentPage} এর {totalPages} • মোট {filteredData.length} আইটেম
                            {globalFilter && <span className="text-blue-600"> (ফিল্টার করা: "{globalFilter}")</span>}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        {sorting.length > 0 && (
                            <div className="flex items-center gap-1 mr-2 hidden sm:flex">
                                {sorting.map((sort) => (
                                    <Badge key={`${sort.id}-${sort.desc ? 'desc' : 'asc'}`} variant="outline" className="text-xs">
                                        {sort.id}: {sort.desc ? 'অধঃক্রম' : 'উর্ধ্বক্রম'}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-8 px-2 sm:px-3"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline ml-1">পূর্ববর্তী</span>
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPages) }, (_, i) => {
                                    const pageNumber = Math.max(1, Math.min(totalPages - (window.innerWidth < 640 ? 2 : 4), currentPage - 2)) + i;
                                    if (pageNumber > totalPages) return null;

                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className="w-8 h-8 p-0 text-xs"
                                        >
                                            {pageNumber}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="h-8 px-2 sm:px-3"
                            >
                                <span className="hidden sm:inline mr-1">পরবর্তী</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
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
    userRole = "staff",
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
                    className="h-auto p-0 font-semibold hover:bg-transparent text-xs min-w-0"
                    onClick={() => column.toggleSorting()}
                >
                    <span className="truncate">নাম</span>
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                </Button>
            ),
            cell: ({ getValue, row }) => (
                <div className="flex items-center gap-1 min-w-0">
                    <span className="font-medium text-xs truncate flex-1 min-w-0" title={getValue()}>
                        {getValue()}
                    </span>
                </div>
            ),
            size: 150,
            minSize: 100,
            maxSize: 180,
        }),
        columnHelper.accessor("type", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent text-xs min-w-0"
                    onClick={() => column.toggleSorting()}
                >
                    <span className="truncate">ধরন</span>
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                </Button>
            ),
            cell: ({ getValue }) => {
                const typeText = getValue().replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();

                return (
                    <span className="text-xs truncate inline-block max-w-full" title={typeText}>
                        {typeText}
                    </span>
                );
            },
            size: 120,
            minSize: 80,
            maxSize: 140,
        }),
        columnHelper.accessor("design_code", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent text-xs min-w-0"
                    onClick={() => column.toggleSorting()}
                >
                    <span className="truncate">কোড</span>
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                </Button>
            ),
            cell: ({ getValue }) => (
                <span className="text-xs font-mono truncate inline-block max-w-full" title={getValue()}>
                    {getValue()}
                </span>
            ),
            size: 90,
            minSize: 60,
            maxSize: 100,
        }),
        columnHelper.accessor("sell_price", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent text-xs min-w-0"
                    onClick={() => column.toggleSorting()}
                >
                    <span className="truncate">মূল্য</span>
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                </Button>
            ),
            cell: ({ getValue }) => (
                <span className="text-xs font-bold truncate inline-block max-w-full">
                    OMR {getValue()}
                </span>
            ),
            size: 80,
            minSize: 60,
            maxSize: 90,
        }),
        columnHelper.accessor("worker_price", {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-semibold hover:bg-transparent text-xs min-w-0"
                    onClick={() => column.toggleSorting()}
                >
                    <span className="truncate">মুজুরী</span>
                    {column.getIsSorted() === "asc" && <ArrowUp className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {column.getIsSorted() === "desc" && <ArrowDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                    {!column.getIsSorted() && <ArrowUpDown className="ml-1 h-2 w-2 flex-shrink-0" />}
                </Button>
            ),
            cell: ({ getValue }) => (
                <span className="text-xs font-bold truncate inline-block max-w-full">
                    OMR {getValue()}
                </span>
            ),
            size: 80,
            minSize: 60,
            maxSize: 90,
        }),
        columnHelper.accessor("shopIds", {
            header: ({ column }) => (
                <div className="font-semibold text-xs min-w-0">
                    <span className="truncate">দোকান</span>
                </div>
            ),
            cell: ({ getValue }) => {
                const shopIds = getValue() || [];
                const displayShops = shopIds.slice(0, 2);
                const remainingCount = shopIds.length - displayShops.length;

                return (
                    <div className="flex flex-wrap gap-1 min-w-0">
                        {displayShops.map((shopId) => {
                            const shop = shops.find(s => s.$id === shopId);
                            return shop ? (
                                <span key={shopId} className="text-xs bg-blue-50 text-blue-700 px-1 py-0.5 rounded border flex-shrink-0 truncate" title={shop.name}>
                                    {shop.name.substring(0, 10) + (shop.name.length > 10 ? '...' : '')}
                                </span>
                            ) : null;
                        })}
                        {remainingCount > 0 && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                +{remainingCount}
                            </span>
                        )}
                        {shopIds.length === 0 && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                -
                            </span>
                        )}
                    </div>
                );
            },
            size: 140,
            minSize: 90,
            maxSize: 160,
        }),
        columnHelper.accessor("images", {
            header: ({ column }) => (
                <div className="font-semibold text-xs min-w-0">
                    <span className="truncate">ছবি</span>
                </div>
            ),
            cell: ({ getValue, row }) => {
                const images = getValue() || [];
                if (images.length === 0) {
                    return <span className="text-muted-foreground text-xs">নেই</span>;
                }

                return (
                    <div className="flex gap-1 min-w-0">
                        {images.slice(0, 3).map((imageId, index) => (
                            <img
                                key={index}
                                src={getOptimizedImageUrl(imageId, { width: 32, height: 32 })}
                                alt={`Image ${index + 1}`}
                                className="w-8 h-8 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
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
                        ))}
                        {images.length > 3 && (
                            <span className="text-xs flex items-center justify-center w-8 h-8 flex-shrink-0">
                                +{images.length - 3}
                            </span>
                        )}
                    </div>
                );
            },
            size: 90,
            minSize: 60,
            maxSize: 100,
        }),
        columnHelper.display({
            id: "actions",
            header: ({ column }) => (
                <div className="font-semibold text-xs min-w-0">
                    <span className="truncate">ক্রিয়া</span>
                </div>
            ),
            cell: ({ row }) => {
                // Check if user can modify (admin, superAdmin, manager)
                const canModify = ["admin", "superAdmin", "manager"].includes(userRole);

                return (
                    <div className="flex gap-1 min-w-0">
                        {canModify && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit && onEdit(row.original)}
                                    className="h-6 w-6 p-0 flex-shrink-0 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
                                    title="সম্পাদনা করুন"
                                >
                                    <Edit2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete && onDelete(row.original)}
                                    className="h-6 w-6 p-0 flex-shrink-0 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                                    title="মুছে ফেলুন"
                                >
                                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                </Button>
                            </>
                        )}
                        {!canModify && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                                শুধুমাত্র দেখুন
                            </span>
                        )}
                    </div>
                );
            },
            size: 80,
            minSize: 60,
            maxSize: 90,
        }),
    ], [shops, onEdit, onDelete, onImagePreview, userRole]);

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
        <div className={`${className} w-full`}>
            {/* Table Container with Virtual Scrolling */}
            <div className="w-full max-w-full overflow-hidden">
                <div className="relative w-full">
                    {/* Horizontal scroll indicator for mobile */}
                    <div className="sm:hidden bg-muted/30 text-xs text-muted-foreground text-center py-1 border-b">
                        ← সোয়াইপ করে দেখুন →
                    </div>
                    <div
                        ref={tableContainerRef}
                        className="rounded-md border max-h-[250px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-[600px] overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 w-full"
                        style={{
                            height: Math.min(rows.length * 60 + 120, 600),
                            maxWidth: '100%',
                            overflowX: 'auto',
                            overflowY: 'auto'
                        }}
                    >
                        <Table className="min-w-[800px] w-full table-fixed">
                            <TableHeader className="sticky top-0 bg-background z-10 border-b-2">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="min-w-full w-full">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                style={{
                                                    width: header.getSize(),
                                                    minWidth: header.column.id === 'name' ? '120px' :
                                                             header.column.id === 'type' ? '100px' :
                                                             header.column.id === 'design_code' ? '80px' :
                                                             header.column.id === 'sell_price' ? '70px' :
                                                             header.column.id === 'worker_price' ? '70px' :
                                                             header.column.id === 'shopIds' ? '120px' :
                                                             header.column.id === 'images' ? '80px' :
                                                             header.column.id === 'actions' ? '70px' : 'auto',
                                                }}
                                                className="bg-muted/30 text-xs font-semibold border-r border-muted/50 last:border-r-0 px-1 py-2"
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
                                                <TableCell
                                                    key={cell.id}
                                                    style={{
                                                        width: cell.column.getSize(),
                                                        minWidth: cell.column.id === 'name' ? '120px' :
                                                                 cell.column.id === 'type' ? '100px' :
                                                                 cell.column.id === 'design_code' ? '80px' :
                                                                 cell.column.id === 'sell_price' ? '70px' :
                                                                 cell.column.id === 'worker_price' ? '70px' :
                                                                 cell.column.id === 'shopIds' ? '120px' :
                                                                 cell.column.id === 'images' ? '80px' :
                                                                 cell.column.id === 'actions' ? '70px' : 'auto'
                                                    }}
                                                    className="px-1 py-2 text-xs border-r border-muted/30 last:border-r-0"
                                                >
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
            <div className="flex flex-col gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="whitespace-nowrap">সারি প্রতি:</span>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-16 sm:w-20 h-7 sm:h-8 text-xs sm:text-sm">
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
                        <span className="text-xs sm:text-sm truncate min-w-0">
                            পৃষ্ঠা {currentPage}/{totalPages} • মোট {filteredData.length} আইটেম
                            {globalFilter && <span className="text-blue-600"> (ফিল্টার করা)</span>}
                        </span>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        {sorting.length > 0 && (
                            <div className="flex items-center gap-1 mr-1 sm:mr-2 hidden sm:flex">
                                {sorting.slice(0, 2).map((sort) => (
                                    <Badge key={`${sort.id}-${sort.desc ? 'desc' : 'asc'}`} variant="outline" className="text-xs truncate max-w-[100px]">
                                        <span className="truncate">{sort.id}: {sort.desc ? 'অধঃক্রম' : 'উর্ধ্বক্রম'}</span>
                                    </Badge>
                                ))}
                                {sorting.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{sorting.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="h-7 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm"
                            >
                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="hidden sm:inline ml-1">পূর্ববর্তী</span>
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                    if (pageNumber > totalPages) return null;

                                    return (
                                        <Button
                                            key={pageNumber}
                                            variant={currentPage === pageNumber ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNumber)}
                                            className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs"
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
                                className="h-7 sm:h-8 px-1 sm:px-2 text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline mr-1">পরবর্তী</span>
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
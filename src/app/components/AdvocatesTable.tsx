"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useMemo } from "react";

interface Advocate {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: number;
  createdAt: string;
}

interface AdvocatesTableProps {
  data: Advocate[];
  isLoading?: boolean;
  onSortChange?: (sorting: SortingState) => void;
  onPageChange?: (pageIndex: number, pageSize: number) => void;
  currentSorting?: SortingState;
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
}

// Expandable Specialties Component
function ExpandableSpecialties({ specialties, advocateId }: { specialties: string[]; advocateId: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxVisible = 5;
  const hasMore = specialties.length > maxVisible;

  if (!hasMore) {
    return (
      <div className="flex flex-wrap gap-1">
        {specialties.map((specialty: string, index: number) => (
          <span
            key={`${advocateId}-${index}`}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-blue-600 text-blue-700"
          >
            {specialty}
          </span>
        ))}
      </div>
    );
  }

  const visibleSpecialties = isExpanded ? specialties : specialties.slice(0, maxVisible);

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {visibleSpecialties.map((specialty: string, index: number) => (
          <span
            key={`${advocateId}-${index}`}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white border border-blue-600 text-blue-700"
          >
            {specialty}
          </span>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {isExpanded ? `Show less` : `Show ${specialties.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
}

export default function AdvocatesTable({
  data,
  isLoading = false,
  onSortChange,
  onPageChange,
  currentSorting = [],
  currentPage = 0,
  pageSize = 10,
  totalCount = 0,
}: AdvocatesTableProps) {
  const [sorting, setSorting] = useState<SortingState>(currentSorting);

  const columns = useMemo<ColumnDef<Advocate>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded text-xs"
          >
            Name
            {column.getIsSorted() === "asc" && <span className="text-blue-600">↑</span>}
            {column.getIsSorted() === "desc" && <span className="text-blue-600">↓</span>}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {row.original.firstName} {row.original.lastName}
          </div>
        ),
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded text-xs"
          >
            City
            {column.getIsSorted() === "asc" && <span className="text-blue-600">↑</span>}
            {column.getIsSorted() === "desc" && <span className="text-blue-600">↓</span>}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">{row.original.city}</div>
        ),
      },
      {
        accessorKey: "degree",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded text-xs"
          >
            Degree
            {column.getIsSorted() === "asc" && <span className="text-blue-600">↑</span>}
            {column.getIsSorted() === "desc" && <span className="text-blue-600">↓</span>}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">{row.original.degree}</div>
        ),
      },
      {
        accessorKey: "specialties",
        header: "Specialties",
        cell: ({ row }) => (
          <ExpandableSpecialties specialties={row.original.specialties} advocateId={row.original.id} />
        ),
      },
      {
        accessorKey: "yearsOfExperience",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded text-xs"
          >
            Experience
            {column.getIsSorted() === "asc" && <span className="text-blue-600">↑</span>}
            {column.getIsSorted() === "desc" && <span className="text-blue-600">↓</span>}
          </button>
        ),
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.yearsOfExperience} {row.original.yearsOfExperience === 1 ? 'year' : 'years'}
          </div>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.phoneNumber.toString().replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      onSortChange?.(newSorting);
    },
    state: {
      sorting,
    },
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pageSize),
    initialState: {
      pagination: {
        pageIndex: currentPage,
        pageSize: pageSize,
      },
    },
  });

  const handlePageChange = (pageIndex: number) => {
    onPageChange?.(pageIndex, pageSize);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading advocates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
      <div className="overflow-x-auto flex-1">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p className="text-lg font-medium">No advocates found</p>
                      <p className="text-sm">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{currentPage * pageSize + 1}</span> to{' '}
          <span className="font-medium">{Math.min((currentPage + 1) * pageSize, totalCount)}</span> of{' '}
          <span className="font-medium">{totalCount}</span> results
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage + 1} of {Math.ceil(totalCount / pageSize)}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize) - 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
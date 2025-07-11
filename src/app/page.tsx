"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import SearchSection from "./components/SearchSection";
import AdvocatesTable from "./components/AdvocatesTable";
import { type SortingState } from "@tanstack/react-table";

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

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("firstName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce searchTerm into debouncedSearchTerm
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchTerm]);

  // Fetch advocates with search, pagination, and sorting
  const fetchAdvocates = useCallback(async (search?: string, page?: number, sort?: string, order?: "asc" | "desc") => {
    try {
      // Show loading state for any operation that's not the initial load
      const isInitialLoad = !search && page === 1 && sort === "firstName" && order === "asc";

      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (page) params.append('page', page.toString());
      if (sort) params.append('sortBy', sort);
      if (order) params.append('sortOrder', order);

      const url = `/api/advocates?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonResponse = await response.json();
      setAdvocates(jsonResponse.data);
      setTotalCount(jsonResponse.pagination.total);
    } catch (err) {
      console.error("Error fetching advocates:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch advocates");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Memoize the initial load check to prevent unnecessary re-renders
  const isInitialLoad = useMemo(() => {
    return !debouncedSearchTerm && currentPage === 1 && sortBy === "firstName" && sortOrder === "asc";
  }, [debouncedSearchTerm, currentPage, sortBy, sortOrder]);

  // Single effect to handle all data fetching
  useEffect(() => {
    if (isInitialLoad) {
      fetchAdvocates();
    } else {
      fetchAdvocates(debouncedSearchTerm, currentPage, sortBy, sortOrder);
    }
  }, [debouncedSearchTerm, currentPage, sortBy, sortOrder, fetchAdvocates, isInitialLoad]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleRetry = useCallback(() => {
    fetchAdvocates(debouncedSearchTerm, currentPage, sortBy, sortOrder);
  }, [fetchAdvocates, debouncedSearchTerm, currentPage, sortBy, sortOrder]);

  // Convert TanStack sorting state to our format
  const handleTableSortChange = useCallback((sorting: SortingState) => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0];
      setSortBy(id);
      setSortOrder(desc ? "desc" : "asc");
      setCurrentPage(1);
    }
  }, []);

  // Convert TanStack pagination to our format
  const handleTablePageChange = useCallback((pageIndex: number, pageSize: number) => {
    setCurrentPage(pageIndex + 1); // TanStack uses 0-based indexing
  }, []);

  // Convert our sorting state to TanStack format
  const currentSorting: SortingState = useMemo(() => {
    return sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [];
  }, [sortBy, sortOrder]);

  // Memoize the table props to prevent unnecessary re-renders
  const tableProps = useMemo(() => ({
    data: advocates,
    isLoading: isSearching,
    onSortChange: handleTableSortChange,
    onPageChange: handleTablePageChange,
    currentSorting,
    currentPage: currentPage - 1, // Convert to 0-based for TanStack
    pageSize: 10,
    totalCount,
  }), [advocates, isSearching, handleTableSortChange, handleTablePageChange, currentSorting, currentPage, totalCount]);

  // Memoize the search section props
  const searchSectionProps = useMemo(() => ({
    searchTerm,
    onSearchChange: handleSearchChange,
    onResetSearch: handleResetSearch,
    filteredCount: advocates.length,
    totalCount,
    isSearching,
  }), [searchTerm, handleSearchChange, handleResetSearch, advocates.length, totalCount, isSearching]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Solace Advocates</h1>
          <p className="text-gray-600 text-sm">Find and search through our network of legal advocates</p>
        </div>

        <SearchSection {...searchSectionProps} />

        <div className="flex-1 min-h-0">
          <AdvocatesTable {...tableProps} />
        </div>
      </div>
    </main>
  );
}
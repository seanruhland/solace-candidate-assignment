"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import SearchSection from "./components/SearchSection";
import Pagination from "./components/Pagination";

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

  // Single effect to handle all data fetching
  useEffect(() => {
    const isInitialLoad = !debouncedSearchTerm && currentPage === 1 && sortBy === "firstName" && sortOrder === "asc";

    if (isInitialLoad) {
      fetchAdvocates();
    } else {
      fetchAdvocates(debouncedSearchTerm, currentPage, sortBy, sortOrder);
    }
  }, [debouncedSearchTerm, currentPage, sortBy, sortOrder, fetchAdvocates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  };

  const handleRetry = () => {
    fetchAdvocates(debouncedSearchTerm, currentPage, sortBy, sortOrder);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Memoize table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    if (advocates.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-lg font-medium">No advocates found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          </td>
        </tr>
      );
    }

    return advocates.map((advocate: Advocate) => (
      <tr key={advocate.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div>
            <div className="text-sm font-medium text-gray-900">
              {advocate.firstName} {advocate.lastName}
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{advocate.city}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{advocate.degree}</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1">
            {advocate.specialties.map((specialty: string, index: number) => (
              <span
                key={`${advocate.id}-${index}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {specialty}
              </span>
            ))}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {advocate.yearsOfExperience} {advocate.yearsOfExperience === 1 ? 'year' : 'years'}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {advocate.phoneNumber.toString().replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')}
          </div>
        </td>
      </tr>
    ));
  }, [advocates]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solace Advocates</h1>
          <p className="text-gray-600">Find and search through our network of legal advocates</p>
        </div>

        <SearchSection
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onResetSearch={handleResetSearch}
          filteredCount={advocates.length}
          totalCount={totalCount}
          isSearching={isSearching}
        />

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("firstName")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortBy === "firstName" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("city")}
                    >
                      <div className="flex items-center gap-1">
                        City
                        {sortBy === "city" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("degree")}
                    >
                      <div className="flex items-center gap-1">
                        Degree
                        {sortBy === "degree" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Specialties
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("yearsOfExperience")}
                    >
                      <div className="flex items-center gap-1">
                        Experience
                        {sortBy === "yearsOfExperience" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      Phone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {tableRows}
              </tbody>
            </table>
            </div>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalCount / 10)}
            totalItems={totalCount}
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </main>
  );
}
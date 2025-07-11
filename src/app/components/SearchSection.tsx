interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSearch: () => void;
  filteredCount: number;
  totalCount: number;
  isSearching?: boolean;
}

export default function SearchSection({
  searchTerm,
  onSearchChange,
  onResetSearch,
  filteredCount,
  totalCount,
  isSearching = false,
}: SearchSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 flex-shrink-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Advocates
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              onChange={onSearchChange}
              value={searchTerm}
              placeholder="Search by name, city, degree, specialty, or experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
            {searchTerm && (
              <button
                onClick={onResetSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Results count below input */}
          <div className="mt-1">
            <p className="text-xs text-gray-500">
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  Searching...
                </span>
              ) : (
                <>
                  Showing <span className="font-medium text-gray-700">{filteredCount}</span> of{" "}
                  <span className="font-medium text-gray-700">{totalCount}</span> advocates
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
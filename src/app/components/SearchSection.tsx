interface SearchSectionProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSearch: () => void;
  filteredCount: number;
  totalCount: number;
}

export default function SearchSection({
  searchTerm,
  onSearchChange,
  onResetSearch,
  filteredCount,
  totalCount,
}: SearchSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Advocates
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              onChange={onSearchChange}
              value={searchTerm}
              placeholder="Search by name, city, degree, specialty, or experience..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={onResetSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalCount}</span> advocates
          </div>
          {searchTerm && (
            <button
              onClick={onResetSearch}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
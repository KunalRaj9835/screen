'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Filters {
  [key: string]: string;
}

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    setLoading(true);
    
    // Create query parameters from filters
    const searchParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        searchParams.append(key, filters[key]);
      }
    });
    
    // Navigate to results page with search parameters
    router.push(`/query-result?${searchParams.toString()}`);
  };

  const handleTextFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Stock Screener</h1>
          <p className="text-gray-600">Search and analyze stocks</p>
        </div>
        
        <div className="space-y-4">
          {/* Company Name Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by company name..."
              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters['Name'] || ''}
              onChange={(e) => handleTextFilterChange('Name', e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white p-2 rounded-lg transition-colors"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Additional Search Fields */}
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search by sector..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters['Sector'] || ''}
              onChange={(e) => handleTextFilterChange('Sector', e.target.value)}
              onKeyPress={handleKeyPress}
            />
            
            <input
              type="text"
              placeholder="Search by industry..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters['Industry'] || ''}
              onChange={(e) => handleTextFilterChange('Industry', e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search Stocks'}
          </button>
          
          {/* Clear Filters */}
          {Object.keys(filters).some(key => filters[key]) && (
            <button
              onClick={() => setFilters({})}
              className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SavedQuery {
  id?: string;
  name: string;
  description: string;
  tags: string[];
  filters: { [key: string]: string };
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  timestamp: string;
  resultCount: number;
  totalCount: number;
}

// Predefined tags library
const PREDEFINED_TAGS = [
  'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'a9', 'a10',
  'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20',
  'a21', 'a22', 'a23', 'a24', 'a25', 'a26', 'a27', 'a28', 'a29', 'a30'
];

export default function SaveQuery() {
  const [queryData, setQueryData] = useState<SavedQuery | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [showSavedQueries, setShowSavedQueries] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get query data from URL parameters
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setQueryData(decoded);
        
        // Auto-generate name based on filters
        const filterNames = Object.keys(decoded.filters).filter(key => decoded.filters[key]);
        const autoName = filterNames.length > 0 
          ? `Query with ${filterNames.join(', ')}` 
          : `Stock Query ${new Date().toLocaleDateString()}`;
        setName(autoName);
      } catch (error) {
        console.error('Error parsing query data:', error);
      }
    }

    // Load saved queries from localStorage
    loadSavedQueries();
  }, [searchParams]);

  const loadSavedQueries = () => {
    try {
      const saved = localStorage.getItem('savedStockQueries');
      if (saved) {
        setSavedQueries(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved queries:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const saveQuery = async () => {
    if (!queryData || !name.trim()) {
      alert('Please enter a name for your query');
      return;
    }

    setSaving(true);
    
    try {
      const newQuery: SavedQuery = {
        id: Date.now().toString(),
        ...queryData,
        name: name.trim(),
        description: description.trim(),
        tags: selectedTags
      };

      // Save to localStorage
      const existingQueries = JSON.parse(localStorage.getItem('savedStockQueries') || '[]');
      const updatedQueries = [...existingQueries, newQuery];
      localStorage.setItem('savedStockQueries', JSON.stringify(updatedQueries));

      alert('Query saved successfully!');
      router.push('/my-query');
    } catch (error) {
      console.error('Error saving query:', error);
      alert('Error saving query. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteQuery = (id: string) => {
    if (confirm('Are you sure you want to delete this saved query?')) {
      const updatedQueries = savedQueries.filter(q => q.id !== id);
      localStorage.setItem('savedStockQueries', JSON.stringify(updatedQueries));
      setSavedQueries(updatedQueries);
    }
  };

  const loadQuery = (query: SavedQuery) => {
    // Create URL parameters from the saved query
    const searchParams = new URLSearchParams();
    Object.keys(query.filters).forEach(key => {
      if (query.filters[key]) {
        searchParams.append(key, query.filters[key]);
      }
    });
    
    router.push(`/query-results?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Results
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Save Query</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/my-query')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                My Queries ({savedQueries.length})
              </button>
              <button
                onClick={() => setShowSavedQueries(!showSavedQueries)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {showSavedQueries ? 'Hide' : 'View'} Recent
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Save Current Query */}
        {queryData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Save Current Query</h2>
            
            {/* Query Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Query Summary:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Results: {queryData.resultCount} of {queryData.totalCount} stocks</div>
                <div>Created: {new Date(queryData.timestamp).toLocaleString()}</div>
                {Object.keys(queryData.filters).length > 0 && (
                  <div>
                    Filters: {Object.entries(queryData.filters)
                      .filter(([_, value]) => value)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                  </div>
                )}
                {queryData.sortConfig && (
                  <div>
                    Sort: {queryData.sortConfig.key} ({queryData.sortConfig.direction})
                  </div>
                )}
              </div>
            </div>

            {/* Save Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Query Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a name for this query"
                />
              </div>

              {/* Tags Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {PREDEFINED_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-xs rounded border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-600">Selected tags: </span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedTags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                        >
                          {tag}
                          <button
                            onClick={() => handleTagToggle(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a description for this query..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={saveQuery}
                  disabled={saving || !name.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Query'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Saved Queries */}
        {showSavedQueries && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Saved Queries</h2>
            
            {savedQueries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No saved queries yet
              </div>
            ) : (
              <div className="space-y-4">
                {savedQueries.slice(0, 5).map((query) => (
                  <div key={query.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{query.name}</h3>
                        
                        {/* Tags */}
                        {query.tags && query.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {query.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {query.description && (
                          <p className="text-gray-600 text-sm mt-1">{query.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div>Saved: {new Date(query.timestamp).toLocaleString()}</div>
                          <div>Results: {query.resultCount} of {query.totalCount} stocks</div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => loadQuery(query)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteQuery(query.id!)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {savedQueries.length > 5 && (
                  <div className="text-center">
                    <button
                      onClick={() => router.push('/my-query')}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all {savedQueries.length} saved queries →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect } from "react";
import SearchInput from "@/react-app/components/SearchInput";
import SearchResults from "@/react-app/components/SearchResults";
import EmptyState from "@/react-app/components/EmptyState";
import { useSearch } from "@/react-app/hooks/useSearch";

export default function Home() {
  const { isLoading, error, currentSearch, performSearch, clearSearch } = useSearch();

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleNewSearch = () => {
    clearSearch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SearchMind
            </h1>
          </div>
          
          {currentSearch && (
            <button
              onClick={handleNewSearch}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              New Search
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="mb-12">
          <SearchInput
            onSearch={performSearch}
            isLoading={isLoading}
            placeholder={currentSearch ? "Ask another question..." : "Ask anything..."}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 text-sm font-medium">!</span>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">Search Failed</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {currentSearch ? (
            <SearchResults result={currentSearch} />
          ) : !isLoading ? (
            <EmptyState onExampleSearch={performSearch} />
          ) : null}

          {/* Loading State */}
          {isLoading && (
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto animate-spin opacity-20"></div>
                  <h3 className="text-lg font-medium text-gray-700">
                    Searching the web and analyzing results...
                  </h3>
                  <p className="text-gray-500">
                    This may take a few moments while I gather comprehensive information.
                  </p>
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 text-sm">
          <p>Powered by Google Gemini and Serper API • Built with React and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

import { Brain, Search, Zap } from "lucide-react";

interface EmptyStateProps {
  onExampleSearch?: (query: string) => void;
}

const exampleQueries = [
  "What are the latest developments in quantum computing?",
  "How does climate change affect ocean temperatures?",
  "What are the benefits of meditation for mental health?",
  "Explain the basics of machine learning algorithms",
];

export default function EmptyState({ onExampleSearch }: EmptyStateProps) {
  return (
    <div className="w-full max-w-4xl mx-auto text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <Brain className="w-20 h-20 mx-auto text-blue-500 mb-4" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SearchMind
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your AI-powered research copilot. Ask any question and get comprehensive answers with citations and voice responses.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl">
          <Search className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Web Search</h3>
          <p className="text-sm text-gray-600">
            Real-time search across the web with intelligent result filtering
          </p>
        </div>
        
        <div className="p-6 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl">
          <Brain className="w-8 h-8 text-purple-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">AI Summaries</h3>
          <p className="text-sm text-gray-600">
            Comprehensive summaries powered by advanced language models
          </p>
        </div>
        
        <div className="p-6 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-2xl">
          <Zap className="w-8 h-8 text-orange-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-2">Smart Citations</h3>
          <p className="text-sm text-gray-600">
            Interactive citations with voice responses and source verification
          </p>
        </div>
      </div>

      {/* Example Queries */}
      {onExampleSearch && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Try these examples:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {exampleQueries.map((query, index) => (
              <button
                key={index}
                onClick={() => onExampleSearch(query)}
                className="p-4 text-left bg-white/40 border border-gray-200/50 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-200 group"
              >
                <p className="text-gray-700 group-hover:text-gray-800 transition-colors">
                  "{query}"
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

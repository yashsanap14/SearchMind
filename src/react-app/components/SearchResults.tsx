import { useState } from "react";
import { Volume2, VolumeX, ExternalLink, Quote } from "lucide-react";
import { SearchResponse } from "@/shared/types";
import { useTextToSpeech } from "@/react-app/hooks/useTextToSpeech";
import CitationModal from "./CitationModal";

interface SearchResultsProps {
  result: SearchResponse;
}

export default function SearchResults({ result }: SearchResultsProps) {
  const { isPlaying, isSupported, toggle } = useTextToSpeech();
  const [selectedCitation, setSelectedCitation] = useState<number | null>(null);

  const handleCitationClick = (citationId: number) => {
    setSelectedCitation(citationId);
  };

  const handleCloseCitation = () => {
    setSelectedCitation(null);
  };

  const citation = selectedCitation ? result.citations.find(c => c.id === selectedCitation) : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Query Display */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {result.query}
        </h2>
      </div>

      {/* Summary Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Quote className="w-5 h-5 text-blue-500" />
              AI Summary
            </h3>
            {isSupported && (
              <button
                onClick={() => toggle(result.summary)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                {isPlaying ? "Stop" : "Listen"}
              </button>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {result.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Citations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-blue-500" />
          Sources ({result.citations.length})
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {result.citations.map((citation) => (
            <div
              key={citation.id}
              className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => handleCitationClick(citation.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-medium rounded-full flex-shrink-0">
                  {citation.position}
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h4 className="font-medium text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {citation.title}
              </h4>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {citation.snippet}
              </p>
              
              <p className="text-xs text-gray-400 truncate">
                {new URL(citation.url).hostname}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Citation Modal */}
      {citation && (
        <CitationModal
          citation={citation}
          onClose={handleCloseCitation}
        />
      )}
    </div>
  );
}

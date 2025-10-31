import { useState, FormEvent, useEffect } from "react";
import { Search, Loader2, Mic, Square } from "lucide-react";
import { useSpeechToText } from "@/react-app/hooks/useSpeechToText";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export default function SearchInput({ onSearch, isLoading, placeholder = "Ask anything..." }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const {
    isSupported: sttSupported,
    isListening,
    transcript,
    toggle: toggleListening,
  } = useSpeechToText({ lang: "en-US", interimResults: true, continuous: false });

  useEffect(() => {
    if (transcript) {
      setQuery(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center px-6 py-4">
            <Search className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1 bg-transparent text-lg placeholder-gray-400 focus:outline-none disabled:opacity-50"
            />
            {sttSupported && (
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                className={`ml-3 p-2 rounded-lg transition-colors ${
                  isListening
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

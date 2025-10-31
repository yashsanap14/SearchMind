import { X, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Citation } from "@/shared/types";

interface CitationModalProps {
  citation: Citation;
  onClose: () => void;
}

export default function CitationModal({ citation, onClose }: CitationModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(citation.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white text-sm font-medium rounded-full">
              {citation.position}
            </span>
            <h2 className="text-lg font-semibold text-gray-800">Citation Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Title
              </label>
              <h3 className="text-xl font-semibold text-gray-800 leading-relaxed">
                {citation.title}
              </h3>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Source URL
              </label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="flex-1 text-blue-600 truncate font-mono text-sm">
                  {citation.url}
                </span>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Snippet */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Content Preview
              </label>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {citation.snippet}
                </p>
              </div>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Domain
              </label>
              <p className="text-gray-600">
                {new URL(citation.url).hostname}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Close
          </button>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Source
          </a>
        </div>
      </div>
    </div>
  );
}

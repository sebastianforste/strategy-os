"use client";

import { ThumbsUp, MessageCircle, Repeat2, Send, MoreHorizontal, Globe } from "lucide-react";

interface LinkedInPreviewProps {
  content: string;
  authorName?: string;
  authorTitle?: string;
  authorImage?: string;
}

export default function LinkedInPreview({
  content,
  authorName = "Sebastian Forster",
  authorTitle = "Founder & CEO | Helping leaders communicate strategy",
}: LinkedInPreviewProps) {
  // Process content for LinkedIn-style formatting
  const formatContent = (text: string) => {
    // Truncate with "...see more" if too long
    const lines = text.split("\n");
    const displayLines = lines.slice(0, 5);
    const isTruncated = lines.length > 5;
    
    return (
      <>
        {displayLines.map((line, i) => (
          <p key={i} className={`${line.trim() === "" ? "h-4" : ""}`}>
            {line || "\u00A0"}
          </p>
        ))}
        {isTruncated && (
          <button className="text-neutral-500 hover:text-blue-600 hover:underline text-sm font-medium">
            ...see more
          </button>
        )}
      </>
    );
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Author Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {authorName.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm text-neutral-900 hover:text-blue-600 hover:underline cursor-pointer">
                {authorName}
              </h4>
              <p className="text-xs text-neutral-500 line-clamp-1">{authorTitle}</p>
              <div className="flex items-center gap-1 text-xs text-neutral-500 mt-0.5">
                <span>1h</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
            <button className="p-1 hover:bg-neutral-100 rounded-full">
              <MoreHorizontal className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 text-sm text-neutral-900 leading-relaxed whitespace-pre-line">
        {formatContent(content)}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">❤️</div>
          </div>
          <span className="ml-1">124</span>
        </div>
        <div className="flex items-center gap-3">
          <span>12 comments</span>
          <span>3 reposts</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-2 py-1 flex items-center justify-around border-t border-neutral-100">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-neutral-100 rounded-lg text-neutral-600 text-sm font-medium">
          <ThumbsUp className="w-5 h-5" />
          <span>Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-neutral-100 rounded-lg text-neutral-600 text-sm font-medium">
          <MessageCircle className="w-5 h-5" />
          <span>Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-neutral-100 rounded-lg text-neutral-600 text-sm font-medium">
          <Repeat2 className="w-5 h-5" />
          <span>Repost</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-neutral-100 rounded-lg text-neutral-600 text-sm font-medium">
          <Send className="w-5 h-5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}

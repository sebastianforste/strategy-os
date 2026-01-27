import { MoreHorizontal, ThumbsUp, MessageSquare, Share2, Send, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface LinkedInPreviewProps {
  content: string;
  authorName?: string;
  authorHeadline?: string;
  authorImage?: string;
}

export default function LinkedInPreview({
  content,
  authorName = "StrategyOS User",
  authorHeadline = "Strategic Thinker | Builder",
  authorImage
}: LinkedInPreviewProps) {
  return (
    <div className="bg-white text-black rounded-lg border border-gray-200 overflow-hidden font-sans text-[14px] leading-[1.4] shadow-sm max-w-[555px] w-full mx-auto">
      {/* Header */}
      <div className="p-3 pb-0 flex gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {authorImage ? (
                <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                    {authorName.charAt(0)}
                </div>
            )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[14px] text-gray-900 truncate hover:text-blue-600 cursor-pointer hover:underline decoration-blue-600 decoration-1 underline-offset-2">
                {authorName}
              </h3>
              <p className="text-[12px] text-gray-500 truncate">{authorHeadline}</p>
              <div className="flex items-center gap-1 text-[12px] text-gray-500">
                <span>1h</span>
                <span>•</span>
                <Globe className="w-3 h-3 text-gray-500" />
              </div>
            </div>
            <button className="text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2 text-[14px] text-gray-900 whitespace-pre-wrap break-words">
        {/* Simple ReactMarkdown rendering with basic styling override for LI look */}
        <ReactMarkdown 
            components={{
                p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                a: ({children}) => <span className="text-blue-600 font-semibold cursor-pointer hover:underline">{children}</span>,
                strong: ({children}) => <span className="font-semibold">{children}</span>,
                ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
            }}
        >
            {content || "Generating your strategy..."}
        </ReactMarkdown>
      </div>

      {/* Stats/Social Proof (Mocked) */}
      <div className="px-3 py-1 border-b border-gray-100">
          <div className="flex items-center gap-1 text-[12px] text-gray-500">
             <div className="flex -space-x-1">
                 <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center z-20 text-[6px]">👍</div>
                 <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center z-10 text-[6px]">❤️</div>
                 <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center text-[6px]">💡</div>
             </div>
             <span className="hover:text-blue-600 hover:underline cursor-pointer">842</span>
             <span className="mx-1">•</span>
             <span className="hover:text-blue-600 hover:underline cursor-pointer">124 comments</span>
          </div>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex items-center justify-between">
         <ActionBtn icon={ThumbsUp} label="Like" />
         <ActionBtn icon={MessageSquare} label="Comment" />
         <ActionBtn icon={Share2} label="Repost" />
         <ActionBtn icon={Send} label="Send" />
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <button className="flex items-center gap-1.5 px-3 py-3 rounded hover:bg-gray-100 transition-colors flex-1 justify-center group">
            <Icon className="w-5 h-5 text-gray-600 group-hover:text-gray-900 fill-transparent" strokeWidth={1.5} />
            <span className="text-[14px] font-semibold text-gray-600 group-hover:text-gray-900">{label}</span>
        </button>
    )
}

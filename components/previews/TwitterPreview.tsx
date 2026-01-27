import { MoreHorizontal, MessageCircle, Repeat2, Heart, BarChart2, Share, BadgeCheck, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TwitterPreviewProps {
  content: string;
  authorName?: string;
  authorHandle?: string;
  authorImage?: string;
}

export default function TwitterPreview({
  content,
  authorName = "StrategyOS",
  authorHandle = "@strategy_os",
  authorImage
}: TwitterPreviewProps) {
  return (
    <div className="bg-black text-white rounded-xl border border-neutral-800 overflow-hidden font-sans text-[15px] leading-normal shadow-sm max-w-[555px] w-full mx-auto">
      <div className="p-3">
        <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden">
                    {authorImage ? (
                        <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold text-lg">
                            {authorName.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 min-w-0">
                 {/* Header Row */}
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 truncate text-[15px]">
                        <span className="font-bold text-white truncate flex items-center gap-1">
                            {authorName}
                            <BadgeCheck className="w-4 h-4 text-blue-400 fill-current" />
                        </span>
                        <span className="text-neutral-500 truncate">{authorHandle}</span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-neutral-500">1h</span>
                    </div>
                    <button className="text-neutral-500 hover:text-blue-400 hover:bg-blue-400/10 p-1 rounded-full transition-colors -mr-2">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                 </div>

                 {/* Post Text */}
                 <div className="mt-0.5 text-[15px] text-white whitespace-pre-wrap break-words">
                    <ReactMarkdown
                         components={{
                            p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                            a: ({children}) => <span className="text-blue-400 hover:underline cursor-pointer">{children}</span>,
                            strong: ({children}) => <span className="font-bold">{children}</span>,
                            ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                        }}
                    >
                        {content || "Generating thread..."}
                    </ReactMarkdown>
                 </div>

                 {/* Action Bar */}
                 <div className="flex justify-between items-center mt-3 text-neutral-500 max-w-[425px]">
                    <ActionBtn icon={MessageCircle} count="24" color="blue" />
                    <ActionBtn icon={Repeat2} count="12" color="green" />
                    <ActionBtn icon={Heart} count="148" color="pink" />
                    <ActionBtn icon={BarChart2} count="2.1K" color="blue" />
                    <div className="flex items-center group">
                        <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                            <Share className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, count, color }: { icon: any, count: string, color: "blue" | "green" | "pink" }) {
    const colorClasses = {
        blue: "group-hover:text-blue-400 group-hover:bg-blue-400/10",
        green: "group-hover:text-green-500 group-hover:bg-green-500/10",
        pink: "group-hover:text-pink-600 group-hover:bg-pink-600/10"
    };

    const textClasses = {
        blue: "group-hover:text-blue-400",
        green: "group-hover:text-green-500",
        pink: "group-hover:text-pink-600"
    };

    return (
        <div className="flex items-center group cursor-pointer -ml-2">
            <div className={`p-2 rounded-full transition-colors ${colorClasses[color]}`}>
                <Icon className="w-4 h-4 transition-colors" />
            </div>
            <span className={`text-[13px] transition-colors ${textClasses[color]}`}>{count}</span>
        </div>
    )
}

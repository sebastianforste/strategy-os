"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { getScheduledPosts, ScheduledPost, deleteScheduledPost } from "../utils/schedule-service";
import { motion, AnimatePresence } from "framer-motion";

export default function ScheduleCalendar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      setScheduled(getScheduledPosts());
    }
  }, [isOpen]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDelete = (id: string) => {
    deleteScheduledPost(id);
    setScheduled(scheduled.filter(p => p.id !== id));
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const calendarDays = [];

    // Empty slots for start of month
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-transparent border-t border-l border-neutral-900" />);
    }

    // Actual days
    for (let day = 1; day <= days; day++) {
        const date = new Date(year, month, day);
        const dayPosts = scheduled.filter(p => {
            const d = new Date(p.scheduledAt);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });

        const isToday = new Date().toDateString() === date.toDateString();

        calendarDays.push(
            <div key={day} className={`h-24 border-t border-l border-neutral-900 p-1 relative ${isToday ? 'bg-neutral-900/30' : ''}`}>
                <span className={`text-[10px] font-mono ${isToday ? 'text-white font-bold bg-neutral-800 px-1 rounded' : 'text-neutral-600'}`}>
                    {day}
                </span>
                <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto">
                    {dayPosts.map(post => (
                        <div key={post.id} className="group relative bg-blue-500/10 border border-blue-500/20 rounded p-1 text-[8px] text-blue-400 leading-tight">
                            <span className="block truncate">{post.assets.textPost.substring(0, 20)}...</span>
                            <div className="flex items-center gap-1 mt-0.5 opacity-60">
                                <Clock className="w-2 h-2" />
                                {new Date(post.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </div>
                            <button 
                                onClick={() => handleDelete(post.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-400"
                            >
                                <Trash2 className="w-2 h-2" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return calendarDays;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-[#050505] border border-neutral-800 rounded-xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                   <h2 className="text-white font-bold">Content Pipeline</h2>
                   <p className="text-neutral-500 text-xs">Visualize your upcoming strategy OS presence.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                    <button onClick={prevMonth} className="px-3 py-2 hover:bg-neutral-800 border-r border-neutral-800">
                        <ChevronLeft className="w-4 h-4 text-neutral-400" />
                    </button>
                    <span className="px-4 py-2 text-xs font-mono text-white min-w-[120px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </span>
                    <button onClick={nextMonth} className="px-3 py-2 hover:bg-neutral-800 border-l border-neutral-800">
                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>
                <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors">
                   <X className="w-6 h-6" />
                </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto bg-black/50">
            <div className="grid grid-cols-7 border-r border-b border-neutral-900">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="py-2 text-[10px] font-mono text-neutral-600 border-l border-neutral-900 text-center bg-neutral-900/50">
                        {day}
                    </div>
                ))}
                {renderCalendar()}
            </div>
          </div>
          
          <div className="p-4 border-t border-neutral-800 bg-neutral-900/20 text-center">
              <p className="text-[10px] text-neutral-600 font-mono italic">Currently visualizing local schedule. Integration with LinkedIn API for auto-posting coming soon.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

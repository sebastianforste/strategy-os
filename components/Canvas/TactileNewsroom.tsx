"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DraggableBlock } from './DraggableBlock';
import { CampaignRail } from './CampaignRail';
import { TrendStream } from './TrendStream';

export interface ContentBlock {
  id: string;
  content: string;
  type: 'TEXT' | 'ASSET' | 'TREND';
}

export function TactileNewsroom({ 
  initialBlocks, 
  onOrderChange 
}: { 
  initialBlocks: ContentBlock[], 
  onOrderChange: (blocks: ContentBlock[]) => void 
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // 1. Reordering Blocks
    if (active.id !== over.id && !over.id.toString().startsWith('day') && (active.data.current?.type !== 'TREND')) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      setBlocks(newBlocks);
      onOrderChange(newBlocks);
    }

    // 2. Trend Injection (Trend -> Block)
    if (active.data.current?.type === 'TREND' && !over.id.toString().startsWith('day')) {
      const blockId = over.id;
      const trend = active.data.current.trend;
      console.log(`Injecting trend ${trend.topic} into block ${blockId}`);
      // Trigger rewrite logic...
      setBlocks(prev => prev.map(b => b.id === blockId ? 
        { ...b, content: `[PIVOT: ${trend.topic}] ${b.content}` } : b
      ));
    }

    // 3. Campaign Orchestration (Block -> Day)
    if (over.id.toString().startsWith('day') && active.data.current?.type !== 'TREND') {
      const dayId = over.id;
      const blockContent = blocks.find(b => b.id === active.id)?.content;
      console.log(`Orchestrating block to ${dayId}`);
      // Trigger repurposing logic based on dayId
    }
    
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full w-full overflow-hidden">
        {/* Left: Trend Stream */}
        <TrendStream />

        {/* Center: Tactical Editor */}
        <div className="flex-1 overflow-y-auto border-x border-[var(--stitch-border,#24282D)] bg-[rgba(12,16,22,0.92)] p-8">
          <SortableContext 
            items={blocks.map(b => b.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="max-w-2xl mx-auto space-y-4">
              {blocks.map((block) => (
                <DraggableBlock key={block.id} block={block} />
              ))}
            </div>
          </SortableContext>
        </div>

        {/* Right: Campaign Rail */}
        <CampaignRail />

        {/* Drag Overlay for "Heavy" visual feedback */}
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId ? (
            <div className="rounded-xl border border-[var(--stitch-border,#24282D)] bg-[var(--stitch-surface,#16181D)] p-4 shadow-2xl opacity-80 cursor-grabbing">
              {blocks.find(b => b.id === activeId)?.content.substring(0, 50)}...
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

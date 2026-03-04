"use client";

import React, { useMemo, useState } from "react";
// Dnd-kit imports
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable, // <-- The correct hook for sortable lists
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Data types from PageRenderer
import { PortfolioPageData } from "./PageRenderer";

// --- PROPS DEFINITION (Confirmed from prior step) ---
export interface EditorTopBarProps {
  portfolioTitle: string;
  pages: PortfolioPageData[]; // Full page data
  currentPageIndex: number;
  totalPages: number;
  isEditor?: boolean;
  onSelectPage: (index: number) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  onCancel: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAdd: () => void;
  onDelete: () => void;
  onPrivacy: () => void;
  onDraft: () => void;
  onPublish: () => void;
  onChangeLayout: () => void;

  /** Update the *portfolio* title (not page title) */
  onTitleChange?: (newTitle: string) => void;
}

// --- DRAG-AND-DROP THUMBNAIL COMPONENT ---

interface SortableThumbnailProps extends PageThumbnailProps {
  id: string | number; 
  page: PortfolioPageData;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

const SortableThumbnail = ({ page, index, isSelected, onSelect, id }: SortableThumbnailProps) => {
  // Use the useSortable hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    // Apply transform and transition properties for smooth sorting animation
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1, // Bring dragged item to front
    // Ensure the entire item (image + text) is treated as a single sortable unit
    touchAction: 'none', // Critical for preventing browser pull-to-refresh on mobile
    cursor: 'grab',
  };

  // Defensive check: if page is invalid, render nothing
  if (!page) return null;

  return (
    // Wrap the button in a div to properly contain the transform and flex properties
    <div
      ref={setNodeRef}
      style={style}
      // Add 'flex-shrink-0' to keep items horizontal and prevent wrapping
      className={`flex-shrink-0 w-[120px] cursor-grab ${isDragging ? "opacity-50" : ""}`} 
    >
      <button
        type="button"
        // Attach listeners and attributes to the clickable element
        {...listeners}
        {...attributes}
        onClick={() => onSelect(index)}
        className={`
          group w-full h-[80px] rounded-lg overflow-hidden border-2 transition-all duration-150 relative block
          ${isSelected ? "border-white shadow-lg" : "border-neutral-700 hover:border-neutral-500"}
          ${page.mediaSrc ? "" : "bg-neutral-800 flex items-center justify-center"}
        `}
      >
        {page.mediaSrc ? (
          <img
            src={page.mediaSrc}
            alt={`Page ${index + 1} thumbnail`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-neutral-500">{index + 1}</span>
        )}
        
        {/* Page number overlay */}
        <div 
          className="absolute top-0 left-0 bg-black/60 text-white text-xs font-bold px-2 rounded-br-md"
        >
          {index + 1}
        </div>
      </button>
      
      {/* Title/Description below thumbnail */}
      <div className="text-center mt-1">
        <p className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-neutral-400'}`}>
          {page.title || `Untitled Page ${index + 1}`}
        </p>
      </div>
    </div>
  );
};

// Helper component for the visual thumbnail button (Non-sortable props)
interface PageThumbnailProps {
  page: PortfolioPageData;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

// --- MAIN COMPONENT ---
export default function EditorTopBar({
  portfolioTitle,
  pages,
  currentPageIndex,
  onSelectPage,
  onReorder,
  // ... other props
  onCancel,
  onUndo,
  onRedo,
  onAdd,
  onDelete,
  onPrivacy,
  onDraft,
  onPublish,
  onChangeLayout,
  onTitleChange,
}: EditorTopBarProps) {
  
  // Setup sensors for mouse and touch interactions
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  // Local state to manage the temporary order during a drag operation
  const [currentPages, setCurrentPages] = useState(pages);

  // dnd-kit requires a unique ID array for the SortableContext
  // This uses optional chaining (?.) and filtering to safely get IDs
  const pageIds = useMemo(
    () => currentPages.map((page) => page?.id).filter((id): id is number => !!id),
    [currentPages]
  );
  
  // Update local state when prop changes (e.g., after successful backend reorder/add/delete)
  React.useEffect(() => {
    // Only update local state if the prop pages has actually changed 
    // AND if the number of pages or the order has changed externally
    // *** FIX 1: Add optional chaining (p?.) here to prevent crash during state sync ***
    const currentPageIds = currentPages.map(p => p?.id).join(','); 
    const propPageIds = pages.map(p => p.id).join(',');
    
    if (currentPageIds !== propPageIds) {
        setCurrentPages(pages);
    }
  }, [pages, currentPages]); // Added currentPages to dependency array to properly track local changes

  // Handle the end of a drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      return;
    }

    // Find the current and new indices based on the full ID list
    // *** FIX 2: Add null check (p && p.id) in findIndex callbacks ***
    const oldIndex = currentPages.findIndex(p => p && p.id === active.id);
    const newIndex = currentPages.findIndex(p => p && p.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return; 

    // 1. Locally update the array *immediately* for responsive feel
    const newOrderedPages = arrayMove(currentPages, oldIndex, newIndex);
    setCurrentPages(newOrderedPages);
    
    // 2. Persist the change to the PortfolioEditorShell state (which calls the backend)
    void onReorder(oldIndex, newIndex);
    
    // 3. Navigate to the new page if it was dragged to a new position
    onSelectPage(newIndex);
  };


  return (
    <header className="w-full border-b border-neutral-800 bg-neutral-900/95 backdrop-blur px-6 py-6 flex flex-col gap-3">
      {/* Top row: Cancel / controls / Publish */}
      <div className="flex items-center gap-3 justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-neutral-300 hover:text-white"
        >
          Cancel
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onUndo}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
          >
            Add Page
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
          >
            Delete Page
          </button>
          <button
            type="button"
            onClick={onPrivacy}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={onDraft}
            className="rounded-full border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800"
          >
            Save Draft
          </button>
        </div>

        <button
          type="button"
          onClick={onPublish}
          className="rounded-full bg-white text-black px-4 py-1 text-sm font-semibold hover:bg-neutral-100"
        > 
          Publish
        </button>
      </div>

      {/* Second row: title + page nav + layout */}
      <div className="flex items-center gap-4 justify-between">
        <input
          className="flex-1 max-w-md bg-neutral-800/60 rounded-md px-3 py-2 text-sm text-neutral-100 outline-none border border-neutral-700 focus:border-neutral-300"
          value={portfolioTitle}
          onChange={(e) => onTitleChange?.(e.target.value)}
        />

        {/* --- DND-KIT IMPLEMENTATION AREA --- */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div 
            // Wrapper for horizontal scrolling
            className="flex items-center gap-3 ml-2 overflow-x-auto scrollbar-hide py-1"
            style={{ maxWidth: '600px' }}
          >
            <SortableContext
              items={pageIds} // Use the array of unique IDs
              strategy={horizontalListSortingStrategy}
            >
              {currentPages.filter((page): page is PortfolioPageData => !!page && !!page.id).map((page, idx) => (
                // *** FIX 3: Add conditional check here to skip rendering an invalid page ***
                page && page.id ? (
                    <SortableThumbnail
                      key={page.id} 
                      id={page.id} // Must pass the unique ID as the dnd-kit item ID
                      page={page}
                      index={idx}
                      isSelected={idx === currentPageIndex}
                      onSelect={onSelectPage}
                    />
                ) : null
              ))}
            </SortableContext>
          </div>
        </DndContext>
        {/* --- END DND-KIT IMPLEMENTATION AREA --- */}

        <button
          type="button"
          onClick={onChangeLayout}
          className="text-xs text-neutral-300 hover:text-white"
        >
          Change Layout
        </button>
      </div>
    </header>
  );
}
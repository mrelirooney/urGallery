
``` |

***

### B. Component Logic

| Action | Location | Code Block |
| :--- | :--- | :--- |
| **CHANGE** | **Inside `EditorTopBar` function** (Ensure all new props are destructured) | `...onTitleChange}: EditorTopBarProps) {` (Make sure `pages` and `onReorder` are included in the list of destructured props). |
| **DELETE** | **Inside `EditorTopBar` function** (The old page array) | **DELETE** this line: <br> `const pagesArray = Array.from({ length: totalPages || 1 }, (_, i) => i);` |
| **ADD** | **Inside `EditorTopBar` function** (Near other logic) | Add DND setup: <br>```tsx
  // DND setup
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  
  const currentPages = pages;
  // pageIds is used by SortableContext for tracking elements
  const pageIds = useMemo(() => currentPages.map((page) => page.id), [currentPages]);
  
  // DND drag end handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = currentPages.findIndex(page => page.id === active.id);
      const newIndex = currentPages.findIndex(page => page.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        await onReorder(oldIndex, newIndex);
      }
    }
  };
  // ^ ADD THIS DND LOGIC

``` |
| **REPLACE** | **The old Page Navigation** (`<div className="flex items-center gap-2 text-xs text-neutral-300">`) | **REPLACE** the entire page navigation block with the DND implementation: <br>```tsx
        {/* --- DND-KIT IMPLEMENTATION AREA (Page Navigation) --- */}
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
              {currentPages.map((page, idx) => (
                <SortableThumbnail
                  key={page.id} 
                  id={page.id} // Must pass the unique ID as the dnd-kit item ID
                  page={page}
                  index={idx}
                  isSelected={idx === currentPageIndex}
                  onSelect={onSelectPage}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
        {/* ^ NEW PAGE NAVIGATION/DND */}
``` |
| **ADD** | **After the DND block** (Near the bottom right corner) | Add the Add/Delete/Layout buttons: <br>```tsx
        <button
          type="button"
          onClick={onAdd}
          className="text-xs text-neutral-300 hover:text-white"
        >
          Add Page
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Delete Page
        </button>

        <button
          type="button"
          onClick={onChangeLayout}
          className="text-xs text-neutral-300 hover:text-white"
        >
          Change Layout
        </button>
        {/* ^ ADD THESE BUTTONS */}
``` |
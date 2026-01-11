# Frontend Integration Guide

## Backend API Changes - What You Need to Know

### New Layout Values
Replace these in your frontend `LayoutType`:
```typescript
// REMOVE these:
| "MediaTop_TextBottom"
| "MediaBottom_TextTop"

// ADD these:
| "TwoColumnMediaOnly"
| "TwoColumnMediaWithText"
```

### New Page Fields
Add these to your `PortfolioPageData` interface:

```typescript
export interface PortfolioPageData {
  // ... existing fields ...
  
  // Second column fields (for two-column layouts)
  mediaSrc2?: string | null;
  mediaShape2_2?: MediaShapeType;  // or name it mediaShape2
  title2?: string;
  description2?: string;
}
```

### API Response Format

When you fetch pages, you'll now receive:

```json
{
  "id": 1,
  "title": "First Column Title",
  "description": "First column description",
  "layout": "TwoColumnMediaWithText",
  "media_image": "/media/draft_portfolio_pages/image1.jpg",
  "media_shape": "1:1",
  "media_image_2": "/media/draft_portfolio_pages/image2.jpg",
  "media_shape_2": "16:9",
  "title_2": "Second Column Title",
  "description_2": "Second column description",
  "order": 0
}
```

### Uploading Second Column Media

Similar to how you upload `media_image`, you can now upload `media_image_2`:

```typescript
const formData = new FormData();
formData.append("media_image_2", file);

await fetch(`${API_BASE}/api/portfolios/${slug}/editor/pages/${pageId}/`, {
  method: "PATCH",
  credentials: "include",
  headers: {
    "X-CSRFToken": getCsrfToken(),
  },
  body: formData,
});
```

### Bulk Save Format

When saving all pages, include the new fields:

```typescript
const payload = {
  title: "Portfolio Title",
  privacy: "public",
  pages: [
    {
      id: 1,
      title: "Column 1 Title",
      description: "Column 1 description",
      layout: "TwoColumnMediaWithText",
      media_shape: "1:1",
      media_shape_2: "16:9",
      title_2: "Column 2 Title",
      description_2: "Column 2 description",
      order: 0
    }
  ]
};
```

### Layout Picker Modal Icons

Suggested icons for the new layouts:
- **TwoColumnMediaOnly**: `"▐▐"` or `"⫸"` or `"⬚⬚"`
- **TwoColumnMediaWithText**: `"⫸⫸"` or custom icon

### Rendering Logic

#### TwoColumnMediaOnly
```tsx
if (layoutType === "TwoColumnMediaOnly") {
  return (
    <div className="grid grid-cols-2 gap-6">
      <MediaSlot src={mediaSrc} shape={mediaShape} />
      <MediaSlot src={mediaSrc2} shape={mediaShape2_2} />
    </div>
  );
}
```

#### TwoColumnMediaWithText
```tsx
if (layoutType === "TwoColumnMediaWithText") {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <MediaSlot src={mediaSrc} shape={mediaShape} />
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div>
        <MediaSlot src={mediaSrc2} shape={mediaShape2_2} />
        <h3>{title2}</h3>
        <p>{description2}</p>
      </div>
    </div>
  );
}
```

## Files You Need to Update

### 1. Type Definitions
- `frontend/src/components/portfolio/editor/PageRenderer.tsx` - Update `LayoutType`
- `frontend/src/components/portfolio/PageRenderer.tsx` - Update `LayoutType`

### 2. Layout Picker
- `frontend/src/components/portfolio/editor/LayoutPickerModal.tsx` - Update `LAYOUT_OPTIONS`

### 3. Data Interfaces
- Add new fields to `PortfolioPageData` interface in both PageRenderer files

### 4. Rendering Components
- `frontend/src/components/portfolio/editor/PageRenderer.tsx` - Add rendering + editing for new layouts
- `frontend/src/components/portfolio/PageRenderer.tsx` - Add rendering for new layouts (public view)

### 5. Editor Shell
- `frontend/src/components/portfolio/editor/PortfolioEditorShell.tsx`
  - Add `handleChangeImage2` (similar to `handleChangeImage`)
  - Add `handleChangeTitle2` and `handleChangeDescription2`
  - Pass new handlers to PageRenderer

### 6. State Management
- Update state initialization to include new fields
- Update data mapping when loading from API

## Testing Your Frontend

1. **Layout Picker**: Verify only 6 options show (no Top/Bottom)
2. **Create Page**: Create page with `TwoColumnMediaOnly`
3. **Upload Media**: Upload images to both columns
4. **Edit Text**: Edit titles and descriptions for both columns
5. **Save Draft**: Verify new fields are saved
6. **Publish**: Verify new fields appear on public view
7. **Responsive**: Test on mobile (should stack columns)

## Migration Note

Any existing pages with `MediaTop_TextBottom` or `MediaBottom_TextTop` layouts have been automatically migrated to `MediaLeft_TextRight` in the database. Your frontend should handle this gracefully - if you encounter these old layout values, you can either:
1. Treat them as `MediaLeft_TextRight`
2. Show a fallback layout
3. Ignore them (they shouldn't appear in new data)





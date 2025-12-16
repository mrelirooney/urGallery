# Backend Layout Update Summary

## Completed Changes

All backend changes for the two-column layout feature have been implemented.

### 1. Models Updated (`backend/portfolios/models.py`)

#### PortfolioPageLayout Choices
- ✅ Added `TWO_COLUMN_MEDIA_ONLY = "TwoColumnMediaOnly"`
- ✅ Added `TWO_COLUMN_MEDIA_WITH_TEXT = "TwoColumnMediaWithText"`
- ✅ Moved `MEDIA_TOP_TEXT_BOTTOM` and `MEDIA_BOTTOM_TEXT_TOP` to legacy section (kept for backward compatibility)

#### New Fields Added to `Page` Model
- ✅ `media_image_2` - ImageField for second column media
- ✅ `media_shape_2` - CharField for second column media aspect ratio
- ✅ `title_2` - CharField for second column title
- ✅ `description_2` - TextField for second column description

#### New Fields Added to `DraftPage` Model
- ✅ Same four fields as Page model

### 2. Migration Created (`backend/portfolios/migrations/0013_add_two_column_layouts.py`)

- ✅ Adds all new fields to both `Page` and `DraftPage` tables
- ✅ Updates layout field choices for both models
- ✅ **Data Migration**: Automatically converts existing `MediaTop_TextBottom` and `MediaBottom_TextTop` pages to `MediaLeft_TextRight`
- ✅ Reversible migration (no-op on reverse since old layouts can't be restored)

### 3. Serializers Updated (`backend/portfolios/serializers.py`)

#### Updated Serializers
- ✅ `PageSummarySerializer` - includes all 4 new fields
- ✅ `PageEditorSerializer` - includes all 4 new fields + extra_kwargs for media_image_2
- ✅ `PageEditorInputSerializer` - accepts all 4 new fields from frontend
- ✅ `PortfolioEditorSaveSerializer.update()` - handles new fields in create/update logic
- ✅ `PublicPageSummarySerializer` - includes all 4 new fields
- ✅ `PublicPageSerializer` - includes all 4 new fields

### 4. Editor Views Updated (`backend/portfolios/editor_views.py`)

- ✅ `_get_or_create_draft()` - copies new fields when creating draft from live portfolio
- ✅ `publish_portfolio()` - copies new fields when publishing draft to live portfolio

## Next Steps - Run Migration

Before testing, you need to run the migration:

```bash
cd backend
python manage.py migrate portfolios
```

This will:
1. Add the new database columns
2. Update the layout choices
3. Automatically migrate any existing Top/Bottom layout pages to MediaLeft_TextRight

## API Changes

The following API endpoints now return/accept the new fields:

### Editor Endpoints
- `GET /api/portfolios/{slug}/editor/` - Returns pages with new fields
- `PATCH /api/portfolios/{slug}/editor/` - Accepts new fields in bulk save
- `PATCH /api/portfolios/{slug}/editor/pages/{page_id}/` - Accepts new fields for individual page updates

### Public Endpoints
- `GET /api/artists/{slug}/` - Returns portfolios with pages including new fields
- `GET /api/portfolios/{slug}/` - Returns portfolio pages with new fields

## New Field Details

### Field Names and Types
```python
# Second column media
media_image_2: ImageField (nullable)
media_shape_2: CharField (choices: "1:1", "9:16", "16:9", "4:5", "5:4")

# Second column text (for TwoColumnMediaWithText layout)
title_2: CharField (max 255, blank allowed)
description_2: TextField (blank allowed)
```

### When These Fields Are Used
- **TwoColumnMediaOnly**: Uses `media_image_2` and `media_shape_2` only
- **TwoColumnMediaWithText**: Uses all 4 new fields
- **Other layouts**: New fields are ignored but can be stored

## Testing Checklist

- [ ] Run migration successfully
- [ ] Create new page with TwoColumnMediaOnly layout
- [ ] Create new page with TwoColumnMediaWithText layout
- [ ] Upload media to second column
- [ ] Edit title_2 and description_2
- [ ] Verify existing pages still work
- [ ] Verify old Top/Bottom pages were migrated to MediaLeft_TextRight
- [ ] Test publish workflow (draft → live)
- [ ] Test API responses include new fields

## Backward Compatibility

- ✅ Old layout values (`MediaTop_TextBottom`, `MediaBottom_TextTop`) are still valid in the database
- ✅ Existing pages with these layouts were automatically migrated to `MediaLeft_TextRight`
- ✅ Frontend should hide these options but can still render them if needed
- ✅ All new fields are optional (blank=True, null=True where applicable)



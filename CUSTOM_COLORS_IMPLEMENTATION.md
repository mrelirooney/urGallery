# Custom Colors Implementation Guide

This document explains how custom colors are applied throughout the application using CSS variables and inline styles.

## Overview

Custom colors are set on the `<html>` element as CSS custom properties when viewing an artist's page. Components detect these variables and apply them, falling back to defaults when not present (e.g., on the home page).

## How It Works

### 1. Setting CSS Variables (Artist Page)

**File:** `frontend/src/components/artist/ColorThemeSetter.tsx`

```tsx
useEffect(() => {
  const htmlElement = document.documentElement;
  htmlElement.style.setProperty('--artist-background', colors.background);
  htmlElement.style.setProperty('--artist-foreground', colors.foreground);
  htmlElement.style.setProperty('--artist-text', colors.text);
  htmlElement.style.setProperty('--artist-accent', colors.accent);
  
  return () => {
    // Cleanup on unmount
    htmlElement.style.removeProperty('--artist-background');
    // ... remove others
  };
}, [colors]);
```

**Result:** CSS variables are available globally:
```css
html {
  --artist-background: #faf7f2;
  --artist-foreground: #11100e;
  --artist-text: #11100e;
  --artist-accent: #c96a4a;
}
```

---

## CSS/Tailwind Patterns Used

### Pattern 1: Inline Styles with Fallbacks

**When to use:** Direct color application where Tailwind classes aren't flexible enough.

**Example - Background Color:**
```tsx
<section 
  style={{ backgroundColor: customColors?.background || '#faf7f2' }}
  className="relative"
>
```

**Example - Text Color:**
```tsx
<h1 
  style={{ color: customColors?.text || '#11100e' }}
  className="text-2xl font-bold"
>
```

**Example - Multiple Colors:**
```tsx
<button
  style={{
    backgroundColor: customColors?.background || '#faf7f2',
    color: customColors?.foreground || '#11100e',
    borderColor: customColors?.accent || '#c96a4a',
  }}
  className="px-4 py-2 rounded transition-colors"
>
```

---

### Pattern 2: Reading CSS Variables in Client Components

**When to use:** Components that need to detect custom colors dynamically (Footer, Navbar).

**Example - Footer Component:**
```tsx
"use client";

const [customColors, setCustomColors] = useState(null);

useEffect(() => {
  const htmlElement = document.documentElement;
  const bgColor = htmlElement.style.getPropertyValue('--artist-background');
  const accentColor = htmlElement.style.getPropertyValue('--artist-accent');
  
  if (bgColor && accentColor) {
    setCustomColors({
      background: bgColor.trim(),
      accent: accentColor.trim(),
    });
  }
}, []);

// Then use in JSX:
<footer style={{ backgroundColor: customColors?.background || 'var(--background)' }}>
```

---

### Pattern 3: Conditional Tailwind + Inline Styles

**When to use:** Combining Tailwind utilities with dynamic colors.

**Example - Pagination Buttons:**
```tsx
<button
  className="w-10 h-10 text-sm rounded-sm border transition-colors"
  style={{
    backgroundColor: idx === currentIndex
      ? (customColors?.background || '#faf7f2')
      : (customColors?.accent || '#c96a4a'),
    color: idx === currentIndex
      ? (customColors?.foreground || '#11100e')
      : (customColors?.background || '#faf7f2'),
  }}
>
```

---

### Pattern 4: Hover States with Inline Styles

**When to use:** Dynamic hover colors that change based on custom colors.

**Example - Social Icons:**
```tsx
<button
  className="rounded-full border transition-colors"
  style={{
    backgroundColor: customColors?.background || '#faf7f2',
    borderColor: customColors?.foreground || '#11100e',
    color: customColors?.foreground || '#11100e',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = customColors?.accent || '#c96a4a';
    e.currentTarget.style.color = customColors?.background || '#faf7f2';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = customColors?.background || '#faf7f2';
    e.currentTarget.style.color = customColors?.foreground || '#11100e';
  }}
>
```

---

### Pattern 5: CSS Variables in Tailwind (Not Used Here)

**Why not:** Tailwind's `bg-[var(--custom)]` works, but we need fallbacks, so inline styles are more reliable.

**Alternative approach (if you prefer):**
```tsx
// In globals.css, you could define:
:root {
  --artist-background: #faf7f2; /* default */
}

// Then in components:
<div className="bg-[var(--artist-background,#faf7f2)]">
```

**But inline styles are clearer for dynamic values.**

---

## Component-Specific Examples

### Navbar
```tsx
// Background
<header 
  style={{ backgroundColor: customColors?.background || 'var(--background)' }}
  className="sticky top-0 z-50"
>

// Accent color for buttons
<button
  style={{ color: customColors?.accent || '#c96a4a' }}
  className="rounded-md transition"
>
```

### Footer
```tsx
// Background
<footer style={{ backgroundColor: footerBg }}>

// Links with hover
<Link
  style={{ color: footerText }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = footerAccent;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = footerText;
  }}
>
```

### Pagination
```tsx
// Active dot
<button
  style={{
    backgroundColor: idx === currentIndex 
      ? (customColors?.accent || '#c96a4a')
      : (customColors?.foreground || '#11100e'),
  }}
/>

// Arrow buttons
<button
  style={{ color: customColors?.background || '#faf7f2' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = customColors?.accent || '#c96a4a';
  }}
/>
```

### Social Icons
```tsx
<button
  style={{
    backgroundColor: customColors?.background || '#faf7f2',
    borderColor: customColors?.foreground || '#11100e',
    color: customColors?.foreground || '#11100e',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = customColors?.accent || '#c96a4a';
    e.currentTarget.style.color = customColors?.background || '#faf7f2';
  }}
/>
```

---

## Default Colors (Fallbacks)

When custom colors aren't set (e.g., home page), these defaults are used:

```tsx
const DEFAULT_COLORS = {
  background: '#faf7f2',  // Cream/white
  foreground: '#11100e',  // Dark brown/black
  text: '#11100e',        // Dark brown/black
  accent: '#c96a4a',      // Light brown/orange
};
```

---

## Best Practices

1. **Always provide fallbacks:** `customColors?.accent || '#c96a4a'`
2. **Use inline styles for dynamic colors:** More reliable than Tailwind arbitrary values
3. **Keep Tailwind for layout/spacing:** `className="px-4 py-2 rounded"`
4. **Use CSS variables for global components:** Footer, Navbar read from `--artist-*` variables
5. **Clean up on unmount:** Remove CSS variables when leaving artist page

---

## Testing

- ✅ Home page uses default colors
- ✅ Artist pages use custom colors
- ✅ Footer adapts to custom colors
- ✅ Navbar adapts to custom colors
- ✅ Pagination uses custom colors
- ✅ Social icons use custom colors
- ✅ Portfolio pages use custom colors

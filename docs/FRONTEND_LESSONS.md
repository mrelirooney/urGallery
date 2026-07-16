# urGallery Frontend Lessons

> Cheatsheet and lesson notes for React, Next.js, and frontend concepts. Assume no prior knowledge.

---

## Lesson 1: Components and JSX

- **Component** = function that returns JSX (what you see on screen)
- **JSX** = HTML-like syntax in JavaScript (`className` instead of `class`, `onClick` instead of `onclick`)
- **Props** = attributes you pass to a component (`variant`, `className`, `onSelect`, etc.)
- **Import/export** = how you reuse components across files

---

## Lesson 2: File-Based Routing

- **Folder structure = URL structure**
- **`page.tsx`** = the visible page for that route
- **`[slug]`** = dynamic segment (matches anything in that part of the URL)
- **`params`** = object Next.js passes with the values from dynamic segments (e.g. `params.slug` = `"johndoe"`)

| Folder | URL |
|--------|-----|
| `app/page.tsx` | `/` |
| `app/login/page.tsx` | `/login` |
| `app/[slug]/page.tsx` | `/johndoe`, `/janedoe`, etc. |
| `app/[slug]/[portfolioSlug]/page.tsx` | `/johndoe/my-portfolio` |

---

## Lesson 3: Layouts

- **Layout** = shared template that wraps pages (avoids repeating navbar, footer, etc.)
- **Page** = content for that route
- **Layout wraps page** = layout renders its own content + `{children}` (the page)

| Layout | Wraps |
|--------|-------|
| `app/layout.tsx` | Every route (navbar, footer, body) |
| `app/[slug]/layout.tsx` | Only artist routes (theme colors, styles) |

- **Layout** = structure and shared UI
- **Page** = content
- Layouts can have components; pages can have components

---

## Lesson 4: "use client" vs Server Components

- **Server** = runs on the server (no DOM, no user interaction)
- **Browser** = runs in the user's browser (DOM, clicks, etc.)
- **Server runs once per page load**; browser stays open and responds to user actions

### When you need "use client"
- `useState`, `useEffect`, `useRef`
- `onClick`, `onChange`, `onSubmit`
- `useRouter`, `usePathname`
- `window`, `document`, `localStorage`

### Three main hooks

| Hook | Pattern | Purpose |
|------|---------|---------|
| **useState** | `const [x, setX] = useState(...)` | Store values that change and trigger re-renders |
| **useEffect** | `useEffect(() => {...}, [deps])` | Run code after render (API calls, listeners) |
| **useRef** | `const xRef = useRef(...)` | Store values that don't trigger re-renders (DOM refs, timers) |

### Rule of thumb
- **useState** = value affects what the user sees
- **useRef** = value is for logic or DOM access, not display

### Communication
- Server and client both call the backend when they need data
- Backend only responds; it doesn't initiate requests

---

## Lesson 5: Component Tree and Data Flow

- **Component tree** = components nested inside each other
- **Props down** = parents pass data to children via props
- **Events up** = children call parent callbacks (e.g. `onSelect`)
- **`children`** = content between component tags; it's a prop

### Context
- **Context** = share data across components without passing props through every level
- Use when many components need the same data (e.g. profile pic in Navbar, ArtistHeader, CompactProfile)
- **Provider** wraps the tree and supplies the value; children read it

---

## Quick Reference

| Concept | Meaning |
|---------|---------|
| Component | Function that returns JSX |
| Props | Any attribute passed to a component |
| `children` | Content between tags; passed as a prop |
| `page.tsx` | Defines the visible page for a route |
| `layout.tsx` | Shared shell that wraps routes |
| `[slug]` | Dynamic URL segment |
| `params` | Values from dynamic segments |
| Server component | Runs on server (default) |
| Client component | Runs in browser (needs `"use client"`) |
| useState | State that triggers re-renders |
| useRef | Value that doesn't trigger re-renders |
| useEffect | Run code after render |
| Context | Share data without prop drilling |

---

## Lessons 6–9 (To Cover Later)

### Lesson 6: Custom Hooks
- `useSearch`, `useAuth` — reusable logic extracted into hooks
- When and how to create custom hooks
- Sharing logic across components without duplication

### Lesson 7: API Layer
- How data is fetched (server vs client)
- `fetch`, API routes, and backend communication
- Where API calls live in the codebase

### Lesson 8: Error Handling
- Loading states (spinners, skeletons)
- Error states (error boundaries, fallbacks)
- Handling failed requests and edge cases

### Lesson 9: Forms and Validation
- Form state and submission
- Client-side validation
- Form libraries (if used)

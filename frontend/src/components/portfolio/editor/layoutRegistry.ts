import type { LayoutType } from "./PageRenderer";

export type LayoutCategoryId = "media-and-text" | "text-only" | "media-only";

export type LayoutCategory = {
  id: LayoutCategoryId;
  label: string;
  layouts: LayoutType[];
  comingSoon?: boolean;
};

export const LAYOUT_CATEGORIES: LayoutCategory[] = [
  {
    id: "media-and-text",
    label: "Media and Text",
    layouts: [
      "layout-1",
      "layout-2",
      "layout-3",
      "layout-4",
      "layout-5",
      "layout-6",
      "layout-9",
      "layout-11",
      "layout-13",
    ],
  },
  {
    id: "text-only",
    label: "Text Only",
    layouts: ["layout-8", "layout-14", "layout-15"],
  },
  {
    id: "media-only",
    label: "Media Only",
    layouts: [],
    comingSoon: true,
  },
];

const ALL_LAYOUTS = LAYOUT_CATEGORIES.flatMap((c) => c.layouts);

export function getLayoutLabel(layout: LayoutType): string {
  const num = parseInt(layout.replace("layout-", ""), 10);
  return `Layout ${String(num).padStart(2, "0")}`;
}

export function getCategoryForLayout(layout: LayoutType): LayoutCategoryId | null {
  for (const category of LAYOUT_CATEGORIES) {
    if (category.layouts.includes(layout)) return category.id;
  }
  return null;
}

export function isSelectableLayout(layout: LayoutType): boolean {
  return ALL_LAYOUTS.includes(layout);
}

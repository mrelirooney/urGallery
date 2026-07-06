/** Universal title/description limits for all portfolio layouts (layout-9 standard). */



export const UNIVERSAL_LAYOUT_LIMITS = {

  title: 30,

  description: 250,

  details: 125,

  /** Title + description share the full width of the left column (lg+). */

  textMaxWidth: "100%",

} as const;



/** Layout-14 three-column headers – short labels above bordered/accent boxes. */
export const LAYOUT_14_LIMITS = {
  title: 16,
  description: 250,
} as const;

/** Layout-15 two-column headers – short labels above accent panels. */
export const LAYOUT_15_LIMITS = {
  title: 12,
  description: 425,
} as const;



/** Migrate legacy layout-4 body text stored in details (formerly description_body). */

export function resolveLayout4Description(

  description: string,

  details?: string,

): string {

  if (description.trim()) return description;

  return details?.trim() ?? "";

}



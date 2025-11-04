export const norm = (s: string) =>
  s.toLowerCase().replace(/[\W_]+/g, "").trim();

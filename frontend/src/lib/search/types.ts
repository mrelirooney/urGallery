export type SearchKind = "artist" | "project" | "tag";

export type SearchResult = {
  id: string;
  name: string;
  blurb?: string;
  slug?: string;
  username?: string;
  avatar_url?: string;
  title?: string | null;
  location?: string | null;
};


export type SearchQuery = {
  q: string;
  limit?: number;
};

export interface SearchAPI {
  search(q: SearchQuery, signal?: AbortSignal): Promise<SearchResult[]>;
}
export type SearchKind = "artist" | "project" | "tag";

export type SearchResult = {
  id: string;
  name: string;
  kind: SearchKind;
  avatar?: string;
  blurb?: string;
};

export type SearchQuery = {
  q: string;
  limit?: number;
};

export interface SearchAPI {
  search(q: SearchQuery, signal?: AbortSignal): Promise<SearchResult[]>;
}
import { mockSearch } from "./mock";
import { httpSearch } from "./http";
import type { SearchAPI } from "./types";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const searchApi: SearchAPI = (useMock ? (mockSearch as any) : httpSearch) as SearchAPI;

export const IS_MOCK_SEARCH = useMock;

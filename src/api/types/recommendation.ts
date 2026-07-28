export interface Reason {
  explanation: string;
  ispositive: boolean;
}

export interface Recommendation {
  crop_id: number;
  family_name: string;
  name: string;
  reasons: Reason[];
  ispositive: boolean;
}

export interface SearchResult {
  crop_id: number;
  family_name: string;
  name: string;
}

export interface RecommendationResponse {
  recommendations: Recommendation[];
  search_results?: SearchResult[];
}

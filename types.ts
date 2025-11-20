export enum AppState {
  LANDING = 'LANDING',
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

export interface AnalysisResult {
  text: string;
  searchQuery?: string;
}

export interface SearchResult {
  text: string;
  sources: {
    uri: string;
    title: string;
  }[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
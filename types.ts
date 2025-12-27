
export type StoryCategory = 'TRADITIONAL' | 'HISTORY' | 'ETHNIC' | 'WISDOM';
export type SourceType = 'REAL_ARCHIVE' | 'AI_INSPIRED';

export interface StoryPart {
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  category: StoryCategory;
  sourceType: SourceType;
  ethnicGroup?: string;
  region?: string;
  parts: StoryPart[];
  audioBase64?: string;
  sourceReference?: string;
  createdAt: number;
}

export type AppTab = 'HOME' | 'ETHNICITIES' | 'LEGENDS' | 'ABOUT';

export enum GenerationStatus {
  IDLE = 'IDLE',
  WRITING = 'WRITING',
  ILLUSTRATING = 'ILLUSTRATING',
  NARRATING = 'NARRATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

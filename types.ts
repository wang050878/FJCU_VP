
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface Message {
  role: Role;
  text: string;
  timestamp: Date;
  sources?: GroundingSource[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

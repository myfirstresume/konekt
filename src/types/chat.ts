export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedCommentId?: string; // If the message is related to a specific comment
}

export interface ChatContext {
  resumeText: string;
  comments: Array<{
    id: string;
    text: string;
    why: string;
    category: string;
    reference_text?: string;
  }>;
  userPlan: {
    followUpQuestionsLimit: number;
    followUpQuestionsUsed: number;
  };
}

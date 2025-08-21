interface Comment {
  id: string;
  text: string;
  why: string;
  reference_text: string;
  status: 'pending' | 'accepted' | 'rejected';
  position: { start: number; end: number };
  category: 'grammar' | 'content' | 'formatting' | 'suggestion' | 'clarity' | 'word-choice';
}

const assessResume = async (resume: string): Promise<Comment[]> => {
  try {
    const response = await fetch('/api/assess-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to assess resume');
    }

    const data = await response.json();
    return data.comments || [];
  } catch (error) {
    console.error('Error calling resume assessment API:', error);
    return [];
  }
};

export default assessResume;
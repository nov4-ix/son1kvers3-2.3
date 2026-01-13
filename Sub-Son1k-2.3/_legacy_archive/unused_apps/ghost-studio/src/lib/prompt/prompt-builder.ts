export interface PromptOptions {
  tags?: string[];
  instruments?: string[];
  style?: string;
  mood?: string;
}

export interface PromptData {
  prompt: string;
  style: string;
  tags: string[];
}

export function buildPrompt(options: PromptOptions): string {
  const parts: string[] = [];
  
  if (options.tags && options.tags.length > 0) {
    parts.push(`Tags: ${options.tags.join(', ')}`);
  }
  
  if (options.instruments && options.instruments.length > 0) {
    parts.push(`Instruments: ${options.instruments.join(', ')}`);
  }
  
  if (options.style) {
    parts.push(`Style: ${options.style}`);
  }
  
  if (options.mood) {
    parts.push(`Mood: ${options.mood}`);
  }
  
  return parts.join(' | ') || 'Generate a cover track';
}

export function buildPromptData(
  knobs?: any,
  analysis?: any,
  userDescription?: string
): PromptData {
  const options: PromptOptions = {
    tags: analysis?.tags || [],
    instruments: analysis?.instruments || [],
    style: knobs?.style || 'cover',
    mood: userDescription || analysis?.mood,
  };
  
  return {
    prompt: buildPrompt(options),
    style: options.style || 'cover',
    tags: options.tags || [],
  };
}


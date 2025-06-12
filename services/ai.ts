import OpenAI from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OpenAI API key is not configured');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// System prompts for different AI assistant roles
const SYSTEM_PROMPTS = {
  therapist: `You are an empathetic AI therapy assistant. Your role is to:
- Provide emotional support and guidance
- Help users identify and understand their feelings
- Suggest coping strategies and self-care techniques
- Maintain professional boundaries and ethical standards
- Encourage seeking professional help when needed
- Never diagnose or replace professional therapy`,
  
  coach: `You are a supportive wellness coach. Your role is to:
- Help users set and achieve personal goals
- Provide motivation and accountability
- Share evidence-based wellness tips
- Guide users through mindfulness exercises
- Track progress and celebrate achievements
- Maintain a positive and encouraging tone`,
  
  emergency: `You are a crisis support assistant. Your role is to:
- Assess the urgency of the situation
- Provide immediate emotional support
- Share emergency resources and hotlines
- Guide users to professional help
- Maintain calm and clear communication
- Never delay in directing to emergency services when needed`,
};

// Message history management
const HISTORY_KEY = 'ai_chat_history';
const MAX_HISTORY_LENGTH = 10;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  resources?: {
    title: string;
    url: string;
    description: string;
  }[];
}

// Save chat history
async function saveChatHistory(userId: string, messages: ChatMessage[]) {
  try {
    const key = `${HISTORY_KEY}_${userId}`;
    await AsyncStorage.setItem(key, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

// Load chat history
async function loadChatHistory(userId: string): Promise<ChatMessage[]> {
  try {
    const key = `${HISTORY_KEY}_${userId}`;
    const history = await AsyncStorage.getItem(key);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return [];
  }
}

// Clear chat history
async function clearChatHistory(userId: string) {
  try {
    const key = `${HISTORY_KEY}_${userId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

// Get AI response
export async function getAIResponse(
  userId: string,
  message: string,
  role: keyof typeof SYSTEM_PROMPTS = 'therapist'
): Promise<ChatResponse> {
  try {
    // Load chat history
    let history = await loadChatHistory(userId);

    // Add system message if history is empty
    if (history.length === 0) {
      history.push({
        role: 'system',
        content: SYSTEM_PROMPTS[role],
        timestamp: Date.now(),
      });
    }

    // Add user message
    history.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    // Keep only the last N messages
    if (history.length > MAX_HISTORY_LENGTH) {
      history = [
        history[0], // Keep system message
        ...history.slice(-MAX_HISTORY_LENGTH + 1),
      ];
    }

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: history.map(({ role, content }) => ({ role, content })),
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiMessage = completion.choices[0].message.content;

    // Add AI response to history
    history.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: Date.now(),
    });

    // Save updated history
    await saveChatHistory(userId, history);

    // Parse response for suggestions and resources
    const response: ChatResponse = {
      message: aiMessage,
    };

    // Extract suggestions if present (marked with "Suggestion:" prefix)
    const suggestions = aiMessage
      .split('\n')
      .filter(line => line.startsWith('Suggestion:'))
      .map(line => line.replace('Suggestion:', '').trim());

    if (suggestions.length > 0) {
      response.suggestions = suggestions;
    }

    // Extract resources if present (marked with "Resource:" prefix)
    const resourceLines = aiMessage
      .split('\n')
      .filter(line => line.startsWith('Resource:'));

    if (resourceLines.length > 0) {
      response.resources = resourceLines.map(line => {
        const [title, url, description] = line
          .replace('Resource:', '')
          .split('|')
          .map(s => s.trim());
        return { title, url, description };
      });
    }

    return response;
  } catch (error) {
    console.error('Failed to get AI response:', error);
    throw new Error('Failed to get AI response. Please try again later.');
  }
}

// Analyze mood from text
export async function analyzeMood(text: string): Promise<{
  mood: string;
  intensity: number;
  keywords: string[];
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Analyze the emotional content of the following text and return a JSON object with:
- mood: primary emotion (e.g., happy, sad, anxious, angry)
- intensity: number between 1-10
- keywords: array of relevant emotional keywords`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Failed to analyze mood:', error);
    throw new Error('Failed to analyze mood. Please try again later.');
  }
}

// Generate personalized recommendations
export async function generateRecommendations(
  userId: string,
  context: string
): Promise<{
  activities: string[];
  resources: string[];
  tips: string[];
}> {
  try {
    const history = await loadChatHistory(userId);
    const recentMessages = history
      .filter(msg => msg.role === 'user')
      .slice(-5)
      .map(msg => msg.content)
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Based on the user's recent messages and current context, generate personalized recommendations in JSON format with:
- activities: array of suggested activities
- resources: array of relevant resources
- tips: array of helpful tips`,
        },
        {
          role: 'user',
          content: `Recent messages:\n${recentMessages}\n\nCurrent context:\n${context}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    throw new Error('Failed to generate recommendations. Please try again later.');
  }
}

export {
  saveChatHistory,
  loadChatHistory,
  clearChatHistory,
}; 
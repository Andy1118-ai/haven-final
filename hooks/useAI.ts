import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  getAIResponse,
  analyzeMood,
  generateRecommendations,
  type ChatMessage,
  type ChatResponse,
} from '../services/ai';

type AIAssistantRole = 'therapist' | 'coach' | 'emergency';

interface AIState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  currentRole: AIAssistantRole;
  mood: {
    mood: string;
    intensity: number;
    keywords: string[];
  } | null;
  recommendations: {
    activities: string[];
    resources: string[];
    tips: string[];
  } | null;
}

export function useAI() {
  const { user } = useAuth();
  const [state, setState] = useState<AIState>({
    messages: [],
    isLoading: false,
    error: null,
    currentRole: 'therapist',
    mood: null,
    recommendations: null,
  });

  // Send message to AI assistant
  const sendMessage = useCallback(
    async (message: string) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await getAIResponse(
          user.id,
          message,
          state.currentRole
        );

        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'user',
              content: message,
              timestamp: Date.now(),
            },
            {
              role: 'assistant',
              content: response.message,
              timestamp: Date.now(),
            },
          ],
          isLoading: false,
        }));

        // Analyze mood from user's message
        const moodAnalysis = await analyzeMood(message);
        setState(prev => ({ ...prev, mood: moodAnalysis }));

        // Generate recommendations based on the conversation
        const recommendations = await generateRecommendations(
          user.id,
          message
        );
        setState(prev => ({ ...prev, recommendations }));

        return response;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to send message',
        }));
        throw error;
      }
    },
    [user, state.currentRole]
  );

  // Change AI assistant role
  const changeRole = useCallback((role: AIAssistantRole) => {
    setState(prev => ({
      ...prev,
      currentRole: role,
      messages: [], // Clear messages when changing roles
      mood: null,
      recommendations: null,
    }));
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      mood: null,
      recommendations: null,
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    changeRole,
    clearConversation,
  };
} 
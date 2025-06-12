import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  getArticles,
  getExercises,
  getMeditations,
  getUserProgress,
  markArticleComplete,
  markExerciseComplete,
  markMeditationComplete,
  searchContent,
  getRecommendedContent,
  type Article,
  type Exercise,
  type Meditation,
  type UserProgress,
} from '../services/content';

interface ContentState {
  articles: Article[];
  exercises: Exercise[];
  meditations: Meditation[];
  progress: UserProgress | null;
  recommended: {
    articles: Article[];
    exercises: Exercise[];
    meditations: Meditation[];
  };
  isLoading: boolean;
  error: string | null;
}

export function useContent() {
  const { user } = useAuth();
  const [state, setState] = useState<ContentState>({
    articles: [],
    exercises: [],
    meditations: [],
    progress: null,
    recommended: {
      articles: [],
      exercises: [],
      meditations: [],
    },
    isLoading: true,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const [articles, exercises, meditations, progress, recommended] = await Promise.all([
          getArticles(user.id),
          getExercises(user.id),
          getMeditations(user.id),
          getUserProgress(user.id),
          getRecommendedContent(user.id),
        ]);

        setState(prev => ({
          ...prev,
          articles,
          exercises,
          meditations,
          progress,
          recommended,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load content',
        }));
      }
    };

    loadData();
  }, [user]);

  // Search content
  const search = useCallback(
    async (query: string, type: 'articles' | 'exercises' | 'meditations' | 'all' = 'all') => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const results = await searchContent(user.id, query, type);

        setState(prev => ({
          ...prev,
          ...results,
          isLoading: false,
        }));

        return results;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to search content',
        }));
        throw error;
      }
    },
    [user]
  );

  // Mark content as complete
  const markComplete = useCallback(
    async (
      type: 'article' | 'exercise' | 'meditation',
      id: string
    ): Promise<void> => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        switch (type) {
          case 'article':
            await markArticleComplete(user.id, id);
            break;
          case 'exercise':
            await markExerciseComplete(user.id, id);
            break;
          case 'meditation':
            await markMeditationComplete(user.id, id);
            break;
        }

        // Refresh progress and recommendations
        const [progress, recommended] = await Promise.all([
          getUserProgress(user.id),
          getRecommendedContent(user.id),
        ]);

        setState(prev => ({
          ...prev,
          progress,
          recommended,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to mark content as complete',
        }));
        throw error;
      }
    },
    [user]
  );

  // Get content by category
  const getByCategory = useCallback(
    async (
      type: 'articles' | 'exercises' | 'meditations',
      category: string
    ) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        let content;
        switch (type) {
          case 'articles':
            content = await getArticles(user.id, category as Article['category']);
            setState(prev => ({ ...prev, articles: content }));
            break;
          case 'exercises':
            content = await getExercises(user.id, category as Exercise['category']);
            setState(prev => ({ ...prev, exercises: content }));
            break;
          case 'meditations':
            content = await getMeditations(user.id, category as Meditation['category']);
            setState(prev => ({ ...prev, meditations: content }));
            break;
        }

        setState(prev => ({ ...prev, isLoading: false }));
        return content;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to get content by category',
        }));
        throw error;
      }
    },
    [user]
  );

  // Refresh recommendations
  const refreshRecommendations = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const recommended = await getRecommendedContent(user.id);

      setState(prev => ({
        ...prev,
        recommended,
        isLoading: false,
      }));

      return recommended;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh recommendations',
      }));
      throw error;
    }
  }, [user]);

  return {
    ...state,
    search,
    markComplete,
    getByCategory,
    refreshRecommendations,
  };
} 
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  addMoodEntry,
  getMoodHistory,
  analyzeMoodFromText,
  createGoal,
  getGoals,
  updateGoal,
  updateGoalProgress,
  getMoodStats,
  type MoodEntry,
  type Goal,
  type MoodStats,
} from '../services/mood';

interface MoodState {
  history: MoodEntry[];
  goals: Goal[];
  stats: MoodStats | null;
  isLoading: boolean;
  error: string | null;
}

export function useMood() {
  const { user } = useAuth();
  const [state, setState] = useState<MoodState>({
    history: [],
    goals: [],
    stats: null,
    isLoading: true,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const [history, goals, stats] = await Promise.all([
          getMoodHistory(user.id),
          getGoals(user.id),
          getMoodStats(user.id),
        ]);

        setState(prev => ({
          ...prev,
          history,
          goals,
          stats,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load data',
        }));
      }
    };

    loadData();
  }, [user]);

  // Add mood entry
  const addMood = useCallback(
    async (entry: Omit<MoodEntry, 'id' | 'timestamp'>) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const newEntry = await addMoodEntry(user.id, entry);
        const stats = await getMoodStats(user.id);

        setState(prev => ({
          ...prev,
          history: [newEntry, ...prev.history],
          stats,
          isLoading: false,
        }));

        return newEntry;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to add mood entry',
        }));
        throw error;
      }
    },
    [user]
  );

  // Analyze mood from text
  const analyzeMood = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const analysis = await analyzeMoodFromText(text);

      setState(prev => ({ ...prev, isLoading: false }));
      return analysis;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze mood',
      }));
      throw error;
    }
  }, []);

  // Create goal
  const createNewGoal = useCallback(
    async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const newGoal = await createGoal(user.id, goal);

        setState(prev => ({
          ...prev,
          goals: [newGoal, ...prev.goals],
          isLoading: false,
        }));

        return newGoal;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to create goal',
        }));
        throw error;
      }
    },
    [user]
  );

  // Update goal
  const updateExistingGoal = useCallback(
    async (goalId: string, updates: Partial<Goal>) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const updatedGoal = await updateGoal(user.id, goalId, updates);

        setState(prev => ({
          ...prev,
          goals: prev.goals.map(goal =>
            goal.id === goalId ? updatedGoal : goal
          ),
          isLoading: false,
        }));

        return updatedGoal;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update goal',
        }));
        throw error;
      }
    },
    [user]
  );

  // Update goal progress
  const updateProgress = useCallback(
    async (goalId: string, progress: number) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const updatedGoal = await updateGoalProgress(user.id, goalId, progress);

        setState(prev => ({
          ...prev,
          goals: prev.goals.map(goal =>
            goal.id === goalId ? updatedGoal : goal
          ),
          isLoading: false,
        }));

        return updatedGoal;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error
            ? error.message
            : 'Failed to update goal progress',
        }));
        throw error;
      }
    },
    [user]
  );

  // Get goals by status
  const getGoalsByStatus = useCallback(
    (status: Goal['status']) => {
      return state.goals.filter(goal => goal.status === status);
    },
    [state.goals]
  );

  // Get mood history by date range
  const getMoodHistoryByDateRange = useCallback(
    async (startDate: number, endDate: number) => {
      if (!user) return [];

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const history = await getMoodHistory(user.id, startDate, endDate);

        setState(prev => ({ ...prev, isLoading: false }));
        return history;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error
            ? error.message
            : 'Failed to get mood history',
        }));
        throw error;
      }
    },
    [user]
  );

  return {
    ...state,
    addMood,
    analyzeMood,
    createNewGoal,
    updateExistingGoal,
    updateProgress,
    getGoalsByStatus,
    getMoodHistoryByDateRange,
  };
} 
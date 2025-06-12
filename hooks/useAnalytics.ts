import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useMood } from './useMood';
import { useContent } from './useContent';
import {
  getSessionStats,
  addSession,
  getUserInsights,
  updateUserInsights,
  type SessionStats,
  type UserInsights,
} from '../services/analytics';

interface AnalyticsState {
  sessionStats: SessionStats | null;
  insights: UserInsights | null;
  isLoading: boolean;
  error: string | null;
}

export function useAnalytics() {
  const { user } = useAuth();
  const { history: moodHistory } = useMood();
  const { progress: contentProgress } = useContent();
  const [state, setState] = useState<AnalyticsState>({
    sessionStats: null,
    insights: null,
    isLoading: true,
    error: null,
  });

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const [sessionStats, insights] = await Promise.all([
          getSessionStats(user.id),
          getUserInsights(user.id),
        ]);

        setState(prev => ({
          ...prev,
          sessionStats,
          insights,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load analytics',
        }));
      }
    };

    loadData();
  }, [user]);

  // Update insights when mood history or content progress changes
  useEffect(() => {
    if (!user || !state.sessionStats) return;

    const updateInsights = async () => {
      try {
        const insights = await updateUserInsights(
          user.id,
          moodHistory,
          contentProgress,
          state.sessionStats
        );

        setState(prev => ({
          ...prev,
          insights,
        }));
      } catch (error) {
        console.error('Error updating insights:', error);
      }
    };

    updateInsights();
  }, [user, moodHistory, contentProgress, state.sessionStats]);

  // Add new session
  const addNewSession = useCallback(
    async (session: {
      duration: number;
      type: string;
      notes: string;
    }) => {
      if (!user) return;

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        await addSession(user.id, session);
        const [sessionStats, insights] = await Promise.all([
          getSessionStats(user.id),
          getUserInsights(user.id),
        ]);

        setState(prev => ({
          ...prev,
          sessionStats,
          insights,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to add session',
        }));
        throw error;
      }
    },
    [user]
  );

  // Get weekly progress
  const getWeeklyProgress = useCallback(() => {
    if (!state.sessionStats) return null;

    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklySessions = state.sessionStats.sessionHistory.filter(
      session => session.date >= lastWeek
    );

    return {
      totalSessions: weeklySessions.length,
      totalDuration: weeklySessions.reduce((sum, session) => sum + session.duration, 0),
      averageDuration:
        weeklySessions.reduce((sum, session) => sum + session.duration, 0) /
        weeklySessions.length,
    };
  }, [state.sessionStats]);

  // Get mood trends
  const getMoodTrends = useCallback(() => {
    if (!state.insights) return null;

    return {
      averageMood: state.insights.moodTrends.averageMood,
      mostCommonMood: state.insights.moodTrends.mostCommonMood,
      weeklyTrend: state.insights.moodTrends.weeklyTrend,
    };
  }, [state.insights]);

  // Get content progress
  const getContentProgress = useCallback(() => {
    if (!state.insights) return null;

    return {
      articlesRead: state.insights.contentProgress.articlesRead,
      exercisesCompleted: state.insights.contentProgress.exercisesCompleted,
      meditationsCompleted: state.insights.contentProgress.meditationsCompleted,
      favoriteCategories: state.insights.contentProgress.favoriteCategories,
    };
  }, [state.insights]);

  // Get session insights
  const getSessionInsights = useCallback(() => {
    if (!state.insights) return null;

    return {
      totalHours: state.insights.sessionInsights.totalHours,
      averageSessionLength: state.insights.sessionInsights.averageSessionLength,
      consistencyScore: state.insights.sessionInsights.consistencyScore,
      preferredTimes: state.insights.sessionInsights.preferredTimes,
    };
  }, [state.insights]);

  // Get recommendations
  const getRecommendations = useCallback(() => {
    if (!state.insights) return null;

    return state.insights.recommendations;
  }, [state.insights]);

  return {
    ...state,
    addNewSession,
    getWeeklyProgress,
    getMoodTrends,
    getContentProgress,
    getSessionInsights,
    getRecommendations,
  };
} 
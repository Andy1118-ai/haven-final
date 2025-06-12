import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from './mood';
import { UserProgress } from './content';

const STORAGE_KEYS = {
  MOOD_HISTORY: '@haven/mood_history',
  CONTENT_PROGRESS: '@haven/content_progress',
  SESSION_STATS: '@haven/session_stats',
  USER_INSIGHTS: '@haven/user_insights',
};

export interface SessionStats {
  userId: string;
  totalSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  lastSessionDate: number;
  sessionHistory: {
    date: number;
    duration: number;
    type: string;
    notes: string;
  }[];
}

export interface UserInsights {
  userId: string;
  moodTrends: {
    averageMood: number;
    mostCommonMood: string;
    moodFrequency: Record<string, number>;
    weeklyTrend: {
      date: string;
      averageMood: number;
    }[];
  };
  contentProgress: {
    articlesRead: number;
    exercisesCompleted: number;
    meditationsCompleted: number;
    favoriteCategories: string[];
  };
  sessionInsights: {
    totalHours: number;
    averageSessionLength: number;
    consistencyScore: number;
    preferredTimes: string[];
  };
  recommendations: {
    suggestedContent: string[];
    suggestedExercises: string[];
    suggestedMeditations: string[];
  };
}

// Session Statistics
export async function getSessionStats(userId: string): Promise<SessionStats> {
  try {
    const statsJson = await AsyncStorage.getItem(`${STORAGE_KEYS.SESSION_STATS}:${userId}`);
    if (statsJson) {
      return JSON.parse(statsJson);
    }

    const newStats: SessionStats = {
      userId,
      totalSessions: 0,
      completedSessions: 0,
      averageSessionDuration: 0,
      lastSessionDate: Date.now(),
      sessionHistory: [],
    };

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.SESSION_STATS}:${userId}`,
      JSON.stringify(newStats)
    );

    return newStats;
  } catch (error) {
    console.error('Error getting session stats:', error);
    throw error;
  }
}

export async function addSession(
  userId: string,
  session: {
    duration: number;
    type: string;
    notes: string;
  }
): Promise<void> {
  try {
    const stats = await getSessionStats(userId);
    const newSession = {
      date: Date.now(),
      ...session,
    };

    stats.sessionHistory.push(newSession);
    stats.totalSessions += 1;
    stats.completedSessions += 1;
    stats.lastSessionDate = newSession.date;
    stats.averageSessionDuration =
      (stats.averageSessionDuration * (stats.completedSessions - 1) + session.duration) /
      stats.completedSessions;

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.SESSION_STATS}:${userId}`,
      JSON.stringify(stats)
    );
  } catch (error) {
    console.error('Error adding session:', error);
    throw error;
  }
}

// User Insights
export async function getUserInsights(userId: string): Promise<UserInsights> {
  try {
    const insightsJson = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_INSIGHTS}:${userId}`);
    if (insightsJson) {
      return JSON.parse(insightsJson);
    }

    const newInsights: UserInsights = {
      userId,
      moodTrends: {
        averageMood: 0,
        mostCommonMood: '',
        moodFrequency: {},
        weeklyTrend: [],
      },
      contentProgress: {
        articlesRead: 0,
        exercisesCompleted: 0,
        meditationsCompleted: 0,
        favoriteCategories: [],
      },
      sessionInsights: {
        totalHours: 0,
        averageSessionLength: 0,
        consistencyScore: 0,
        preferredTimes: [],
      },
      recommendations: {
        suggestedContent: [],
        suggestedExercises: [],
        suggestedMeditations: [],
      },
    };

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.USER_INSIGHTS}:${userId}`,
      JSON.stringify(newInsights)
    );

    return newInsights;
  } catch (error) {
    console.error('Error getting user insights:', error);
    throw error;
  }
}

export async function updateUserInsights(
  userId: string,
  moodHistory: MoodEntry[],
  contentProgress: UserProgress,
  sessionStats: SessionStats
): Promise<UserInsights> {
  try {
    const insights = await getUserInsights(userId);

    // Update mood trends
    const moodValues = moodHistory.map(entry => entry.intensity);
    insights.moodTrends.averageMood =
      moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length;

    const moodFrequency: Record<string, number> = {};
    moodHistory.forEach(entry => {
      moodFrequency[entry.mood] = (moodFrequency[entry.mood] || 0) + 1;
    });
    insights.moodTrends.moodFrequency = moodFrequency;
    insights.moodTrends.mostCommonMood = Object.entries(moodFrequency).reduce(
      (a, b) => (b[1] > a[1] ? b : a)
    )[0];

    // Calculate weekly trend
    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentMoods = moodHistory.filter(entry => entry.timestamp >= lastWeek);
    const dailyAverages = new Map<string, number[]>();

    recentMoods.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      if (!dailyAverages.has(date)) {
        dailyAverages.set(date, []);
      }
      dailyAverages.get(date)?.push(entry.intensity);
    });

    insights.moodTrends.weeklyTrend = Array.from(dailyAverages.entries()).map(([date, values]) => ({
      date,
      averageMood: values.reduce((sum, value) => sum + value, 0) / values.length,
    }));

    // Update content progress
    insights.contentProgress.articlesRead = contentProgress.completedArticles.length;
    insights.contentProgress.exercisesCompleted = contentProgress.completedExercises.length;
    insights.contentProgress.meditationsCompleted = contentProgress.completedMeditations.length;

    // Update session insights
    insights.sessionInsights.totalHours = sessionStats.averageSessionDuration * sessionStats.completedSessions / 60;
    insights.sessionInsights.averageSessionLength = sessionStats.averageSessionDuration;
    insights.sessionInsights.consistencyScore = calculateConsistencyScore(sessionStats);

    // Calculate preferred times
    const timeSlots = sessionStats.sessionHistory.map(session => {
      const date = new Date(session.date);
      return `${date.getHours()}:00`;
    });
    insights.sessionInsights.preferredTimes = getMostFrequent(timeSlots, 3);

    // Generate recommendations based on insights
    insights.recommendations = generateRecommendations(insights);

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.USER_INSIGHTS}:${userId}`,
      JSON.stringify(insights)
    );

    return insights;
  } catch (error) {
    console.error('Error updating user insights:', error);
    throw error;
  }
}

// Helper Functions
function calculateConsistencyScore(stats: SessionStats): number {
  if (stats.sessionHistory.length < 2) return 0;

  const sessions = stats.sessionHistory.sort((a, b) => a.date - b.date);
  const intervals: number[] = [];

  for (let i = 1; i < sessions.length; i++) {
    intervals.push(sessions[i].date - sessions[i - 1].date);
  }

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance =
    intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) /
    intervals.length;

  // Score from 0 to 100, higher is more consistent
  return Math.max(0, Math.min(100, 100 - (variance / (24 * 60 * 60 * 1000)) * 10));
}

function getMostFrequent<T>(arr: T[], n: number): T[] {
  const frequency = new Map<T, number>();
  arr.forEach(item => {
    frequency.set(item, (frequency.get(item) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([item]) => item);
}

function generateRecommendations(insights: UserInsights): UserInsights['recommendations'] {
  const recommendations: UserInsights['recommendations'] = {
    suggestedContent: [],
    suggestedExercises: [],
    suggestedMeditations: [],
  };

  // Suggest content based on mood trends
  if (insights.moodTrends.averageMood < 5) {
    recommendations.suggestedContent.push('Managing Low Mood');
    recommendations.suggestedExercises.push('Mood Boosting Exercise');
  }

  // Suggest content based on session consistency
  if (insights.sessionInsights.consistencyScore < 50) {
    recommendations.suggestedContent.push('Building Consistent Habits');
    recommendations.suggestedMeditations.push('Focus and Discipline');
  }

  // Suggest content based on preferred times
  if (insights.sessionInsights.preferredTimes.includes('20:00')) {
    recommendations.suggestedMeditations.push('Evening Relaxation');
  }

  return recommendations;
} 
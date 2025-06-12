import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeMood } from './ai';

// Storage keys
const MOOD_HISTORY_KEY = 'mood_history';
const GOALS_KEY = 'goals';
const MOOD_STATS_KEY = 'mood_stats';

// Types
export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: string;
  intensity: number;
  keywords: string[];
  note?: string;
  activities?: string[];
  triggers?: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'mental' | 'physical' | 'social' | 'professional';
  targetDate: number;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  milestones: {
    id: string;
    title: string;
    completed: boolean;
    dueDate: number;
  }[];
  createdAt: number;
  updatedAt: number;
}

export interface MoodStats {
  averageMood: number;
  mostFrequentMood: string;
  moodTrend: {
    date: string;
    average: number;
  }[];
  commonTriggers: string[];
  commonActivities: string[];
}

// Mood tracking functions
export async function addMoodEntry(
  userId: string,
  entry: Omit<MoodEntry, 'id' | 'timestamp'>
): Promise<MoodEntry> {
  try {
    const history = await getMoodHistory(userId);
    const newEntry: MoodEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    history.push(newEntry);
    await AsyncStorage.setItem(
      `${MOOD_HISTORY_KEY}_${userId}`,
      JSON.stringify(history)
    );

    // Update mood stats
    await updateMoodStats(userId);

    return newEntry;
  } catch (error) {
    console.error('Failed to add mood entry:', error);
    throw new Error('Failed to add mood entry');
  }
}

export async function getMoodHistory(
  userId: string,
  startDate?: number,
  endDate?: number
): Promise<MoodEntry[]> {
  try {
    const history = await AsyncStorage.getItem(`${MOOD_HISTORY_KEY}_${userId}`);
    let entries: MoodEntry[] = history ? JSON.parse(history) : [];

    if (startDate) {
      entries = entries.filter(entry => entry.timestamp >= startDate);
    }
    if (endDate) {
      entries = entries.filter(entry => entry.timestamp <= endDate);
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to get mood history:', error);
    return [];
  }
}

export async function analyzeMoodFromText(
  text: string
): Promise<Omit<MoodEntry, 'id' | 'timestamp'>> {
  try {
    const analysis = await analyzeMood(text);
    return {
      mood: analysis.mood,
      intensity: analysis.intensity,
      keywords: analysis.keywords,
    };
  } catch (error) {
    console.error('Failed to analyze mood from text:', error);
    throw new Error('Failed to analyze mood from text');
  }
}

// Goal management functions
export async function createGoal(
  userId: string,
  goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>
): Promise<Goal> {
  try {
    const goals = await getGoals(userId);
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    goals.push(newGoal);
    await AsyncStorage.setItem(`${GOALS_KEY}_${userId}`, JSON.stringify(goals));

    return newGoal;
  } catch (error) {
    console.error('Failed to create goal:', error);
    throw new Error('Failed to create goal');
  }
}

export async function getGoals(
  userId: string,
  status?: Goal['status']
): Promise<Goal[]> {
  try {
    const goals = await AsyncStorage.getItem(`${GOALS_KEY}_${userId}`);
    let entries: Goal[] = goals ? JSON.parse(goals) : [];

    if (status) {
      entries = entries.filter(goal => goal.status === status);
    }

    return entries.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Failed to get goals:', error);
    return [];
  }
}

export async function updateGoal(
  userId: string,
  goalId: string,
  updates: Partial<Goal>
): Promise<Goal> {
  try {
    const goals = await getGoals(userId);
    const index = goals.findIndex(goal => goal.id === goalId);

    if (index === -1) {
      throw new Error('Goal not found');
    }

    const updatedGoal = {
      ...goals[index],
      ...updates,
      updatedAt: Date.now(),
    };

    goals[index] = updatedGoal;
    await AsyncStorage.setItem(`${GOALS_KEY}_${userId}`, JSON.stringify(goals));

    return updatedGoal;
  } catch (error) {
    console.error('Failed to update goal:', error);
    throw new Error('Failed to update goal');
  }
}

export async function updateGoalProgress(
  userId: string,
  goalId: string,
  progress: number
): Promise<Goal> {
  try {
    const goal = await updateGoal(userId, goalId, { progress });

    // Check if all milestones are completed
    const allMilestonesCompleted = goal.milestones.every(
      milestone => milestone.completed
    );

    if (allMilestonesCompleted && goal.progress === 100) {
      await updateGoal(userId, goalId, { status: 'completed' });
    }

    return goal;
  } catch (error) {
    console.error('Failed to update goal progress:', error);
    throw new Error('Failed to update goal progress');
  }
}

// Mood statistics functions
async function updateMoodStats(userId: string): Promise<void> {
  try {
    const history = await getMoodHistory(userId);
    const stats: MoodStats = {
      averageMood: 0,
      mostFrequentMood: '',
      moodTrend: [],
      commonTriggers: [],
      commonActivities: [],
    };

    if (history.length === 0) {
      await AsyncStorage.setItem(
        `${MOOD_STATS_KEY}_${userId}`,
        JSON.stringify(stats)
      );
      return;
    }

    // Calculate average mood
    const totalIntensity = history.reduce(
      (sum, entry) => sum + entry.intensity,
      0
    );
    stats.averageMood = totalIntensity / history.length;

    // Find most frequent mood
    const moodCounts = history.reduce((counts, entry) => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    stats.mostFrequentMood = Object.entries(moodCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    // Calculate mood trend (last 7 days)
    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentHistory = history.filter(entry => entry.timestamp >= lastWeek);
    const dailyAverages = new Map<string, number[]>();

    recentHistory.forEach(entry => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0];
      const intensities = dailyAverages.get(date) || [];
      intensities.push(entry.intensity);
      dailyAverages.set(date, intensities);
    });

    stats.moodTrend = Array.from(dailyAverages.entries()).map(([date, intensities]) => ({
      date,
      average: intensities.reduce((a, b) => a + b, 0) / intensities.length,
    }));

    // Find common triggers and activities
    const triggers = history.flatMap(entry => entry.triggers || []);
    const activities = history.flatMap(entry => entry.activities || []);

    stats.commonTriggers = getMostFrequent(triggers, 5);
    stats.commonActivities = getMostFrequent(activities, 5);

    await AsyncStorage.setItem(
      `${MOOD_STATS_KEY}_${userId}`,
      JSON.stringify(stats)
    );
  } catch (error) {
    console.error('Failed to update mood stats:', error);
  }
}

export async function getMoodStats(userId: string): Promise<MoodStats> {
  try {
    const stats = await AsyncStorage.getItem(`${MOOD_STATS_KEY}_${userId}`);
    return stats ? JSON.parse(stats) : null;
  } catch (error) {
    console.error('Failed to get mood stats:', error);
    throw new Error('Failed to get mood stats');
  }
}

// Helper function to get most frequent items
function getMostFrequent(items: string[], limit: number): string[] {
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
} 
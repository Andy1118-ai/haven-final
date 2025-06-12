import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMood } from '../../hooks/useMood';
import { MoodEntry, Goal } from '../../services/mood';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, shadows } from '../../constants/theme';
import {
  Smile,
  Frown,
  Meh,
  Calendar,
  BarChart2,
  Plus,
} from 'lucide-react-native';

const MOOD_EMOJIS = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  calm: '😌',
  excited: '🤩',
  tired: '😴',
  neutral: '😐',
};

const MOOD_COLORS = {
  happy: '#FFD700',
  sad: '#4169E1',
  angry: '#FF4500',
  anxious: '#9370DB',
  calm: '#98FB98',
  excited: '#FF69B4',
  tired: '#A9A9A9',
  neutral: '#D3D3D3',
};

const moods = [
  { id: 'great', label: 'Great', icon: <Smile size={32} color={colors.success} /> },
  { id: 'good', label: 'Good', icon: <Smile size={32} color={colors.primary} /> },
  { id: 'okay', label: 'Okay', icon: <Meh size={32} color={colors.warning} /> },
  { id: 'bad', label: 'Bad', icon: <Frown size={32} color={colors.error} /> },
];

const activities = [
  { id: 'exercise', label: 'Exercise' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'reading', label: 'Reading' },
  { id: 'social', label: 'Social' },
  { id: 'work', label: 'Work' },
  { id: 'sleep', label: 'Sleep' },
];

export default function MoodScreen() {
  const {
    history,
    goals,
    stats,
    isLoading,
    error,
    addMood,
    analyzeMood,
    createNewGoal,
    updateProgress,
    getGoalsByStatus,
  } = useMood();

  const [selectedTab, setSelectedTab] = useState<'mood' | 'goals'>('mood');
  const [moodText, setMoodText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
  };

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSave = () => {
    // Save mood entry logic here
    console.log({
      mood: selectedMood,
      activities: selectedActivities,
      note,
    });
  };

  const handleAddMood = useCallback(async () => {
    if (!selectedMood) {
      Alert.alert('Error', 'Please select a mood');
      return;
    }

    try {
      const entry: Omit<MoodEntry, 'id' | 'timestamp'> = {
        mood: selectedMood,
        intensity: 5,
        note: moodText,
        triggers: [],
        activities: selectedActivities,
      };

      await addMood(entry);
      setMoodText('');
      setSelectedMood(null);
      setSelectedActivities([]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add mood entry');
    }
  }, [selectedMood, moodText, selectedActivities, addMood]);

  const handleAnalyzeMood = useCallback(async () => {
    if (!moodText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    try {
      const analysis = await analyzeMood(moodText);
      Alert.alert('Mood Analysis', `Detected mood: ${analysis.mood}\nIntensity: ${analysis.intensity}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze mood');
    }
  }, [moodText, analyzeMood]);

  const handleCreateGoal = useCallback(async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'> = {
        title: newGoalTitle,
        description: newGoalDescription,
        category: 'personal',
        status: 'in_progress',
        targetDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        milestones: [],
      };

      await createNewGoal(goal);
      setNewGoalTitle('');
      setNewGoalDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal');
    }
  }, [newGoalTitle, newGoalDescription, createNewGoal]);

  const handleUpdateProgress = useCallback(async (goalId: string, progress: number) => {
    try {
      await updateProgress(goalId, progress);
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal progress');
    }
  }, [updateProgress]);

  const renderMoodEntry = (entry: MoodEntry) => (
    <View key={entry.id} style={styles.moodEntry}>
      <View style={styles.moodHeader}>
        <Text style={styles.moodEmoji}>{MOOD_EMOJIS[entry.mood]}</Text>
        <Text style={styles.moodDate}>
          {new Date(entry.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.moodNote}>{entry.note}</Text>
      <View style={styles.moodTags}>
        {entry.triggers.map((trigger, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{trigger}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderGoal = (goal: Goal) => (
    <View key={goal.id} style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.goalTitle}>{goal.title}</Text>
        <Text style={styles.goalStatus}>{goal.status}</Text>
      </View>
      <Text style={styles.goalDescription}>{goal.description}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(goal.progress / 100) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{goal.progress}% Complete</Text>
      <View style={styles.goalActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdateProgress(goal.id, Math.min(goal.progress + 10, 100))}
        >
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdateProgress(goal.id, Math.max(goal.progress - 10, 0))}
        >
          <MaterialIcons name="remove" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.subtitle}>Track your mood and activities</Text>
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.moodCard}>
          <View style={styles.moodGrid}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodItem,
                  selectedMood === mood.id && styles.selectedMoodItem,
                ]}
                onPress={() => handleMoodSelect(mood.id)}
              >
                {mood.icon}
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.id && styles.selectedMoodLabel,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card variant="elevated" style={styles.activitiesCard}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <View style={styles.activitiesGrid}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityItem,
                  selectedActivities.includes(activity.id) &&
                    styles.selectedActivityItem,
                ]}
                onPress={() => handleActivityToggle(activity.id)}
              >
                <Text
                  style={[
                    styles.activityLabel,
                    selectedActivities.includes(activity.id) &&
                      styles.selectedActivityLabel,
                  ]}
                >
                  {activity.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card variant="elevated" style={styles.noteCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TouchableOpacity
            style={styles.noteInput}
            onPress={() => {
              // Open note input modal
            }}
          >
            <Plus size={20} color={colors.text.light} />
            <Text style={styles.notePlaceholder}>Add a note...</Text>
          </TouchableOpacity>
        </Card>

        <Button
          variant="primary"
          title="Save Entry"
          onPress={handleSave}
          disabled={!selectedMood}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing.lg,
  },
  moodCard: {
    marginBottom: spacing.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  moodItem: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  selectedMoodItem: {
    backgroundColor: colors.primary + '20',
  },
  moodLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  selectedMoodLabel: {
    color: colors.primary,
  },
  activitiesCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  activityItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedActivityItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activityLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  selectedActivityLabel: {
    color: colors.white,
  },
  noteCard: {
    marginBottom: spacing.lg,
  },
  noteInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  notePlaceholder: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.light,
    marginLeft: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  selectedTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  selectedTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  moodEntry: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  moodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodDate: {
    color: '#666666',
    fontSize: 14,
  },
  moodNote: {
    fontSize: 16,
    marginBottom: 10,
  },
  moodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  goalInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  goalsContainer: {
    marginBottom: 20,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalStatus: {
    fontSize: 14,
    color: '#666666',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
}); 
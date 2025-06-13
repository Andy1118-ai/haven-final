import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAnalytics } from '../../hooks/useAnalytics';
import { colors } from '../../constants/theme';

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  calm: '😌',
  neutral: '😐',
  anxious: '😰',
  sad: '😢',
  angry: '😠',
};

export default function AnalyticsScreen() {
  const {
    isLoading,
    error,
    getWeeklyProgress,
    getMoodTrends,
    getContentProgress,
    getSessionInsights,
    getRecommendations,
    addNewSession,
  } = useAnalytics();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'mood' | 'content' | 'sessions'>(
    'overview'
  );

  const handleAddSession = useCallback(async () => {
    try {
      await addNewSession({
        duration: 30, // Default 30 minutes
        type: 'therapy',
        notes: '',
      });
      Alert.alert('Success', 'Session added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add session');
    }
  }, [addNewSession]);

  const renderOverview = () => {
    const weeklyProgress = getWeeklyProgress();
    const moodTrends = getMoodTrends();
    const contentProgress = getContentProgress();
    const sessionInsights = getSessionInsights();
    const recommendations = getRecommendations();

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Weekly Overview</Text>
        {weeklyProgress && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {weeklyProgress.totalSessions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Sessions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {Math.round(weeklyProgress.totalDuration / 60)}h
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Total Time</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {Math.round(weeklyProgress.averageDuration)}m
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Avg. Duration</Text>
            </View>
          </View>
        )}

        {moodTrends && (
          <View style={styles.moodSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Mood Trends</Text>
            <View style={[styles.moodCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.moodEmoji, { fontSize: 40 }]}>
                {MOOD_EMOJIS[moodTrends.mostCommonMood]}
              </Text>
              <View style={styles.moodStats}>
                <Text style={[styles.moodLabel, { color: colors.text.primary }]}>
                  Most Common Mood: {moodTrends.mostCommonMood}
                </Text>
                <Text style={[styles.moodLabel, { color: colors.text.primary }]}>
                  Average Mood: {moodTrends.averageMood}
                </Text>
              </View>
            </View>
          </View>
        )}

        {contentProgress && (
          <View style={styles.contentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Content Progress</Text>
            <View style={[styles.contentCard, { backgroundColor: colors.white }]}>
              <View style={styles.contentStat}>
                <Text style={[styles.contentValue, { color: colors.text.primary }]}>
                  {contentProgress.articlesRead}
                </Text>
                <Text style={[styles.contentLabel, { color: colors.text.secondary }]}>Articles</Text>
              </View>
              <View style={styles.contentStat}>
                <Text style={[styles.contentValue, { color: colors.text.primary }]}>
                  {contentProgress.exercisesCompleted}
                </Text>
                <Text style={[styles.contentLabel, { color: colors.text.secondary }]}>Exercises</Text>
              </View>
              <View style={styles.contentStat}>
                <Text style={[styles.contentValue, { color: colors.text.primary }]}>
                  {contentProgress.meditationsCompleted}
                </Text>
                <Text style={[styles.contentLabel, { color: colors.text.secondary }]}>Meditations</Text>
              </View>
            </View>
          </View>
        )}

        {sessionInsights && (
          <View style={styles.sessionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Session Insights</Text>
            <View style={[styles.sessionCard, { backgroundColor: colors.white }]}>
              <Text style={[styles.sessionStat, { color: colors.text.primary }]}>
                Total Hours: {sessionInsights.totalHours}
              </Text>
              <Text style={[styles.sessionStat, { color: colors.text.primary }]}>
                Avg. Session: {Math.round(sessionInsights.averageSessionLength)}m
              </Text>
              <Text style={[styles.sessionStat, { color: colors.text.primary }]}>
                Consistency: {sessionInsights.consistencyScore}%
              </Text>
            </View>
          </View>
        )}

        {recommendations && (
          <View style={styles.recommendationsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recommendations</Text>
            <View style={[styles.recommendationsCard, { backgroundColor: colors.white }]}>
              {recommendations.map((rec, index) => (
                <Text key={index} style={[styles.recommendation, { color: colors.text.primary }]}>
                  • {rec}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMoodAnalytics = () => {
    const moodTrends = getMoodTrends();
    if (!moodTrends) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Mood Analysis</Text>
        <View style={[styles.moodCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.moodEmoji, { fontSize: 60 }]}>
            {MOOD_EMOJIS[moodTrends.mostCommonMood]}
          </Text>
          <View style={styles.moodStats}>
            <Text style={[styles.moodLabel, { color: colors.text.primary }]}>
              Most Common Mood: {moodTrends.mostCommonMood}
            </Text>
            <Text style={[styles.moodLabel, { color: colors.text.primary }]}>
              Average Mood: {moodTrends.averageMood}
            </Text>
          </View>
        </View>
        <View style={styles.weeklyTrend}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Weekly Trend</Text>
          {moodTrends.weeklyTrend.map((day, index) => (
            <View key={index} style={styles.trendDay}>
              <Text style={[styles.dayLabel, { color: colors.text.secondary }]}>{day.day}</Text>
              <Text style={[styles.dayMood, { fontSize: 24 }]}>{MOOD_EMOJIS[day.mood]}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderContentAnalytics = () => {
    const contentProgress = getContentProgress();
    if (!contentProgress) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Content Progress</Text>
        <View style={[styles.contentCard, { backgroundColor: colors.white }]}>
          <View style={styles.contentStat}>
            <Text style={[styles.contentValue, { color: colors.text.primary }]}>
              {contentProgress.articlesRead}
            </Text>
            <Text style={[styles.contentLabel, { color: colors.text.secondary }]}>Articles</Text>
          </View>
          <View style={styles.contentStat}>
            <Text style={[styles.contentValue, { color: colors.text.primary }]}>
              {contentProgress.exercisesCompleted}
            </Text>
            <Text style={[styles.contentLabel, { color: colors.text.secondary }]}>Exercises</Text>
          </View>
          <View style={styles.contentStat}>
            <Text style={[styles.contentValue, { color: colors.text.primary }]}>
              {contentProgress.meditationsCompleted}
            </Text>
            <Text style={[styles.contentLabel, { color: colors.text.secondary }]}>Meditations</Text>
          </View>
        </View>
        <View style={styles.favoriteCategories}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Favorite Categories</Text>
          <View style={[styles.categoriesCard, { backgroundColor: colors.white }]}>
            {contentProgress.favoriteCategories.map((category, index) => (
              <Text key={index} style={[styles.category, { color: colors.text.primary }]}>
                • {category}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderSessionAnalytics = () => {
    const sessionInsights = getSessionInsights();
    const weeklyProgress = getWeeklyProgress();
    if (!sessionInsights || !weeklyProgress) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Session Analytics</Text>
        <View style={[styles.sessionCard, { backgroundColor: colors.white }]}>
          <Text style={[styles.sessionStat, { color: colors.text.primary }]}>
            Total Hours: {sessionInsights.totalHours}
          </Text>
          <Text style={[styles.sessionStat, { color: colors.text.primary }]}>
            Avg. Session: {Math.round(sessionInsights.averageSessionLength)}m
          </Text>
          <Text style={[styles.sessionStat, { color: colors.text.primary }]}>
            Consistency: {sessionInsights.consistencyScore}%
          </Text>
        </View>
        <View style={styles.preferredTimes}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Preferred Times</Text>
          <View style={[styles.timesCard, { backgroundColor: colors.white }]}>
            {sessionInsights.preferredTimes.map((time, index) => (
              <Text key={index} style={[styles.timeSlot, { color: colors.text.primary }]}>
                • {time}
              </Text>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addSessionButton, { backgroundColor: colors.primary }]}
          onPress={handleAddSession}
        >
          <Ionicons name="add-circle-outline" size={24} color={colors.white} />
          <Text style={[styles.addSessionText, { color: colors.white }]}>Add Session</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.tabBar, { backgroundColor: colors.white }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'overview' && { borderBottomColor: colors.primary },
          ]}
          onPress={() => setSelectedTab('overview')}
        >
          <Ionicons
            name="stats-chart"
            size={24}
            color={selectedTab === 'overview' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === 'overview' ? colors.primary : colors.text.secondary,
              },
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'mood' && { borderBottomColor: colors.primary }]}
          onPress={() => setSelectedTab('mood')}
        >
          <Ionicons
            name="happy"
            size={24}
            color={selectedTab === 'mood' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === 'mood' ? colors.primary : colors.text.secondary,
              },
            ]}
          >
            Mood
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'content' && { borderBottomColor: colors.primary }]}
          onPress={() => setSelectedTab('content')}
        >
          <Ionicons
            name="book"
            size={24}
            color={selectedTab === 'content' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === 'content' ? colors.primary : colors.text.secondary,
              },
            ]}
          >
            Content
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'sessions' && { borderBottomColor: colors.primary }]}
          onPress={() => setSelectedTab('sessions')}
        >
          <Ionicons
            name="time"
            size={24}
            color={selectedTab === 'sessions' ? colors.primary : colors.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              {
                color: selectedTab === 'sessions' ? colors.primary : colors.text.secondary,
              },
            ]}
          >
            Sessions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'mood' && renderMoodAnalytics()}
        {selectedTab === 'content' && renderContentAnalytics()}
        {selectedTab === 'sessions' && renderSessionAnalytics()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    marginTop: 5,
    fontSize: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
  },
  moodSection: {
    marginTop: 20,
  },
  moodCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  moodEmoji: {
    marginRight: 20,
  },
  moodStats: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  contentSection: {
    marginTop: 20,
  },
  contentCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 10,
    justifyContent: 'space-between',
  },
  contentStat: {
    alignItems: 'center',
  },
  contentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentLabel: {
    fontSize: 12,
  },
  sessionSection: {
    marginTop: 20,
  },
  sessionCard: {
    padding: 20,
    borderRadius: 10,
  },
  sessionStat: {
    fontSize: 16,
    marginBottom: 10,
  },
  recommendationsSection: {
    marginTop: 20,
  },
  recommendationsCard: {
    padding: 20,
    borderRadius: 10,
  },
  recommendation: {
    fontSize: 16,
    marginBottom: 10,
  },
  weeklyTrend: {
    marginTop: 20,
  },
  trendDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dayLabel: {
    fontSize: 16,
  },
  dayMood: {
    marginLeft: 10,
  },
  favoriteCategories: {
    marginTop: 20,
  },
  categoriesCard: {
    padding: 20,
    borderRadius: 10,
  },
  category: {
    fontSize: 16,
    marginBottom: 10,
  },
  preferredTimes: {
    marginTop: 20,
  },
  timesCard: {
    padding: 20,
    borderRadius: 10,
  },
  timeSlot: {
    fontSize: 16,
    marginBottom: 10,
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  addSessionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});
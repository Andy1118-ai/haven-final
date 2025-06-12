import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search,
  Filter,
  Heart,
  MessageCircle,
  Share,
  BookOpen,
  Video,
  Headphones
} from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useContent } from '../../hooks/useContent';
import { Article, Exercise, Meditation } from '../../services/content';

const categories = [
  { id: 'all', title: 'All', active: true },
  { id: 'articles', title: 'Articles', active: false },
  { id: 'videos', title: 'Videos', active: false },
  { id: 'podcasts', title: 'Podcasts', active: false },
];

const content = [
  {
    id: 1,
    type: 'article',
    title: 'Understanding Anxiety: A Complete Guide',
    excerpt: 'Learn about the different types of anxiety disorders and effective coping strategies...',
    image: 'https://images.pexels.com/photos/3807738/pexels-photo-3807738.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '5 min read',
    likes: 245,
    comments: 32,
    category: 'Mental Health',
  },
  {
    id: 2,
    type: 'video',
    title: 'Breathing Techniques for Stress Relief',
    excerpt: 'Simple breathing exercises you can do anywhere to reduce stress and anxiety...',
    image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '8 min watch',
    likes: 189,
    comments: 28,
    category: 'Wellness',
  },
  {
    id: 3,
    type: 'article',
    title: 'Building Healthy Relationships',
    excerpt: 'Essential tips for creating and maintaining meaningful connections with others...',
    image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '7 min read',
    likes: 312,
    comments: 45,
    category: 'Relationships',
  },
  {
    id: 4,
    type: 'podcast',
    title: 'Overcoming Grief: A Journey of Healing',
    excerpt: 'A heartfelt discussion about processing loss and finding hope in difficult times...',
    image: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800',
    readTime: '25 min listen',
    likes: 156,
    comments: 22,
    category: 'Grief & Loss',
  },
];

type ContentType = 'articles' | 'exercises' | 'meditations';

const CATEGORIES = {
  articles: ['anxiety', 'depression', 'stress', 'relationships', 'self-care'],
  exercises: ['mindfulness', 'cbt', 'dbt', 'exposure', 'relaxation'],
  meditations: ['breathing', 'body-scan', 'loving-kindness', 'mindfulness', 'sleep'],
};

export default function ContentScreen() {
  const {
    articles,
    exercises,
    meditations,
    progress,
    recommended,
    isLoading,
    error,
    search,
    markComplete,
    getByCategory,
  } = useContent();

  const [selectedType, setSelectedType] = useState<ContentType>('articles');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      await search(searchQuery, selectedType);
    } catch (error) {
      Alert.alert('Error', 'Failed to search content');
    }
  }, [searchQuery, selectedType, search]);

  const handleCategorySelect = useCallback(
    async (category: string) => {
      setSelectedCategory(category);
      try {
        await getByCategory(selectedType, category);
      } catch (error) {
        Alert.alert('Error', 'Failed to load content by category');
      }
    },
    [selectedType, getByCategory]
  );

  const handleMarkComplete = useCallback(
    async (type: ContentType, id: string) => {
      try {
        await markComplete(type.slice(0, -1) as 'article' | 'exercise' | 'meditation', id);
        Alert.alert('Success', 'Content marked as complete');
      } catch (error) {
        Alert.alert('Error', 'Failed to mark content as complete');
      }
    },
    [markComplete]
  );

  const renderContentItem = (item: Article | Exercise | Meditation) => {
    const isCompleted = progress?.completedArticles.includes(item.id) ||
      progress?.completedExercises.includes(item.id) ||
      progress?.completedMeditations.includes(item.id);

    return (
      <View key={item.id} style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>{item.title}</Text>
          {isCompleted && (
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          )}
        </View>
        <Text style={styles.contentDescription}>{item.description}</Text>
        <View style={styles.contentMeta}>
          <Text style={styles.contentMetaText}>
            {selectedType === 'articles' && `${(item as Article).readingTime} min read`}
            {selectedType === 'exercises' && `${(item as Exercise).duration} min`}
            {selectedType === 'meditations' && `${(item as Meditation).duration} min`}
          </Text>
          <Text style={styles.contentMetaText}>
            {(item as Exercise).difficulty || item.category}
          </Text>
        </View>
        {!isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleMarkComplete(selectedType, item.id)}
          >
            <Text style={styles.completeButtonText}>Mark Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRecommendedSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recommended for You</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommended[selectedType].map(renderContentItem)}
      </ScrollView>
    </View>
  );

  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryFilters}
    >
      {CATEGORIES[selectedType].map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryFilter,
            selectedCategory === category && styles.selectedCategoryFilter,
          ]}
          onPress={() => handleCategorySelect(category)}
        >
          <Text
            style={[
              styles.categoryFilterText,
              selectedCategory === category && styles.selectedCategoryFilterText,
            ]}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Content Hub</Text>
        <Text style={styles.subtitle}>Explore resources for your wellbeing</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles, videos, podcasts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categories}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.activeCategoryChip
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.activeCategoryText
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content List */}
      <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
        {renderRecommendedSection()}
        {renderCategoryFilters()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ${
                  selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
                }`
              : `All ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`}
          </Text>
          {selectedType === 'articles' && articles.map(renderContentItem)}
          {selectedType === 'exercises' && exercises.map(renderContentItem)}
          {selectedType === 'meditations' && meditations.map(renderContentItem)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginLeft: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categories: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeCategoryChip: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contentImage: {
    width: '100%',
    height: 200,
  },
  contentInfo: {
    padding: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  contentCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  contentTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  contentExcerpt: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  contentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  likedText: {
    color: '#EF4444',
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoryFilters: {
    marginBottom: 20,
  },
  categoryFilter: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryFilter: {
    backgroundColor: '#007AFF',
  },
  categoryFilterText: {
    color: '#666666',
  },
  selectedCategoryFilterText: {
    color: '#FFFFFF',
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ARTICLES: '@haven/articles',
  EXERCISES: '@haven/exercises',
  MEDITATIONS: '@haven/meditations',
  USER_PROGRESS: '@haven/user_progress',
};

export interface Article {
  id: string;
  title: string;
  content: string;
  category: 'anxiety' | 'depression' | 'stress' | 'relationships' | 'self-care';
  tags: string[];
  readingTime: number;
  createdAt: number;
  updatedAt: number;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  steps: string[];
  duration: number;
  category: 'mindfulness' | 'cbt' | 'dbt' | 'exposure' | 'relaxation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: number;
  updatedAt: number;
}

export interface Meditation {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  category: 'breathing' | 'body-scan' | 'loving-kindness' | 'mindfulness' | 'sleep';
  createdAt: number;
  updatedAt: number;
}

export interface UserProgress {
  userId: string;
  completedArticles: string[];
  completedExercises: string[];
  completedMeditations: string[];
  lastAccessed: number;
}

// Article Management
export async function getArticles(
  userId: string,
  category?: Article['category']
): Promise<Article[]> {
  try {
    const articlesJson = await AsyncStorage.getItem(STORAGE_KEYS.ARTICLES);
    const articles: Article[] = articlesJson ? JSON.parse(articlesJson) : [];
    return category ? articles.filter(article => article.category === category) : articles;
  } catch (error) {
    console.error('Error getting articles:', error);
    throw error;
  }
}

export async function getArticle(id: string): Promise<Article | null> {
  try {
    const articles = await getArticles('');
    return articles.find(article => article.id === id) || null;
  } catch (error) {
    console.error('Error getting article:', error);
    throw error;
  }
}

// Exercise Management
export async function getExercises(
  userId: string,
  category?: Exercise['category'],
  difficulty?: Exercise['difficulty']
): Promise<Exercise[]> {
  try {
    const exercisesJson = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
    const exercises: Exercise[] = exercisesJson ? JSON.parse(exercisesJson) : [];
    return exercises.filter(exercise => {
      if (category && exercise.category !== category) return false;
      if (difficulty && exercise.difficulty !== difficulty) return false;
      return true;
    });
  } catch (error) {
    console.error('Error getting exercises:', error);
    throw error;
  }
}

export async function getExercise(id: string): Promise<Exercise | null> {
  try {
    const exercises = await getExercises('');
    return exercises.find(exercise => exercise.id === id) || null;
  } catch (error) {
    console.error('Error getting exercise:', error);
    throw error;
  }
}

// Meditation Management
export async function getMeditations(
  userId: string,
  category?: Meditation['category']
): Promise<Meditation[]> {
  try {
    const meditationsJson = await AsyncStorage.getItem(STORAGE_KEYS.MEDITATIONS);
    const meditations: Meditation[] = meditationsJson ? JSON.parse(meditationsJson) : [];
    return category ? meditations.filter(meditation => meditation.category === category) : meditations;
  } catch (error) {
    console.error('Error getting meditations:', error);
    throw error;
  }
}

export async function getMeditation(id: string): Promise<Meditation | null> {
  try {
    const meditations = await getMeditations('');
    return meditations.find(meditation => meditation.id === id) || null;
  } catch (error) {
    console.error('Error getting meditation:', error);
    throw error;
  }
}

// Progress Tracking
export async function getUserProgress(userId: string): Promise<UserProgress> {
  try {
    const progressJson = await AsyncStorage.getItem(`${STORAGE_KEYS.USER_PROGRESS}:${userId}`);
    if (progressJson) {
      return JSON.parse(progressJson);
    }

    const newProgress: UserProgress = {
      userId,
      completedArticles: [],
      completedExercises: [],
      completedMeditations: [],
      lastAccessed: Date.now(),
    };

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.USER_PROGRESS}:${userId}`,
      JSON.stringify(newProgress)
    );

    return newProgress;
  } catch (error) {
    console.error('Error getting user progress:', error);
    throw error;
  }
}

export async function markArticleComplete(userId: string, articleId: string): Promise<void> {
  try {
    const progress = await getUserProgress(userId);
    if (!progress.completedArticles.includes(articleId)) {
      progress.completedArticles.push(articleId);
      progress.lastAccessed = Date.now();
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_PROGRESS}:${userId}`,
        JSON.stringify(progress)
      );
    }
  } catch (error) {
    console.error('Error marking article complete:', error);
    throw error;
  }
}

export async function markExerciseComplete(userId: string, exerciseId: string): Promise<void> {
  try {
    const progress = await getUserProgress(userId);
    if (!progress.completedExercises.includes(exerciseId)) {
      progress.completedExercises.push(exerciseId);
      progress.lastAccessed = Date.now();
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_PROGRESS}:${userId}`,
        JSON.stringify(progress)
      );
    }
  } catch (error) {
    console.error('Error marking exercise complete:', error);
    throw error;
  }
}

export async function markMeditationComplete(userId: string, meditationId: string): Promise<void> {
  try {
    const progress = await getUserProgress(userId);
    if (!progress.completedMeditations.includes(meditationId)) {
      progress.completedMeditations.push(meditationId);
      progress.lastAccessed = Date.now();
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.USER_PROGRESS}:${userId}`,
        JSON.stringify(progress)
      );
    }
  } catch (error) {
    console.error('Error marking meditation complete:', error);
    throw error;
  }
}

// Search and Filter
export async function searchContent(
  userId: string,
  query: string,
  type: 'articles' | 'exercises' | 'meditations' | 'all'
): Promise<{
  articles: Article[];
  exercises: Exercise[];
  meditations: Meditation[];
}> {
  try {
    const [articles, exercises, meditations] = await Promise.all([
      type === 'all' || type === 'articles' ? getArticles(userId) : Promise.resolve([]),
      type === 'all' || type === 'exercises' ? getExercises(userId) : Promise.resolve([]),
      type === 'all' || type === 'meditations' ? getMeditations(userId) : Promise.resolve([]),
    ]);

    const searchResults = {
      articles: articles.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.content.toLowerCase().includes(query.toLowerCase())
      ),
      exercises: exercises.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ),
      meditations: meditations.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ),
    };

    return searchResults;
  } catch (error) {
    console.error('Error searching content:', error);
    throw error;
  }
}

// Recommendations
export async function getRecommendedContent(
  userId: string,
  limit: number = 5
): Promise<{
  articles: Article[];
  exercises: Exercise[];
  meditations: Meditation[];
}> {
  try {
    const progress = await getUserProgress(userId);
    const [articles, exercises, meditations] = await Promise.all([
      getArticles(userId),
      getExercises(userId),
      getMeditations(userId),
    ]);

    // Filter out completed content
    const uncompletedArticles = articles.filter(
      article => !progress.completedArticles.includes(article.id)
    );
    const uncompletedExercises = exercises.filter(
      exercise => !progress.completedExercises.includes(exercise.id)
    );
    const uncompletedMeditations = meditations.filter(
      meditation => !progress.completedMeditations.includes(meditation.id)
    );

    // Sort by creation date (newest first) and limit results
    return {
      articles: uncompletedArticles
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit),
      exercises: uncompletedExercises
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit),
      meditations: uncompletedMeditations
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit),
    };
  } catch (error) {
    console.error('Error getting recommended content:', error);
    throw error;
  }
} 
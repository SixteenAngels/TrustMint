import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Lesson } from '../types';

export const LearningScreen: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      const lessonsRef = collection(db, 'lessons');
      const snapshot = await getDocs(lessonsRef);
      const lessonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Lesson[];

      // Sort by order
      lessonsData.sort((a, b) => a.order - b.order);
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error loading lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: string) => {
    try {
      const lessonRef = doc(db, 'lessons', lessonId);
      await updateDoc(lessonRef, { completed: true });
      
      setLessons(prev => 
        prev.map(lesson => 
          lesson.id === lessonId 
            ? { ...lesson, completed: true }
            : lesson
        )
      );
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const renderLesson = (lesson: Lesson) => (
    <TouchableOpacity
      key={lesson.id}
      style={[
        styles.lessonCard,
        lesson.completed && styles.completedLessonCard
      ]}
      onPress={() => {
        // Navigate to lesson detail
        Alert.alert('Lesson', `Opening: ${lesson.title}`);
        markLessonComplete(lesson.id);
      }}
    >
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        {lesson.completed && (
          <Text style={styles.completedIcon}>✓</Text>
        )}
      </View>
      <Text style={styles.lessonContent} numberOfLines={3}>
        {lesson.content}
      </Text>
      <View style={styles.lessonFooter}>
        <Text style={styles.lessonOrder}>Lesson {lesson.order}</Text>
        {lesson.quiz && (
          <Text style={styles.quizIndicator}>Quiz Available</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learn to Invest</Text>
        <Text style={styles.subtitle}>Master the basics of stock trading</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Your Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${(lessons.filter(l => l.completed).length / lessons.length) * 100}%` 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {lessons.filter(l => l.completed).length} of {lessons.length} lessons completed
        </Text>
      </View>

      <View style={styles.lessonsContainer}>
        {lessons.map(renderLesson)}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
        <Text style={styles.tipText}>
          • Start with small amounts to practice
        </Text>
        <Text style={styles.tipText}>
          • Diversify your portfolio across different sectors
        </Text>
        <Text style={styles.tipText}>
          • Keep learning and stay updated with market news
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  lessonsContainer: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedLessonCard: {
    backgroundColor: '#f0f8f0',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  completedIcon: {
    fontSize: 20,
    color: '#34C759',
    fontWeight: 'bold',
  },
  lessonContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonOrder: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  quizIndicator: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
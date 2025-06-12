import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useBookings } from '../../hooks/useBookings';
import { useSubscription } from '../../hooks/useSubscription';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BookScreen() {
  const { createBooking, isLoading: isBookingLoading } = useBookings();
  const {
    subscriptionStatus,
    canBook,
    getRemaining,
    isLoading: isSubscriptionLoading,
  } = useSubscription();

  const [usedSessions, setUsedSessions] = useState(0);

  useEffect(() => {
    // TODO: Fetch used sessions count from the backend
    // This is a placeholder - you'll need to implement this
    setUsedSessions(2);
  }, []);

  const handleBookSession = async () => {
    if (!subscriptionStatus.isSubscribed) {
      Alert.alert(
        'Subscription Required',
        'Please subscribe to a plan to book sessions.',
        [
          {
            text: 'View Plans',
            onPress: () => router.push('/subscription'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    if (!canBook(usedSessions)) {
      Alert.alert(
        'Session Limit Reached',
        `You have used all your sessions for this month. Please upgrade your plan or wait until next month.`,
        [
          {
            text: 'Upgrade Plan',
            onPress: () => router.push('/subscription'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    try {
      // TODO: Implement actual booking logic
      // This is a placeholder - you'll need to implement this
      await createBooking({
        therapistId: '123',
        date: new Date(),
        duration: 60,
        notes: 'Initial consultation',
      });

      Alert.alert('Success', 'Your session has been booked!');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to book session'
      );
    }
  };

  if (isSubscriptionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Session</Text>
        <Text style={styles.subtitle}>
          Schedule your therapy session with our qualified therapists
        </Text>
      </View>

      <View style={styles.subscriptionInfo}>
        <MaterialIcons
          name={subscriptionStatus.isSubscribed ? 'check-circle' : 'info'}
          size={24}
          color={subscriptionStatus.isSubscribed ? '#4CAF50' : '#FFA000'}
        />
        <View style={styles.subscriptionDetails}>
          <Text style={styles.subscriptionStatus}>
            {subscriptionStatus.isSubscribed
              ? `Current Plan: ${subscriptionStatus.tier}`
              : 'No Active Subscription'}
          </Text>
          {subscriptionStatus.isSubscribed && (
            <Text style={styles.sessionsInfo}>
              Remaining Sessions: {getRemaining(usedSessions)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.bookingContainer}>
        {/* TODO: Add therapist selection, date/time picker, and duration selection */}
        <Text style={styles.placeholderText}>
          Therapist selection, date/time picker, and duration selection will be
          implemented here
        </Text>

        <TouchableOpacity
          style={[
            styles.bookButton,
            (!subscriptionStatus.isSubscribed || !canBook(usedSessions)) &&
              styles.disabledButton,
          ]}
          onPress={handleBookSession}
          disabled={!subscriptionStatus.isSubscribed || !canBook(usedSessions)}
        >
          {isBookingLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.bookButtonText}>Book Session</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  subscriptionDetails: {
    marginLeft: 10,
    flex: 1,
  },
  subscriptionStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionsInfo: {
    fontSize: 14,
    color: '#666',
  },
  bookingContainer: {
    padding: 20,
  },
  placeholderText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 
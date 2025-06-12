import { useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import {
  registerForPushNotifications,
  scheduleAppointmentReminders,
  cancelBookingNotifications,
  addNotificationResponseReceivedListener,
  addNotificationReceivedListener,
} from '../services/notifications';

export function useNotifications() {
  // Register for push notifications when the app starts
  useEffect(() => {
    registerForPushNotifications().catch(console.error);
  }, []);

  // Handle notification responses (when user taps on notification)
  useEffect(() => {
    const subscription = addNotificationResponseReceivedListener((response) => {
      const { data } = response.notification.request.content;

      switch (data.type) {
        case 'appointment_reminder':
        case 'appointment_start':
          // Navigate to the booking details screen
          router.push(`/bookings/${data.bookingId}`);
          break;
        case 'message':
          // Navigate to the chat screen
          router.push(`/chat/${data.senderId}`);
          break;
        case 'emergency':
          // Navigate to emergency resources
          router.push('/emergency');
          break;
      }
    });

    return () => subscription.remove();
  }, []);

  // Handle notifications received while app is in foreground
  useEffect(() => {
    const subscription = addNotificationReceivedListener((notification) => {
      // You can handle foreground notifications here
      // For example, show a custom UI or update the app state
      console.log('Received notification:', notification);
    });

    return () => subscription.remove();
  }, []);

  // Schedule reminders for a new booking
  const scheduleBookingReminders = useCallback(async (booking: {
    id: string;
    startTime: Date;
    endTime: Date;
    therapistName: string;
    type: string;
  }) => {
    try {
      await scheduleAppointmentReminders(booking);
    } catch (error) {
      console.error('Error scheduling booking reminders:', error);
      throw error;
    }
  }, []);

  // Cancel reminders for a booking
  const cancelReminders = useCallback(async (bookingId: string) => {
    try {
      await cancelBookingNotifications(bookingId);
    } catch (error) {
      console.error('Error canceling booking reminders:', error);
      throw error;
    }
  }, []);

  return {
    scheduleBookingReminders,
    cancelReminders,
  };
} 
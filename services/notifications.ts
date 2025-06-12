import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Notification categories for different types of notifications
const NOTIFICATION_CATEGORIES = {
  APPOINTMENT: 'appointment',
  REMINDER: 'reminder',
  MESSAGE: 'message',
  EMERGENCY: 'emergency',
} as const;

// Configure notification categories
async function configureNotificationCategories() {
  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.APPOINTMENT, [
    {
      identifier: 'CONFIRM',
      buttonTitle: 'Confirm',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: 'RESCHEDULE',
      buttonTitle: 'Reschedule',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);

  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.REMINDER, [
    {
      identifier: 'COMPLETE',
      buttonTitle: 'Mark as Complete',
      options: {
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
  ]);
}

// Register for push notifications
export async function registerForPushNotifications() {
  try {
    if (!Device.isDevice) {
      throw new Error('Push notifications are only supported on physical devices');
    }

    // Check if we already have permission
    const existingStatus = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus.status !== 'granted') {
      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus.status !== 'granted') {
      throw new Error('Failed to get push token for push notification!');
    }

    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Configure notification categories
    await configureNotificationCategories();

    // Store the token
    await AsyncStorage.setItem('pushToken', token);

    // Platform-specific setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    throw error;
  }
}

// Schedule a local notification
export async function scheduleLocalNotification({
  title,
  body,
  data = {},
  trigger,
  category = NOTIFICATION_CATEGORIES.REMINDER,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger: Notifications.NotificationTriggerInput;
  category?: keyof typeof NOTIFICATION_CATEGORIES;
}) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        categoryIdentifier: category,
      },
      trigger,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    throw error;
  }
}

// Schedule appointment reminders
export async function scheduleAppointmentReminders(booking: {
  id: string;
  startTime: Date;
  endTime: Date;
  therapistName: string;
  type: string;
}) {
  try {
    const { id, startTime, endTime, therapistName, type } = booking;

    // Schedule reminder 24 hours before
    const dayBefore = new Date(startTime);
    dayBefore.setHours(dayBefore.getHours() - 24);

    if (dayBefore > new Date()) {
      await scheduleLocalNotification({
        title: 'Upcoming Therapy Session',
        body: `You have a ${type.toLowerCase()} session with ${therapistName} tomorrow at ${startTime.toLocaleTimeString()}`,
        data: { bookingId: id, type: 'appointment_reminder' },
        trigger: { date: dayBefore },
        category: NOTIFICATION_CATEGORIES.APPOINTMENT,
      });
    }

    // Schedule reminder 1 hour before
    const hourBefore = new Date(startTime);
    hourBefore.setHours(hourBefore.getHours() - 1);

    if (hourBefore > new Date()) {
      await scheduleLocalNotification({
        title: 'Therapy Session in 1 Hour',
        body: `Your ${type.toLowerCase()} session with ${therapistName} starts in 1 hour`,
        data: { bookingId: id, type: 'appointment_reminder' },
        trigger: { date: hourBefore },
        category: NOTIFICATION_CATEGORIES.APPOINTMENT,
      });
    }

    // Schedule session start notification
    if (startTime > new Date()) {
      await scheduleLocalNotification({
        title: 'Therapy Session Starting',
        body: `Your ${type.toLowerCase()} session with ${therapistName} is starting now`,
        data: { bookingId: id, type: 'appointment_start' },
        trigger: { date: startTime },
        category: NOTIFICATION_CATEGORIES.APPOINTMENT,
      });
    }
  } catch (error) {
    console.error('Error scheduling appointment reminders:', error);
    throw error;
  }
}

// Cancel all notifications for a booking
export async function cancelBookingNotifications(bookingId: string) {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const bookingNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.bookingId === bookingId
    );

    await Promise.all(
      bookingNotifications.map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );
  } catch (error) {
    console.error('Error canceling booking notifications:', error);
    throw error;
  }
}

// Handle notification response
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Handle notification received while app is in foreground
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
} 
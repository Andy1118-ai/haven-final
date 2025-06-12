import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, shadows } from '../../constants/theme';
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.replace('/signin');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      id: 'account',
      title: 'Account Settings',
      icon: <User size={24} color={colors.text.primary} />,
      onPress: () => router.push('/account'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell size={24} color={colors.text.primary} />,
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <Shield size={24} color={colors.text.primary} />,
      onPress: () => router.push('/privacy'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: <HelpCircle size={24} color={colors.text.primary} />,
      onPress: () => router.push('/help'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.photoURL || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.displayName || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.menuCard}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color={colors.text.light} />
            </TouchableOpacity>
          ))}
        </Card>

        <Button
          variant="outlined"
          title="Sign Out"
          onPress={handleSignOut}
          disabled={isLoading}
          leftIcon={<LogOut size={20} color={colors.error} />}
          style={styles.signOutButton}
          textStyle={styles.signOutButtonText}
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: colors.background,
    ...shadows.sm,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing.lg,
  },
  menuCard: {
    marginBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  signOutButton: {
    borderColor: colors.error,
  },
  signOutButtonText: {
    color: colors.error,
  },
});
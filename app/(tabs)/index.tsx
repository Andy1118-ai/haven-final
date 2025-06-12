import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Calendar, MessageCircle, Bell } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, shadows } from '../../constants/theme';

const services = [
  {
    id: 1,
    title: 'Video Call',
    description: 'Connect with your therapist via video',
    icon: MessageCircle,
    color: colors.primary,
  },
  {
    id: 2,
    title: 'Chat',
    description: 'Message your therapist anytime',
    icon: MessageCircle,
    color: colors.secondary,
  },
  {
    id: 3,
    title: 'Resources',
    description: 'Access helpful mental health resources',
    icon: MessageCircle,
    color: colors.primary,
  },
  {
    id: 4,
    title: 'Progress',
    description: 'Track your mental health journey',
    icon: MessageCircle,
    color: colors.secondary,
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.welcomeText}>Welcome back</Text>
          <Text style={styles.brandName}>Haven</Text>
          <Text style={styles.tagline}>Your mental wellness companion</Text>
        </View>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => {}}
          leftIcon={<Bell size={24} color={colors.primary} />}
        />
      </View>

      {/* Hero Section */}
      <Card style={styles.heroSection}>
        <Image
          source={require('../../assets/images/hero.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>Start Your Journey</Text>
          <Text style={styles.heroSubtitle}>
            Take the first step towards better mental health
          </Text>
          <Button
            title="Get Started"
            variant="primary"
            onPress={() => router.push('/(tabs)/booking')}
            style={styles.heroButton}
          />
        </View>
      </Card>

      {/* Services Section */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <View style={styles.servicesGrid}>
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={service.id}
                variant="elevated"
                style={styles.serviceCard}
                onPress={() => {}}
              >
                <View style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}>
                  <IconComponent size={24} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </Card>
            );
          })}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Button
            variant="secondary"
            title="Book Session"
            onPress={() => router.push('/(tabs)/booking')}
            leftIcon={<Calendar size={20} color={colors.white} />}
            style={styles.actionButton}
          />
          <Button
            variant="primary"
            title="Ask Assistant"
            onPress={() => router.push('/(tabs)/assistant')}
            leftIcon={<MessageCircle size={20} color={colors.white} />}
            style={styles.actionButton}
          />
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  greeting: {
    flex: 1,
  },
  welcomeText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  brandName: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  heroSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 16,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.white,
    marginBottom: spacing.md,
  },
  heroButton: {
    alignSelf: 'flex-start',
  },
  servicesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  serviceCard: {
    width: '47%',
    padding: spacing.md,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Calendar, Clock, CreditCard } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { colors, typography, spacing, shadows } from '../../constants/theme';

const services = [
  {
    id: 1,
    title: 'Individual Therapy',
    description: 'One-on-one session with your therapist',
    duration: '50 min',
    price: '$120',
  },
  {
    id: 2,
    title: 'Couples Therapy',
    description: 'Session for you and your partner',
    duration: '75 min',
    price: '$180',
  },
  {
    id: 3,
    title: 'Family Therapy',
    description: 'Session for the whole family',
    duration: '90 min',
    price: '$200',
  },
];

const sessionTypes = [
  {
    id: 1,
    title: 'Video Call',
    description: 'Connect via secure video platform',
  },
  {
    id: 2,
    title: 'In-Person',
    description: 'Meet at our office location',
  },
];

const timeSlots = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
];

const paymentMethods = [
  {
    id: 1,
    title: 'Credit Card',
    description: 'Pay with your credit card',
  },
  {
    id: 2,
    title: 'Insurance',
    description: 'Use your insurance coverage',
  },
];

export default function BookingScreen() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedSessionType, setSelectedSessionType] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);

  const handleBook = () => {
    // Handle booking logic
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Book a Session</Text>
        <Text style={styles.subtitle}>Choose your preferred options</Text>
      </View>

      {/* Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        <View style={styles.serviceList}>
          {services.map((service) => (
            <Card
              key={service.id}
              variant={selectedService === service.id ? 'elevated' : 'outlined'}
              style={[
                styles.serviceItem,
                selectedService === service.id && styles.selectedItem,
              ]}
              onPress={() => setSelectedService(service.id)}
            >
              <View style={styles.serviceContent}>
                <View style={styles.serviceDetails}>
                  <Text
                    style={[
                      styles.serviceTitle,
                      selectedService === service.id && styles.selectedText,
                    ]}
                  >
                    {service.title}
                  </Text>
                  <Text style={styles.serviceMeta}>
                    {service.duration} • {service.price}
                  </Text>
                  <Text style={styles.serviceMeta}>{service.description}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Session Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Type</Text>
        <View style={styles.sessionTypeList}>
          {sessionTypes.map((type) => (
            <Card
              key={type.id}
              variant={selectedSessionType === type.id ? 'elevated' : 'outlined'}
              style={[
                styles.sessionTypeItem,
                selectedSessionType === type.id && styles.selectedItem,
              ]}
              onPress={() => setSelectedSessionType(type.id)}
            >
              <View style={styles.sessionTypeDetails}>
                <Text
                  style={[
                    styles.sessionTypeTitle,
                    selectedSessionType === type.id && styles.selectedText,
                  ]}
                >
                  {type.title}
                </Text>
                <Text style={styles.sessionTypeDescription}>{type.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <Card variant="outlined" style={styles.dateButton}>
          <Calendar size={24} color={colors.primary} />
          <Text style={styles.dateButtonText}>Choose a date</Text>
        </Card>
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((time) => (
            <Card
              key={time}
              variant={selectedTimeSlot === time ? 'elevated' : 'outlined'}
              style={[
                styles.timeSlot,
                selectedTimeSlot === time && styles.selectedTimeSlot,
              ]}
              onPress={() => setSelectedTimeSlot(time)}
            >
              <Clock
                size={16}
                color={selectedTimeSlot === time ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.timeText,
                  selectedTimeSlot === time && styles.selectedTimeText,
                ]}
              >
                {time}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Payment Method Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentList}>
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              variant={selectedPaymentMethod === method.id ? 'elevated' : 'outlined'}
              style={[
                styles.paymentItem,
                selectedPaymentMethod === method.id && styles.selectedItem,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <CreditCard
                size={24}
                color={selectedPaymentMethod === method.id ? colors.primary : colors.text.secondary}
              />
              <View style={styles.paymentDetails}>
                <Text
                  style={[
                    styles.paymentTitle,
                    selectedPaymentMethod === method.id && styles.selectedText,
                  ]}
                >
                  {method.title}
                </Text>
                <Text style={styles.paymentDescription}>{method.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Book Button */}
      <View style={styles.bookingSection}>
        <Button
          title="Book Session"
          variant="primary"
          size="lg"
          onPress={handleBook}
          disabled={!selectedService || !selectedSessionType || !selectedTimeSlot || !selectedPaymentMethod}
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
    paddingBottom: spacing.sm,
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  serviceList: {
    gap: spacing.sm,
  },
  serviceItem: {
    padding: spacing.md,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDetails: {
    marginLeft: spacing.sm,
  },
  serviceTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  serviceMeta: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  selectedText: {
    color: colors.primary,
  },
  sessionTypeList: {
    gap: spacing.sm,
  },
  sessionTypeItem: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTypeDetails: {
    marginLeft: spacing.sm,
  },
  sessionTypeTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sessionTypeDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  dateButton: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  selectedTimeText: {
    color: colors.white,
  },
  paymentList: {
    gap: spacing.sm,
  },
  paymentItem: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDetails: {
    marginLeft: spacing.sm,
  },
  paymentTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  paymentDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  bookingSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { SUBSCRIPTION_TIERS } from '../../services/payments';
import { MaterialIcons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const {
    packages,
    subscriptionStatus,
    isLoading,
    error,
    purchase,
    restore,
  } = useSubscription();

  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      await purchase(selectedPackage);
      Alert.alert('Success', 'Thank you for your purchase!');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to complete purchase'
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert('Success', 'Your purchases have been restored!');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to restore purchases'
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRestore}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Select the plan that best fits your needs
        </Text>
      </View>

      {subscriptionStatus.isSubscribed && (
        <View style={styles.currentPlan}>
          <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          <Text style={styles.currentPlanText}>
            Current Plan: {subscriptionStatus.tier}
          </Text>
          <Text style={styles.expiryText}>
            Expires: {new Date(subscriptionStatus.expiresAt!).toLocaleDateString()}
          </Text>
        </View>
      )}

      <View style={styles.packagesContainer}>
        {packages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[
              styles.packageCard,
              selectedPackage?.identifier === pkg.identifier &&
                styles.selectedPackage,
            ]}
            onPress={() => setSelectedPackage(pkg)}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>
                {pkg.product.title.split(' - ')[0]}
              </Text>
              <Text style={styles.packagePrice}>
                {pkg.product.priceString}
              </Text>
            </View>

            <View style={styles.featuresList}>
              {Object.entries(SUBSCRIPTION_TIERS[pkg.identifier].features).map(
                ([feature, value]) => (
                  <View key={feature} style={styles.featureItem}>
                    <MaterialIcons
                      name="check"
                      size={20}
                      color="#4CAF50"
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>
                      {feature}: {value}
                    </Text>
                  </View>
                )
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            !selectedPackage && styles.disabledButton,
          ]}
          onPress={handlePurchase}
          disabled={!selectedPackage}
        >
          <Text style={styles.purchaseButtonText}>
            {selectedPackage
              ? `Purchase ${selectedPackage.product.title}`
              : 'Select a Plan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
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
  currentPlan: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  currentPlanText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2E7D32',
  },
  expiryText: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#666',
  },
  packagesContainer: {
    padding: 20,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedPackage: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  packageHeader: {
    marginBottom: 15,
  },
  packageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  featuresList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    padding: 20,
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restoreButton: {
    padding: 15,
    alignItems: 'center',
  },
  restoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 
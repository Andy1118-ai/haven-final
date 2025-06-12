import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Pressable,
} from 'react-native';
import { colors, borderRadius, shadows, animations } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  animated = true,
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.spring(scale, {
        toValue: 0.98,
        useNativeDriver: true,
        ...animations.spring,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        ...animations.spring,
      }).start();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.white,
          ...shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          backgroundColor: colors.background,
        };
      default:
        return {
          backgroundColor: colors.white,
          ...shadows.md,
        };
    }
  };

  const Container = onPress ? Pressable : View;
  const AnimatedContainer = animated ? Animated.View : View;

  return (
    <Container
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!onPress}
    >
      <AnimatedContainer
        style={[
          styles.container,
          getVariantStyles(),
          style,
          animated && { transform: [{ scale }] },
        ]}
      >
        {children}
      </AnimatedContainer>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
}); 
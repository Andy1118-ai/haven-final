import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
  Pressable,
} from 'react-native';
import { colors, typography, borderRadius, shadows, animations } from '../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      ...animations.spring,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      ...animations.spring,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.primary,
            borderWidth: 0,
          },
          text: {
            color: colors.white,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.secondary,
            borderWidth: 0,
          },
          text: {
            color: colors.white,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.primary,
          },
          text: {
            color: colors.primary,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: {
            color: colors.primary,
          },
        };
      default:
        return {
          container: {
            backgroundColor: colors.primary,
            borderWidth: 0,
          },
          text: {
            color: colors.white,
          },
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: 8,
            paddingHorizontal: 16,
          },
          text: {
            fontSize: typography.fontSize.sm,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: 16,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: typography.fontSize.lg,
          },
        };
      default:
        return {
          container: {
            paddingVertical: 12,
            paddingHorizontal: 20,
          },
          text: {
            fontSize: typography.fontSize.md,
          },
        };
    }
  }

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.container,
          variantStyles.container,
          sizeStyles.container,
          disabled && styles.disabled,
          style,
          { transform: [{ scale }] },
        ]}
      >
        {leftIcon && <>{leftIcon}</>}
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
        {rightIcon && <>{rightIcon}</>}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  text: {
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.light,
  },
}); 
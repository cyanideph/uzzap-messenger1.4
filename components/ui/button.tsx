import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { styled } from 'nativewind';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);
const StyledView = styled(View);

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const baseStyles = 'rounded-lg items-center justify-center';
  
  const variantStyles = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-600 active:bg-secondary-700',
    outline: 'border-2 border-primary-600 active:bg-primary-50',
    ghost: 'active:bg-primary-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
  };

  const textStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-600',
    ghost: 'text-primary-600',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <StyledPressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {loading ? (
        <StyledView className="flex-row items-center">
          <ActivityIndicator size="small" color={variant === 'primary' || variant === 'secondary' ? 'white' : '#0ea5e9'} />
          <StyledText
            className={`
              ml-2
              ${textStyles[variant]}
              ${textSizeStyles[size]}
              font-medium
            `}
          >
            Loading...
          </StyledText>
        </StyledView>
      ) : (
        <StyledText
          className={`
            ${textStyles[variant]}
            ${textSizeStyles[size]}
            font-medium
          `}
        >
          {children}
        </StyledText>
      )}
    </StyledPressable>
  );
}

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledActivityIndicator = styled(ActivityIndicator);

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = 'md',
  color = '#0ea5e9',
  className = '',
  fullScreen = false,
}: LoadingProps) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (fullScreen) {
    return (
      <StyledView
        className={`
          absolute
          inset-0
          bg-white/80
          items-center
          justify-center
          ${className}
        `}
      >
        <StyledActivityIndicator
          size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'small'}
          color={color}
        />
      </StyledView>
    );
  }

  return (
    <StyledView className={`items-center justify-center ${className}`}>
      <StyledActivityIndicator
        size={size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'small'}
        color={color}
      />
    </StyledView>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  visible,
  children,
  className = '',
}: LoadingOverlayProps) {
  if (!visible) return <>{children}</>;

  return (
    <StyledView className="relative">
      {children}
      <Loading fullScreen className={className} />
    </StyledView>
  );
} 
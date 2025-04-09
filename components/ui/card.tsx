import React from 'react';
import { View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({
  title,
  children,
  className = '',
  variant = 'default',
}: CardProps) {
  const baseStyles = 'rounded-xl p-4';
  
  const variantStyles = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border border-gray-200',
  };

  return (
    <StyledView
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {title && (
        <StyledText className="mb-2 text-lg font-semibold text-gray-900">
          {title}
        </StyledText>
      )}
      {children}
    </StyledView>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <StyledView className={`mb-4 ${className}`}>
      {children}
    </StyledView>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <StyledView className={className}>
      {children}
    </StyledView>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <StyledView className={`mt-4 ${className}`}>
      {children}
    </StyledView>
  );
}

import React from 'react';
import { View, Text, Image } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledImage = styled(Image);

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export function Avatar({
  src,
  alt,
  size = 'md',
  className = '',
  fallback,
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <StyledView
      className={`
        ${sizeStyles[size]}
        rounded-full
        bg-gray-200
        items-center
        justify-center
        overflow-hidden
        ${className}
      `}
    >
      {src ? (
        <StyledImage
          source={{ uri: src }}
          className="w-full h-full"
          alt={alt}
        />
      ) : (
        <StyledText
          className={`
            ${textSizeStyles[size]}
            font-medium
            text-gray-600
          `}
        >
          {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
        </StyledText>
      )}
    </StyledView>
  );
}

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 4,
  className = '',
}: AvatarGroupProps) {
  return (
    <StyledView
      className={`
        flex-row
        -space-x-2
        ${className}
      `}
    >
      {React.Children.toArray(children).slice(0, max)}
      {React.Children.count(children) > max && (
        <StyledView
          className={`
            w-10
            h-10
            rounded-full
            bg-gray-200
            items-center
            justify-center
          `}
        >
          <StyledText className="text-sm font-medium text-gray-600">
            +{React.Children.count(children) - max}
          </StyledText>
        </StyledView>
      )}
    </StyledView>
  );
}

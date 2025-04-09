import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledTextInput = styled(TextInput);
const StyledView = styled(View);
const StyledText = styled(Text);

interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  className?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  className = '',
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  return (
    <StyledView className="w-full">
      {label && (
        <StyledText className="mb-1 text-sm font-medium text-gray-700">
          {label}
        </StyledText>
      )}
      <StyledTextInput
        className={`
          w-full
          px-4
          py-2
          rounded-lg
          border
          ${error ? 'border-red-500' : 'border-gray-300'}
          bg-white
          text-gray-900
          placeholder-gray-400
          focus:border-primary-500
          focus:ring-1
          focus:ring-primary-500
          ${multiline ? 'text-align-vertical-top' : ''}
          ${className}
        `}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#9CA3AF"
      />
      {error && (
        <StyledText className="mt-1 text-sm text-red-500">
          {error}
        </StyledText>
      )}
    </StyledView>
  );
}

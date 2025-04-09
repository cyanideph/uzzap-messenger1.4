import React from 'react';
import { View, Text as RNText, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';

interface ChatBubbleProps {
  message: string;
  isCurrentUser: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function ChatBubble({ 
  message, 
  isCurrentUser, 
  style,
  textStyle
}: ChatBubbleProps) {
  const { isDarkColorScheme } = useColorScheme();
  
  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.userContainer : isDarkColorScheme ? styles.otherContainerDark : styles.otherContainerLight,
        style
      ]}
    >
      <RNText
        style={[
          styles.text,
          isCurrentUser ? styles.userText : isDarkColorScheme ? styles.otherTextDark : styles.otherTextLight,
          textStyle
        ]}
      >
        {message || "[Empty message]"}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 12,
    minWidth: 40,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    marginVertical: 2,
  },
  userContainer: {
    backgroundColor: '#4F46E5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherContainerLight: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  otherContainerDark: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  userText: {
    color: '#FFFFFF',
  },
  otherTextLight: {
    color: '#111827',
  },
  otherTextDark: {
    color: '#FFFFFF',
  }
});
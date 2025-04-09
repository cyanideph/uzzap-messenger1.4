import React, { useEffect } from 'react';
import { View, Text, Modal as RNModal, Pressable, Animated } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(Animated.View);

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
}: ModalProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          mass: 1,
          stiffness: 200,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 bg-black/50">
        <StyledPressable
          className="flex-1"
          onPress={onClose}
        >
          <StyledView className="flex-1 items-center justify-center">
            <StyledAnimatedView
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
              className={`
                w-11/12
                max-w-md
                bg-white
                rounded-xl
                p-6
                shadow-xl
                ${className}
              `}
            >
              <StyledPressable
                onPress={(e) => e.stopPropagation()}
                className="w-full"
              >
                {title && (
                  <StyledView className="mb-4">
                    <StyledText className="text-xl font-semibold text-gray-900">
                      {title}
                    </StyledText>
                  </StyledView>
                )}
                {children}
                {showCloseButton && (
                  <StyledPressable
                    onPress={onClose}
                    className="absolute top-4 right-4"
                  >
                    <StyledText className="text-gray-400 text-lg">×</StyledText>
                  </StyledPressable>
                )}
              </StyledPressable>
            </StyledAnimatedView>
          </StyledView>
        </StyledPressable>
      </StyledView>
    </RNModal>
  );
}

interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalContent({ children, className = '' }: ModalContentProps) {
  return (
    <StyledView className={className}>
      {children}
    </StyledView>
  );
}

interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <StyledView className={`mt-6 flex-row justify-end space-x-3 ${className}`}>
      {children}
    </StyledView>
  );
} 
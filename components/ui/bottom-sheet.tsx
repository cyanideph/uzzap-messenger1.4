import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, PanResponder, Dimensions } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledAnimatedView = styled(Animated.View);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.8;
const BOTTOM_SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.2;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  className = '',
}: BottomSheetProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue({ x: 0, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > BOTTOM_SHEET_MIN_HEIGHT / 2) {
          Animated.timing(pan, {
            toValue: { x: 0, y: BOTTOM_SHEET_MAX_HEIGHT },
            duration: 300,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            damping: 15,
            mass: 1,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      pan.setValue({ x: 0, y: BOTTOM_SHEET_MAX_HEIGHT });
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        damping: 15,
        mass: 1,
        stiffness: 200,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <StyledView className="absolute inset-0">
      <StyledPressable
        className="absolute inset-0 bg-black/50"
        onPress={onClose}
      />
      <StyledAnimatedView
        style={{
          transform: [{ translateY: pan.y }],
        }}
        className={`
          absolute
          bottom-0
          left-0
          right-0
          bg-white
          rounded-t-3xl
          ${className}
        `}
        {...panResponder.panHandlers}
      >
        <StyledView className="items-center py-3">
          <StyledView className="w-12 h-1 bg-gray-300 rounded-full" />
        </StyledView>
        {title && (
          <StyledView className="px-6 pb-4">
            <StyledText className="text-xl font-semibold text-gray-900">
              {title}
            </StyledText>
          </StyledView>
        )}
        <StyledView className="px-6 pb-6">
          {children}
        </StyledView>
      </StyledAnimatedView>
    </StyledView>
  );
}

interface BottomSheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function BottomSheetContent({
  children,
  className = '',
}: BottomSheetContentProps) {
  return (
    <StyledView className={className}>
      {children}
    </StyledView>
  );
}

interface BottomSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function BottomSheetFooter({
  children,
  className = '',
}: BottomSheetFooterProps) {
  return (
    <StyledView className={`mt-6 flex-row justify-end space-x-3 ${className}`}>
      {children}
    </StyledView>
  );
} 
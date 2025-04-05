import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { Text } from './ui/text';
import { useColorScheme } from '~/lib/useColorScheme';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationComplete?: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const { isDarkColorScheme } = useColorScheme();
  const [statusText, setStatusText] = useState("CONNECTING...");
  
  // Animation values
  const scale = useSharedValue(0.2);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Start the animations
    opacity.value = withTiming(1, { duration: 800 });
    scale.value = withSequence(
      withTiming(0.8, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(1, { duration: 400, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
    );
    
    // Add subtle floating effect
    rotation.value = withRepeat(
      withSequence(
        withTiming(0.05, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(-0.05, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ), 
      -1, 
      true
    );
    
    // Add glowing effect
    glow.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500 }),
        withTiming(0.8, { duration: 1500 })
      ),
      -1,
      true
    );
    
    // Text animation sequence
    const startTextAnimations = () => {
      // Initial text fade in
      textOpacity.value = withTiming(1, { duration: 500 });
      
      // Sequence of text changes with fade transitions
      setTimeout(() => {
        textOpacity.value = withTiming(0, { duration: 300 }, () => {
          setStatusText("AUTHENTICATING...");
          textOpacity.value = withTiming(1, { duration: 300 });
        });
      }, 800);
      
      setTimeout(() => {
        textOpacity.value = withTiming(0, { duration: 300 }, () => {
          setStatusText("INITIALIZING...");
          textOpacity.value = withTiming(1, { duration: 300 });
        });
      }, 1600);
    };
    
    // Start text animations after a slight delay
    setTimeout(startTextAnimations, 300);
    
    // Notify when primary animation completes
    const timeout = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 2500);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Logo animation style
  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}rad` }
      ],
      opacity: opacity.value,
    };
  });
  
  // Glow animation style
  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(glow.value, [0.8, 1.2], [0.5, 0.8]),
      transform: [
        { scale: glow.value }
      ]
    };
  });
  
  // Text animation style
  const textAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value
    };
  });
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: '#d8e6fd' } // Match the splash screen background
    ]}>
      <View style={styles.content}>
        {/* Glow effect */}
        <Animated.View style={[styles.glow, glowStyle]} />
        
        {/* Logo */}
        <Animated.View style={logoStyle}>
          <Image
            source={require('../assets/images/splash-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        {/* Status text with animation */}
        <Animated.View style={[styles.textContainer, textAnimStyle]}>
          <Text style={styles.connectingText}>
            {statusText}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  glow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: '#22c55e',
    opacity: 0.3,
  },
  textContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  connectingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  }
}); 
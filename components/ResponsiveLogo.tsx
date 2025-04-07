import React, { useEffect } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const ResponsiveLogo = () => {
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1500 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });
  const { width } = useWindowDimensions();

  const logoSize = width < 600 ? 180 * 5 : 240 * 5; // Adjust size based on screen width

  return (
    <Animated.Image
      source={require('~/assets/images/logo.png')}
      style={[styles.logo, { width: logoSize, height: logoSize / 3 }, animatedStyle]} // Maintain aspect ratio
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    marginBottom: 16,
  },
});

export default ResponsiveLogo;
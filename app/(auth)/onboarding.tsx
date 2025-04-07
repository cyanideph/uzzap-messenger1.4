import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/auth-context';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { MessageSquare } from '~/lib/icons/MessageSquare';
import { Users } from '~/lib/icons/Users';
import { MapPin } from '~/lib/icons/MapPin';
import { ChevronRight } from '~/lib/icons/ChevronRight';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Welcome to UzZap',
    description: 'Connect with people across the Philippines in regional chatrooms.',
    icon: <MessageSquare size={80} color="#6366F1" />,
  },
  {
    id: 2,
    title: 'Join Your Community',
    description: 'Engage with people from your region and province.',
    icon: <Users size={80} color="#6366F1" />,
  },
  {
    id: 3,
    title: 'Discover Local Topics',
    description: 'Find conversations specific to your location in the Philippines.',
    icon: <MapPin size={80} color="#6366F1" />,
  },
];

export default function OnboardingScreen() {
  const { setOnboardingCompleted } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleContinue = () => {
    if (currentIndex < slides.length - 1) {
      // Move to next slide
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete onboarding
      setOnboardingCompleted(true);
      router.replace({
        pathname: '/(app)/home',
      } as any);
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted(true);
    router.replace({
      pathname: '/(app)/home',
    } as any);
  };

  return (
    <View className="flex-1 bg-background" >
      <View className="absolute top-12 right-6 z-10">
        <Badge variant="outline" className="py-1.5 px-3">
          <Text className="text-xs font-medium">{currentIndex + 1}/{slides.length}</Text>
        </Badge>
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      >
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={{ width }}
            className="flex-1 items-center justify-center p-6"
          >
            <Card className="w-full max-w-md items-center p-8 mb-6 shadow-md">
              <View className="items-center mb-10 p-6 bg-primary/10 rounded-full">
                {slide.icon}
              </View>
            </Card>
            
            <Text className="text-3xl font-bold text-center mb-4">
              {slide.title}
            </Text>
            <Text className="text-lg text-center text-muted-foreground mb-8 max-w-xs">
              {slide.description}
            </Text>
          </View>
        ))}
      </Animated.ScrollView>

      {/* Pagination */}
      <View className="flex-row justify-center mb-6">
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotStyle = useAnimatedStyle(() => {
            const width = interpolate(
              scrollX.value,
              inputRange,
              [8, 20, 8],
              'clamp'
            );
            
            const opacity = interpolate(
              scrollX.value,
              inputRange,
              [0.5, 1, 0.5],
              'clamp'
            );

            return {
              width,
              opacity,
            };
          });

          return (
            <Animated.View
              key={index}
              className="h-2 bg-primary rounded-full mx-1 shadow-md"
              style={[dotStyle]}
            />
          );
        })}
      </View>

      {/* Bottom buttons */}
      <View className="p-6 pt-0">
        <Button
          onPress={handleContinue}
          className="w-full h-12 mb-4 rounded-full"
        >
          <Text className="mr-2 text-primary-foreground font-medium">
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
          <ChevronRight size={18} className="text-primary-foreground" />
        </Button>
        
        {currentIndex < slides.length - 1 && (
          <Button
            onPress={handleSkip}
            variant="outline"
            className="w-full h-12 rounded-full"
          >
            Skip
          </Button>
        )}
      </View>
    </View>
  );
}

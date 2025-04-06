import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  
  // Persist color scheme to storage and retrieve on component mount
  useEffect(() => {
    // Load saved color scheme on initial mount
    const loadSavedColorScheme = async () => {
      try {
        const savedColorScheme = await AsyncStorage.getItem('colorScheme');
        if (savedColorScheme && savedColorScheme !== colorScheme) {
          // Ensure that the saved value is a valid color scheme
          if (savedColorScheme === 'light' || savedColorScheme === 'dark' || savedColorScheme === 'system') {
            setColorScheme(savedColorScheme);
          }
        }
      } catch (error) {
        console.error('Failed to load color scheme', error);
      }
    };
    
    loadSavedColorScheme();
  }, []);
  
  // Enhanced toggle function that persists the setting
  const persistentToggleColorScheme = () => {
    const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newColorScheme);
    
    // Save the new color scheme
    AsyncStorage.setItem('colorScheme', newColorScheme).catch(error => {
      console.error('Failed to save color scheme', error);
    });
  };

  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme: persistentToggleColorScheme,
  };
}

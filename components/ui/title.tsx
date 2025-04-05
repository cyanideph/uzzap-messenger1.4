import * as React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { cn } from '~/lib/utils';

interface TitleProps extends TextProps {
  level?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * A green-colored title component for consistent styling across the app
 */
export const Title = React.forwardRef<RNText, TitleProps>(
  ({ level = 1, className, style, ...props }, ref) => {
    // Define font sizes based on heading level
    const fontSize = {
      1: 'text-3xl',
      2: 'text-2xl',
      3: 'text-xl',
      4: 'text-lg',
      5: 'text-base',
    }[level];

    // Define font weights based on heading level
    const fontWeight = {
      1: 'font-bold',
      2: 'font-bold',
      3: 'font-semibold',
      4: 'font-semibold',
      5: 'font-medium',
    }[level];

    return (
      <RNText
        className={cn(
          fontSize,
          fontWeight,
          'text-green-600 dark:text-green-400', // Green color for both light and dark modes
          className
        )}
        style={style}
        ref={ref}
        {...props}
      />
    );
  }
);

Title.displayName = 'Title';

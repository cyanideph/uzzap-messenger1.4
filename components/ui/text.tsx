import * as Slot from '@rn-primitives/slot';
import type { SlottableTextProps, TextRef } from '@rn-primitives/types';
import * as React from 'react';
import { Text as RNText, useColorScheme } from 'react-native';
import { cn } from '~/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

interface EnhancedTextProps extends SlottableTextProps {
  variant?: 'default' | 'muted' | 'accent' | 'contrast';
  className?: string;
  text?: string;
}

const Text = React.forwardRef<TextRef, EnhancedTextProps>(
  ({ className, asChild = false, variant = 'default', text, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;
    
    // Define variant classes for better contrast
    const variantClasses = {
      default: 'text-foreground dark:text-foreground',
      muted: 'text-muted-foreground dark:text-muted-foreground',
      accent: 'text-primary dark:text-primary',
      contrast: 'text-black dark:text-white', // Maximum contrast for important text
    };
    
    return (
      <Component
        className={cn(
          'text-base web:select-text', 
          variantClasses[variant],
          textClass, 
          className
        )}
        ref={ref}
        {...props}
      >
        {text || props.children}
      </Component>
    );
  }
);
Text.displayName = 'Text';

export { Text, TextClassContext };

import * as React from 'react';
import { Keyboard, type KeyboardEvent } from 'react-native';

const EVENT_TYPE = {
  // Only keyboardDidShow and keyboardDidHide events are available on Android with 1 exception: https://reactnative.dev/docs/keyboard#addlistener
  didShow: { show: 'keyboardDidShow', hide: 'keyboardDidHide' },
  willShow: { show: 'keyboardWillShow', hide: 'keyboardWillHide' },
} as const;

/**
 * A hook for observing the state of the keyboard.
 *
 * @param {object} [options] - The options for the hook.
 * @param {keyof typeof EVENT_TYPE} [options.eventType] - The event type to listen for.
 * @returns {object} - An object containing the keyboard state and a function to dismiss the keyboard.
 * @returns {boolean} - isKeyboardVisible - A boolean indicating whether the keyboard is visible.
 * @returns {number} - keyboardHeight - The height of the keyboard.
 * @returns {function} - dismissKeyboard - A function to dismiss the keyboard.
 */
export function useKeyboard(
  { eventType = 'didShow' }: { eventType?: keyof typeof EVENT_TYPE } = { eventType: 'didShow' }
) {
  const [isKeyboardVisible, setKeyboardVisible] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    let showListener: { remove: () => void };
    let hideListener: { remove: () => void };
    try {
      showListener = Keyboard.addListener(EVENT_TYPE[eventType].show, (e: KeyboardEvent) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      });
      hideListener = Keyboard.addListener(EVENT_TYPE[eventType].hide, () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      });
    } catch (error) {
      console.error('Error adding keyboard listeners:', error);
      return;
    }

    return () => {
      showListener?.remove();
      hideListener?.remove();
    };
  }, []);

  function dismissKeyboard() {
    Keyboard.dismiss();
    setKeyboardVisible(false);
  }

  return {
    isKeyboardVisible,
    keyboardHeight,
    dismissKeyboard,
  };
}
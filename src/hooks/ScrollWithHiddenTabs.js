import React, { useRef } from 'react';
import { Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ScrollWithHiddenTabs = ({ children, ...props }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const lastValue = useRef(0);
  const isHidden = useRef(false);

  const originalTabBarStyle = {
    backgroundColor: theme.colors.light.card,
    height: 70,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    paddingTop: 4,
    margin: 12,
    borderRadius: 20,
    position: 'absolute',
  };

  const hiddenTabBarStyle = {
    ...originalTabBarStyle,
    height: 0,
    opacity: 0,
    paddingBottom: 0,
    paddingTop: 0,
    margin: 0,
  };

  useFocusEffect(() => {
    const listener = scrollY.addListener(({ value }) => {
      const direction = value > lastValue.current ? 'down' : 'up';
      const scrolledEnough = Math.abs(value - lastValue.current) > 10;

      if (!scrolledEnough) return;

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      if (direction === 'down' && !isHidden.current) {
        navigation.getParent()?.setOptions({
          tabBarStyle: hiddenTabBarStyle,
        });
        isHidden.current = true;
      } else if (direction === 'up' && isHidden.current) {
        navigation.getParent()?.setOptions({
          tabBarStyle: originalTabBarStyle,
        });
        isHidden.current = false;
      }

      lastValue.current = value;
    });

    return () => {
      scrollY.removeListener(listener);
    };
  });

  return (
    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      {...props}
    >
      {children}
    </Animated.ScrollView>
  );
};

export default ScrollWithHiddenTabs;

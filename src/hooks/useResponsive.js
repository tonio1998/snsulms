import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export default function useResponsive() {
    const [screen, setScreen] = useState(Dimensions.get('window'));

    useEffect(() => {
        const onChange = ({ window }) => setScreen(window);
        const subscription = Dimensions.addEventListener('change', onChange);
        return () => subscription?.remove();
    }, []);

    const isTablet = screen.width >= 768;
    const isLandscape = screen.width > screen.height;

    return { ...screen, isTablet, isLandscape };
}

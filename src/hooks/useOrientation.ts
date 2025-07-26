import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export function useOrientation() {
    const [isLandscape, setIsLandscape] = useState(
        Dimensions.get('window').width > Dimensions.get('window').height
    );

    useEffect(() => {
        const onChange = ({ window }) => {
            setIsLandscape(window.width > window.height);
        };

        const subscription = Dimensions.addEventListener('change', onChange);
        return () => subscription?.remove?.();
    }, []);

    return isLandscape;
}

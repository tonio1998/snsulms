import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';

export const FavoriteButton = ({ isFavorited, onToggle }) => {
    return (
        <Icon
            name={isFavorited ? 'heart' : 'heart-o'}
            size={24}
            color={isFavorited ? 'red' : 'gray'}
            onPress={onToggle}
        />
    );
};

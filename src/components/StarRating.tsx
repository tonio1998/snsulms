// src/components/StarRating.tsx

import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StarRatingProps {
	rating: number;
	size?: number;
	fullColor?: string;
	emptyColor?: string;
	style?: StyleProp<ViewStyle>;
}

const StarRating: React.FC<StarRatingProps> = ({
	                                               rating,
	                                               size = 20,
	                                               fullColor = '#13A10E',
	                                               emptyColor = '#ccc',
	                                               style,
                                               }) => {
	let fullStars = Math.floor(rating);
	const decimalPart = rating - fullStars;
	
	let hasHalfStar = false;
	if (decimalPart >= 0.75) {
		fullStars += 1;
	} else if (decimalPart >= 0.25) {
		hasHalfStar = true;
	}
	
	const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
	
	return (
		<View style={[{ flexDirection: 'row' }, style]}>
			{[...Array(fullStars)].map((_, i) => (
				<Icon key={`full-${i}`} name="star" size={size} color={fullColor} />
			))}
			{hasHalfStar && <Icon name="star-half-o" size={size} color={fullColor} />}
			{[...Array(emptyStars)].map((_, i) => (
				<Icon key={`empty-${i}`} name="star-o" size={size} color={emptyColor} />
			))}
		</View>
	);
};

export default StarRating;

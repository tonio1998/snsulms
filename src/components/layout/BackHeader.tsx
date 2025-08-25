import React, { useMemo } from 'react';
import {
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
	StatusBar, Dimensions,
} from 'react-native';
import { theme } from '../../theme';
import { CText } from '../common/CText.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

// NEW modern Gesture API imports
import {
	GestureDetector,
	Gesture,
} from 'react-native-gesture-handler';

const generateCircles = (count = 4) => {
	const fixedPositions = [
		{ top: 30, left: 20 },
		{ top: 60, left: 100 },
		{ top: 10, left: 200 },
		{ top: 50, left: 250 },
	];

	return Array.from({ length: count }).map((_, index) => {
		const size = Math.floor(Math.random() * 40) + 70;
		const { top, left } = fixedPositions[index] || { top: 0, left: 0 };

		return {
			key: `circle-${index}`,
			size,
			top,
			left,
		};
	});
};

const BackHeader = ({
						label = 'Back',
						icon = 'arrow-back',
						title,
						goTo = null,
						rightButton = null,
	style
					}) => {
	const navigation = useNavigation();
	const circles = useMemo(() => generateCircles(), []);

	const handlePress = () => {
		if (!goTo) return navigation.goBack();

		if (typeof goTo === 'string') {
			navigation.navigate(goTo);
		} else if (typeof goTo === 'object' && goTo.tab && goTo.screen) {
			navigation.navigate(goTo.tab, {
				screen: goTo.screen,
				params: goTo.params || {},
			});
		}
	};

	const blockSwipeGesture = Gesture.Pan()
		.onTouchesMove(() => {
		})
		.enabled(true);

	const width = Dimensions.get('window').width;
	return (
		<>
			<StatusBar barStyle="dark-content" />
			<GestureDetector gesture={blockSwipeGesture}>
				<View style={styles.headerWrapper}>
					<TouchableOpacity onPress={handlePress} style={styles.backButton}>
						<Icon name={icon} size={25} color={"#000"} />
					</TouchableOpacity>

					{title && (
						<View style={styles.titleContainer}>
							<CText
								fontStyle="SB"
								fontSize={theme.fontSizes.lg}
								style={[style, { width: '65%', textAlign: 'center' }]}
								numberOfLines={1}
								ellipsizeMode="middle"
							>
								{title}
							</CText>
						</View>
					)}

					{rightButton && (
						<View style={styles.rightButtonContainer}>{rightButton}</View>
					)}
				</View>
			</GestureDetector>
		</>
	);
};

const styles = StyleSheet.create({
	gradientBackground: {
		height: 120,
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		// zIndex: -1,
	},

	headerWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 60,
		zIndex: 100,
		position: 'absolute',
		top: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
		// top: 0,
		left: 0,
		right: 0,
	},

	backButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		backgroundColor: "#E8E8E8",
		alignItems: 'center',
		justifyContent: 'center',
		elevation: 0,
		shadowColor: theme.colors.light.primary
	},

	titleContainer: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'none',
		textAlign: 'center',
	},

	rightButtonContainer: {
		position: 'absolute',
		right: 16,
		// height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},

	circle: {
		position: 'absolute',
	},
});

export default BackHeader;

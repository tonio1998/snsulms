import React, { useMemo } from 'react';
import {
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
	StatusBar,
} from 'react-native';
import { theme } from '../../theme';
import { CText } from '../common/CText.tsx';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const generateCircles = (count = 2) => {
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

	return (
		<>
			<StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
			<LinearGradient
				colors={[theme.colors.light.primary + '88', 'transparent']}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				style={styles.gradientBackground}
			>
				{circles.map(({ key, size, top, left }) => (
					<View
						key={key}
						style={{
							position: 'absolute',
							width: size,
							height: size,
							borderRadius: size / 2,
							top,
							left,
							backgroundColor: 'rgba(255,255,255,0.1)',
						}}
					/>
				))}
			</LinearGradient>
				<View style={styles.headerWrapper}>
					<TouchableOpacity onPress={handlePress} style={styles.backButton}>
						<Icon name={icon} size={25} color="#000" />
					</TouchableOpacity>

					{title && (
						<View style={styles.titleContainer}>
							<CText
								fontStyle="SB"
								fontSize={18}
								style={{ color: '#000' }}
								numberOfLines={1}
							>
								{title}
							</CText>
						</View>
					)}

					{rightButton && (
						<View style={styles.rightButtonContainer}>{rightButton}</View>
					)}
				</View>
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
		// justifyContent: 'center',
		// alignItems: 'center',
		zIndex: -1,
	},

	headerWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		height: 60,
		zIndex: 100,
		position: 'absolute',
		top: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44,
		left: 0,
		right: 0,
	},

	backButton: {
		width: 40,
		height: 40,
		borderRadius: 8,
		backgroundColor: '#ffffff',
		alignItems: 'center',
		justifyContent: 'center',
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
	},

	rightButtonContainer: {
		position: 'absolute',
		right: 16,
		height: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},

	circle: {
		position: 'absolute',
	},
});

export default BackHeader;

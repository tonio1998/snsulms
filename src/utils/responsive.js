import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Define breakpoints (you can adjust)
const TABLET_WIDTH = 768;

// Functions to check device type
export const isTablet = () => width >= TABLET_WIDTH;
export const isPhone = () => width < TABLET_WIDTH;

// Function to get dimensions
export const getScreenWidth = () => width;
export const getScreenHeight = () => height;

// Optionally, get orientation
export const isLandscape = () => width > height;
export const isPortrait = () => height >= width;

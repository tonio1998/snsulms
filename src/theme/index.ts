// BLUE AND VIOLET
// primary: '#3E13DA',
//         primary_soft: '#5314E4',
//         secondary: '#921BFD',
//         secondary_soft: '#02801C',

// DARK BLUE AND VIOLET
// primary: '#3E13DA',
//         primary_soft: '#5314E4',
//         secondary: '#921BFD',
//         secondary_soft: '#02801C',

// SNSU GREEN
// primary: '#138808',
//         primary_soft: '#5314E4',
//         secondary: '#35712C',
//         secondary_soft: '#02801C',

const colors = {
    light: {
        // Backgrounds
        background: '#F9FAFB',
        surface: '#EEF4FA',
        card: '#FFFFFF',
        muted: '#F5F5F5',
        muted_soft: '#E0E0E0',

        // Text & Borders
        text: '#1A1D1F',
        border: '#D1D5DB',
        inputBackground: '#FFFFFF',

        // Primary / Secondary (single shades)
        primary: '#138808',      // Blue (trust, knowledge) for main actions
        secondary: '#144E00',    // Green (growth, progress) for secondary actions

        // Status Colors
        success: '#22C55E',
        success_soft: '#DCFCE7',
        danger: '#EF4444',
        danger_soft: '#FEE2E2',
        warning: '#F59E0B',
        warning_soft: '#FEF3C7',
        info: '#3B82F6',
        info_soft: '#DBEAFE',

        // Accents
        link: '#2563EB',
        highlight: '#FACC15',
    },


    dark: {
        background: '#000000',
        surface: '#1C1C1C',
        text: '#FFFFFF',
        inputBackground: '#222222',
        border: '#444444',
        primary: '#4CAF50',
        secondary: '#FFB74D',
        success: '#30D158',
        danger: '#FF453A',
        warning: '#FF9F0A',
        info: '#64D2FF',
        muted: '#888888',
    },
    text: {
        default: '#1C1C1E',
        muted: '#C5C5C5',
        placeholder: '#A0A0A0',
        link: '#0265E1',
    },
};

const spacing = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
};

// export const font = {
//     regular: 'Poppins-Regular',
//     medium: 'Poppins-Medium',
//     semiBold: 'Poppins-SemiBold',
//     bold: 'Poppins-Bold',
//     italic: 'Poppins-Italic',
// };

export const font = {
    regular: 'MazzardSoftH-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'MazzardSoftH-SemiBold',
    bold: 'Poppins-Bold',
    italic: 'Poppins-Italic',
};

// export const font = {
//     regular: 'Roboto-Regular',
//     medium: 'Roboto-Medium',
//     semiBold: 'Roboto-SemiBold',
//     bold: 'Roboto-Bold',
//     italic: 'Roboto-Italic',
//     light: 'Roboto-Light',
//     thin: 'Roboto-Thin',
//     black: 'Roboto-Black',
// };

export const FontFamily = 'MazzardSoftH-SemiBold';
export const FontFamilyNormal = 'MazzardSoftH-Regular';

export const radius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    xxl: 18,
    xxxl: 22,
    xxxxl: 30,
    full: 9999,
};

export const elevation = {
    none: 0,
    sm: 2,
    md: 5,
    lg: 10,
    xl: 20,
};

export const opacity = {
    disabled: 0.4,
    semi: 0.6,
    hover: 0.8,
    full: 1,
};

const FLOATING_NAV_HEIGHT = 90;
const PADDING_TOP = 20;

export const theme = {
    colors,
    spacing,
    fontSizes,
    font,
    radius,
    elevation,
    opacity, FLOATING_NAV_HEIGHT, PADDING_TOP
    
};

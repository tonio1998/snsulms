const colors = {
    light: {
        background: '#FFF',
        surface: '#E0E8F3',
        text: '#1C1C1E',
        inputBackground: '#FFF',
        border: '#DADADA',
        primary: '#008001',
        primary_soft: '#008001',
        secondary: '#007DFE',
        secondary_soft: '#DCECC7',
        success: '#34C759',
        success_soft: '#C8E6C9',
        danger: '#FF3B30',
        danger_soft: '#FFCDD2',
        warning: '#FCBE02',
        warning_soft: '#FFF3CD',
        info: '#5AC8FA',
        info_soft: '#B3E5FC',
        muted: '#F8F8F8',
        muted_soft: '#E0E0E0',
        card: "#FFF"
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

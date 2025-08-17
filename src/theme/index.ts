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

const colors = {
    light: {
        // Backgrounds
        background: '#FAFAFA',        // main app background
        surface: '#E6EDF7',           // cards, panels (slightly softer)
        card: '#FFFFFF',               // card background
        muted: '#F8F8F8',             // disabled / low-priority areas
        muted_soft: '#E6E6E6',        // secondary muted elements

        // Text & Borders
        text: '#1C1C1E',              // main readable text
        border: '#DADADA',            // subtle borders
        inputBackground: '#FFFFFF',   // form inputs

        // Primary / Secondary (for buttons, headers, highlights)
        primary: '#138808',           // darker green for main actions
        primary_soft: '#005C29',       // softer gradient variant for hover / cards
        secondary: '#004225',          // deep blue for secondary actions
        secondary_soft: '#228C22',     // softer secondary gradient

        // Status Colors
        success: '#34C759',           // confirmation / positive actions
        success_soft: '#BDF5C7',      // lighter success for backgrounds
        danger: '#FF3B30',            // errors / critical alerts
        danger_soft: '#FFBFB8',       // softer danger background
        warning: '#FCBE02',           // caution / pending alerts
        warning_soft: '#FFF3CD',      // soft warning background
        info: '#5AC8FA',              // informational messages
        info_soft: '#B3E5FC',         // soft info background

        // Additional UX-friendly accents
        link: '#007AFF',               // tappable links
        highlight: '#FFD700',          // highlights / badges
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

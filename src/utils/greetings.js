export const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 10) return "Magandang Umaga 🌅";
    if (hour >= 10 && hour < 12) return "Magandang Araw ☀️";
    if (hour >= 12 && hour < 14) return "Masarap na Tanghalian 🍽️";
    if (hour >= 14 && hour < 17) return "Magandang Hapon 🌞";
    if (hour >= 17 && hour < 20) return "Magandang Gabi 🌇";
    if (hour >= 20 && hour < 23) return "Magandang Gabi 🌙";
    return "Mabuhay 🌌";
};
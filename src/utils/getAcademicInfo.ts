import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAcademicInfo = async () => {
    try {
        const from = await AsyncStorage.getItem('AYFrom');
        const to = await AsyncStorage.getItem('AYTo');
        const semester = await AsyncStorage.getItem('Semester');
        return {
            from: from || '',
            to: to || '',
            semester: semester || ''
        };
    } catch (err) {
        console.error('Error fetching AY/Sem:', err);
        return { from: '', to: '', semester: '' };
    }
};

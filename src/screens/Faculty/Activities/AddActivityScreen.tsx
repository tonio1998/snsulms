import React, {useState, useContext, useCallback, useEffect} from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet,
    Switch,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { useAlert } from '../../../components/CAlert.tsx';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import { useFocusEffect } from '@react-navigation/native';
import { getAcademicInfo } from '../../../utils/getAcademicInfo.ts';
import { handleApiError } from '../../../utils/errorHandler.ts';
import BackHeader from '../../../components/layout/BackHeader.tsx';
import { globalStyles } from '../../../theme/styles.ts';
import { CText } from '../../../components/common/CText.tsx';
import { theme } from '../../../theme';
import { addActivity } from '../../../api/modules/activitiesApi.ts';
import {getSurveyData} from "../../../api/testBuilder/testbuilderApi.ts"; // <-- your real API path

const AddActivityScreen = ({ navigation, route }) => {
    const ClassID = route.params.ClassID;
    const FormID = route.params?.FormID;
    const ActivityTypeID = route.params.ActivityTypeID;

    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();
    const network = useContext(NetworkContext);

    const [acad, setAcad] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [formData, setFormData] = useState({});
    const [form, setForm] = useState({
        Title: '',
        Instruction: '',
        Points: '',
        DueDate: new Date(),
        StrictLate: 0,
        Duration: 0,
    });

    const getForm = async () => {
        if(!FormID) return;
        try {
            const SurveyID = FormID;
            const res = await getSurveyData({SurveyID});
            if(res){
                const totalPoints = res?.questions?.reduce((sum, question) => sum + Number(question.Points || 0), 0);
                console.log('totalPoints', totalPoints);
                setForm(prev => ({ ...prev, Points: totalPoints }));
            }
            console.log('res', res);
            setFormData(res);
        } catch (error) {
            handleApiError(error, 'Fetching data');
        }
    };

    useEffect(() => {
        getForm();
    }, [FormID]);


    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            (async () => {
                const acadInfo = await getAcademicInfo();
                const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
                if (isActive) setAcad(acadStr);
            })();
            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (!selectedDate) return;
        handleChange('DueDate', selectedDate);
        setShowTimePicker(true);
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (!selectedTime) return;

        const updated = new Date(form.DueDate);
        updated.setHours(selectedTime.getHours());
        updated.setMinutes(selectedTime.getMinutes());

        const now = new Date();
        if (updated < now) {
            Alert.alert('Invalid Time', 'Time cannot be in the past.');
            return;
        }

        handleChange('DueDate', updated);
    };


    const handleSubmit = async () => {
        if (!form.Title || !form.Points) {
            Alert.alert('Missing Fields', 'Titleand Points are required.');
            return;
        }

        if (!network?.isOnline) {
            Alert.alert('No Internet', 'You need to be online to add an activity.');
            return;
        }

        try {
            showLoading('Creating activity...');
            const payload = {
                ...form,
                Points: form.Points,
                DueDate: form.DueDate instanceof Date ? form.DueDate.toISOString() : null,
                AcademicYear: acad,
                ClassID,
                ActivityTypeID
            };

            if(FormID){
                payload.FormID = FormID;
            }

            const res = await addActivity(payload);
            if (res) {
                showAlert('success', 'Activity Added', 'The activity was successfully added.');
                navigation.goBack();
            } else {
                showAlert('error', 'Failed', res.message);
            }
        } catch (err) {
            handleApiError(err, 'Failed to add activity');
            showAlert('error', 'Error', 'An error occurred while adding the activity.');
        } finally {
            hideLoading();
        }
    };

    return (
        <>
            <BackHeader title="Add Activity" />
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={styles.container}>
                    <CText fontStyle="SB" style={styles.label}>Title</CText>
                    <TextInput
                        style={styles.input}
                        value={form.Title}
                        onChangeText={(text) => handleChange('Title', text)}
                    />

                    <CText fontStyle="SB" style={styles.label}>Instruction (Optional)</CText>
                    <TextInput
                        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                        multiline
                        value={form.Instruction}
                        onChangeText={(text) => handleChange('Instruction', text)}
                    />

                    <CText fontStyle="SB" style={styles.label}>Points</CText>
                    <TextInput
                        style={styles.input}
                        value={form.Points?.toString() || ''}
                        onChangeText={(text) => handleChange('Points', text)}
                        keyboardType="numeric"
                    />

                    {FormID && (
                        <>
                            <CText fontStyle="SB" style={styles.label}>Duration (in minutes)</CText>
                            <TextInput
                                style={styles.input}
                                value={form.Duration?.toString() || ''}
                                onChangeText={(text) => handleChange('Duration', text)}
                                keyboardType="numeric"
                            />
                        </>
                    )}

                    <CText fontStyle="SB" style={styles.label}>Due Date & Time (Optional)</CText>

                    {form.DueDate ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={[styles.input, { flex: 1 }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <CText fontSize={16}>{form.DueDate.toLocaleString()}</CText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleChange('DueDate', null)}
                                style={{
                                    marginLeft: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    backgroundColor: '#ccc',
                                    borderRadius: 6,
                                }}
                            >
                                <CText fontSize={14} fontStyle="SB" style={{ color: '#555' }}>Clear</CText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.input}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <CText fontSize={16} style={{ color: '#aaa' }}>Set Due Date</CText>
                        </TouchableOpacity>
                    )}

                    {showDatePicker && (
                        <DateTimePicker
                            value={form.DueDate || new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {showTimePicker && (
                        <DateTimePicker
                            value={form.DueDate || new Date()}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleTimeChange}
                        />
                    )}

                    <CText fontStyle="SB" style={styles.label}>Strict Late</CText>
                    <View style={styles.switchRow}>
                        <Switch
                            value={form.StrictLate === 1}
                            onValueChange={(val) => handleChange('StrictLate', val ? 1 : 0)}
                            trackColor={{ false: '#ccc', true: theme.colors.light.primary }}
                            thumbColor={form.StrictLate === 1 ? theme.colors.light.primary : '#f4f3f4'}
                        />
                        <CText fontStyle="SB" fontSize={16} style={styles.switchLabel}>
                            {form.StrictLate === 1 ? 'Enabled' : 'Disabled'}
                        </CText>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <CText fontStyle="SB" fontSize={16} style={{ color: '#fff' }}>
                            Add Activity
                        </CText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    label: {
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#000',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    switchLabel: {
        marginLeft: 10,
    },
    button: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
});

export default AddActivityScreen;

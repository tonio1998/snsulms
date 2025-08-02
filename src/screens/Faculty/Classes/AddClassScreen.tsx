import React, {useState, useContext, useCallback} from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    StyleSheet, Switch,
} from 'react-native';
import { globalStyles } from '../../../theme/styles.ts';
import { theme } from '../../../theme';
import CustomHeader from '../../../components/layout/CustomHeader.tsx';
import { CText } from '../../../components/common/CText.tsx';
import { useLoading } from '../../../context/LoadingContext.tsx';
import { NetworkContext } from '../../../context/NetworkContext.tsx';
import { useAlert } from '../../../components/CAlert.tsx';
import { addClass } from '../../../api/modules/classesApi.ts';
import BackHeader from "../../../components/layout/BackHeader.tsx";
import {handleApiError} from "../../../utils/errorHandler.ts";
import {useFocusEffect} from "@react-navigation/native";
import {getAcademicInfo} from "../../../utils/getAcademicInfo.ts";
import SmartSelectPicker from "../../../components/pickers/SmartSelectPicker.tsx"; // Adjust to your real API path

const AddClassScreen = ({ navigation }) => {
    const [form, setForm] = useState({
        CourseCode: '',
        CourseName: '',
        Section: '',
        CampusID: '5',
        Attendance: 'N',
    });

    const { showLoading, hideLoading } = useLoading();
    const { showAlert } = useAlert();
    const network = useContext(NetworkContext);
    const [acad, setAcad] = useState(null);
    const [acadRaw, setAcadRaw] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            (async () => {
                const acadInfo = await getAcademicInfo();
                const acadStr = `${acadInfo.semester}@${acadInfo.from}@${acadInfo.to}`;
                if (isActive) {
                    setAcad(acadStr);
                    setAcadRaw(acadInfo);
                }
            })();
            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!form.CourseCode || !form.CourseName || !form.Section) {
            Alert.alert('Missing Fields', 'Please fill out all required fields.');
            return;
        }

        if (!network?.isOnline) {
            Alert.alert('No Internet', 'You need to be online to add a class.');
            return;
        }

        try {
            showLoading('Creating class...');
            const formData = {
                ...form,
                AcademicYear: acad,
            };
            const res = await addClass(formData);
            if (res.success) {
                showAlert('success', 'Class Added', 'The class was successfully added.');
                navigation.goBack();
            } else {
                showAlert('error', 'Failed', res.message);
            }
        } catch (error) {
            handleApiError(error, 'Failed to add class');
            showAlert('error', 'Error', 'An error occurred while adding the class.');
        } finally {
            hideLoading();
        }
    };

    return (
        <>
            <BackHeader title="Add Class"/>
            <SafeAreaView style={globalStyles.safeArea}>
                <View style={styles.container}>
                    <CText fontStyle="SB" style={styles.label}>Course Code</CText>
                    <TextInput
                        style={styles.input}
                        value={form.CourseCode}
                        onChangeText={(text) => handleChange('CourseCode', text)}
                        autoCapitalize="characters"
                    />

                    <CText fontStyle="SB" style={styles.label}>Course Name</CText>
                    <TextInput
                        style={styles.input}
                        value={form.CourseName}
                        onChangeText={(text) => handleChange('CourseName', text)}
                    />

                    <CText fontStyle="SB" style={styles.label}>Section</CText>
                    <TextInput
                        style={styles.input}
                        value={form.Section}
                        onChangeText={(text) => handleChange('Section', text)}
                        autoCapitalize="characters"
                    />

                    <CText fontStyle="SB" style={styles.label}>Campus ID</CText>
                    {/*<TextInput*/}
                    {/*    style={styles.input}*/}
                    {/*    value={form.CampusID}*/}
                    {/*    onChangeText={(text) => handleChange('CampusID', text)}*/}
                    {/*    keyboardType="numeric"*/}
                    {/*/>*/}

                    <View style={{ zIndex: 9999, position: 'relative' }}>
                        <SmartSelectPicker
                            value={form.CampusID}
                            onValueChange={(value) => handleChange('CampusID', value)}
                            apiUrl="/select/campus"
                            labelKey="CampusName"
                            valueKey="CampusID"
                            placeholder="Select Campus"
                        />
                    </View>

                    <CText fontStyle="SB" style={styles.label}>Attendance</CText>
                    <View style={styles.switchRow}>
                        <Switch
                            value={form.Attendance === 'Y'}
                            onValueChange={(value) =>
                                handleChange('Attendance', value ? 'Y' : 'N')
                            }
                            trackColor={{ false: '#ccc', true: theme.colors.light.primary }}
                            thumbColor={form.Attendance === 'Y' ? theme.colors.light.primary : '#f4f3f4'}
                        />
                        <CText fontStyle="SB" fontSize={16} style={styles.switchLabel}>
                            {form.Attendance === 'Y' ? 'Enabled (Y)' : 'Disabled (N)'}
                        </CText>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <CText fontStyle="SB" fontSize={16} style={{ color: '#fff' }}>
                            Add Class
                        </CText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    switchLabel: {
        marginLeft: 10,
    },
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
        borderRadius: theme.radius.xs,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        color: '#000',
    },
    attendanceToggle: {
        padding: 14,
        backgroundColor: '#eee',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 6,
    },
    button: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 12,
        borderRadius: theme.radius.xs,
        alignItems: 'center',
        marginTop: 30,
    },
});

export default AddClassScreen;

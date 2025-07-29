import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    useColorScheme,
    TouchableOpacity, Image,
    Alert,
    ActivityIndicator, SafeAreaView, ScrollView
} from 'react-native';
import {theme} from "../../theme";
import {globalStyles} from "../../theme/styles.ts";
import Icon from 'react-native-vector-icons/Ionicons';
import { loginWithGoogle, signup } from '../../api/modules/auth.ts';
import { CText } from '../../components/common/CText.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext.tsx';
import { handleApiError } from '../../utils/errorHandler.ts';
import { useAlert } from '../../components/CAlert.tsx';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useLoading } from '../../context/LoadingContext.tsx';


const SignupForm = ({ navigation }: any) => {
    const isDarkMode = useColorScheme() === 'light';
    const { showLoading, hideLoading } = useLoading();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginAuth } = useAuth();
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('skilled_worker');
    const { showAlert } = useAlert();
    
    const [items, setItems] = useState([
        { label: 'Home Owner', value: 'homeowner' },
        { label: 'Skilled Worker', value: 'skilled_worker' },
    ]);
    const handSignup = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Name, Email and password are required.');
            return;
        }

        setLoading(true);

        try {
            const requestData = {
                name : name,
                email : email,
                password : password,
                role : value
            };
            // console.log('requestData', requestData);
            const response = await signup(requestData);
            if(response.status === 200) {
                await loginAuth(response.data);
                await AsyncStorage.setItem('isLoggedIn', 'true');
                await AsyncStorage.setItem("authToken", response.data.token);
            }
        } catch (error: any) {
            // Alert.alert('Login Failed', error.response?.data?.message);
            showAlert('error', 'Login Failed', error.response?.data?.message);
            // handleApiError(error, 'Signup');
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signOut();
        try {
            const userInfo = await GoogleSignin.signIn();
            console.log(userInfo);
            
            showLoading('Logging in...');
            const user = userInfo?.data?.user;
            const idToken = userInfo?.data?.idToken;
            
            const response = await loginWithGoogle({
                token: idToken,
                name: user.name,
                email: user.email,
                photo: user.photo,
            });
            const data = response.data;
            await loginAuth(data);
            
        } catch (error) {
            console.error('Google login error:', error.response?.data || error.message);
            handleApiError(error, 'Login');
        } finally {
            hideLoading();
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.light.card }}>
           <ScrollView
                contentContainerStyle={{ paddingBottom: theme.FLOATING_NAV_HEIGHT, paddingTop: theme.PADDING_TOP }}
            >
               <View style={[styles.container]}>
                   <View style={globalStyles.bgTopCircle} />
                   <View style={globalStyles.bgBottomCircle} />
                   <TouchableOpacity
                                onPress={() => navigation.replace('LoginOptions')}
                                style={styles.back}
                            >
                        <Icon name="arrow-back" size={24} color="#000" />
                        <Text style={[styles.backText, {fontWeight: 800}]}>Back</Text>
                    </TouchableOpacity>
                   
                   <View style={styles.topSection}>
                       <CText fontSize={38} fontStyle={'B'} style={[{ marginBottom: 0, color: theme.colors.light.primary }]}>Sign Up</CText>
                       <CText style={{ color: theme.colors.light.primary, marginBottom: 10 }}>Sign up to continue</CText>
                   </View>
                   <View style={{ padding: 24 }}>
                       <CText fontSize={16} style={{ color: '#000', marginBottom: 5, fontWeight: 600}}>Full Name</CText>
                       <TextInput
                           placeholder="Name"
                           placeholderTextColor={'#838383'}
                           style={[globalStyles.input]}
                           value={name}
                           onChangeText={setName}
                           autoCapitalize="none"
                       />
                       
                       <CText fontSize={16} style={{ color: '#000', marginBottom: 5, fontWeight: 600}}>Email</CText>
                       
                       <TextInput
                           placeholder="Email"
                           placeholderTextColor={'#838383'}
                           style={[globalStyles.input]}
                           value={email}
                           onChangeText={setEmail}
                           keyboardType="email-address"
                           autoCapitalize="none"
                       />
                       
                       <CText fontSize={16} style={{ color: '#000', marginBottom: 5, fontWeight: 600}}>Password</CText>
                       <TextInput
                           placeholder="Password"
                           placeholderTextColor={'#838383'}
                           style={[globalStyles.input]}
                           value={password}
                           onChangeText={setPassword}
                           secureTextEntry
                       />
                       
                       <TouchableOpacity
                           style={[styles.button, globalStyles.shadowBtn]}
                           onPress={handSignup}
                           activeOpacity={0.8} disabled={loading}
                       >
                           {loading ? (
                               <ActivityIndicator color="#fff" />
                           ) : (
                               <CText fontSize={16} style={[styles.buttonText, {color: '#fff', fontWeight: 'bold'}]}>Sign Up</CText>
                           )}
                       </TouchableOpacity>
                       
                       <View style={globalStyles.divider}>
                           <View style={globalStyles.line} />
                           <Text style={globalStyles.dividerText}>or with</Text>
                           <View style={globalStyles.line} />
                       </View>
                       
                       <View style={globalStyles.socialButtonRow}>
                           <TouchableOpacity onPress={handleGoogleLogin} style={[globalStyles.socialButton, { boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' }]}>
                               <Icon name="logo-google" size={24} color="#DB4437" />
                           </TouchableOpacity>
                       </View>
                   </View>
               
               </View>
           </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    topSection: {
        alignItems: 'center',
        // marginTop: 100,
    },
    button: {
        backgroundColor: theme.colors.light.primary,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: theme.radius.sm,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    back: {
		margin: 30,
		marginTop: 60,
		flexDirection: 'row',
		alignItems: 'center',
		elevation: 15,
		shadowColor: theme.colors.light.primary,
		padding: 10,
		width: 100,
		backgroundColor: '#fff',
		borderRadius: 8
	},
    backText: {
		color: '#000',
		marginLeft: 8,
		fontSize: 16,
		fontWeight: '500',
	},
    container: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 24,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 16,
    },
    buttonContainer: {
        marginTop: 10,
    },
});

export default SignupForm;

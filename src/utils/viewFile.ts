import { Alert, Linking, Platform, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { handleApiError } from './errorHandler.ts';
import { FILE_BASE_URL } from '../api/api_configuration.ts';
import { useAlert } from '../components/CAlert.tsx';

export const viewFile = async (filePath: string, fileName: string) => {
    try {
        const FILE_LOCATION = `${FILE_BASE_URL}/${filePath}`;
        const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        const exists = await RNFS.exists(localPath);

        if (!exists) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('Downloading file...', ToastAndroid.SHORT);
            } else {
                Alert.alert('Downloading', 'Your file is being downloaded.');
            }

            const result = await RNFS.downloadFile({
                fromUrl: FILE_LOCATION,
                toFile: localPath,
            }).promise;

            if (result.statusCode !== 200) throw new Error('Download failed');
        }

        if (Platform.OS === 'android') {
            ToastAndroid.show('File ready, opening...', ToastAndroid.SHORT);
        } else {
            Alert.alert('Ready', 'The file is ready to view.');
        }

        await FileViewer.open(localPath, {
            showOpenWithDialog: false,
        });
    } catch (error) {
        // console.error('Error opening file:', error);
        Alert.alert('Error', 'Cannot open file. Make sure you have an app installed that can handle this file type.');
        // showAlert('error', 'Error', 'Cannot open file. Make sure you have an app installed that can handle this file type.');
        // handleApiError(error);
    }
};

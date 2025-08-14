import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { ToastAndroid, Alert, Platform } from 'react-native';
import { API_BASE_URL } from "../../env.ts";
import { handleApiError } from "./errorHandler.ts";
import api from "../api/api.ts";

export const viewFile = async (filePath: string, fileName: string) => {

    const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    try {
        const fileExists = await RNFS.exists(localPath);
        if (fileExists) {
            const stats = await RNFS.stat(localPath);
            if (stats.size === 0) {
                throw new Error('Local file is empty.');
            }

            Platform.OS === 'android'
                ? ToastAndroid.show('Opening file...', ToastAndroid.SHORT)
                : Alert.alert('Info', 'Opening file...');

            await FileViewer.open(localPath, { showOpenWithDialog: false });
            return;
        }

        const response = await api.get(`${API_BASE_URL}/temp-url`, {
            params: { path: filePath },
        });

        if(!response){
            ToastAndroid.show('Download failed. Maybe the file is not exist.', ToastAndroid.SHORT);
            return;
        }

        const FILE_LOCATION = response.data.url;

        const result = await RNFS.downloadFile({
            fromUrl: FILE_LOCATION,
            toFile: localPath,
        }).promise;

        if (result.statusCode !== 200) {
            ToastAndroid.show('Download failed. Maybe the file is not exist.', ToastAndroid.SHORT);
            return;
        }

        const stats = await RNFS.stat(localPath);
        if (!stats || stats.size === 0) {
            throw new Error('Downloaded file is empty.');
        }

        Platform.OS === 'android'
            ? ToastAndroid.show('Opening file...', ToastAndroid.SHORT)
            : Alert.alert('Info', 'Opening file...');

        await FileViewer.open(localPath, { showOpenWithDialog: false });

    } catch (error) {
        ToastAndroid.show(
            `The file "${fileName}" may have been moved or deleted.`,
            ToastAndroid.SHORT
        );

    }
};

import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { ToastAndroid, Alert, Platform } from 'react-native';
import {API_BASE_URL} from "../../env.ts";
import {handleApiError} from "./errorHandler.ts";
import api from "../api/api.ts";

export const viewFile = async (filePath: string, fileName: string) => {
    // ToastAndroid.show('Please wait...', ToastAndroid.SHORT);
    try {
        const response = await api.get(`${API_BASE_URL}/temp-url`, {
            params: { path: filePath },
        });

        const FILE_LOCATION = response.data.url;
        const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        console.log('Downloading from:', FILE_LOCATION);

        // Step 2: Download file
        const result = await RNFS.downloadFile({
            fromUrl: FILE_LOCATION,
            toFile: localPath,
        }).promise;

        if (result.statusCode !== 200) {
            throw new Error(`Download failed: ${result.statusCode}`);
        }

        const stats = await RNFS.stat(localPath);
        if (!stats || stats.size === 0) {
            throw new Error('Downloaded file is empty.');
        }

        ToastAndroid.show('Opening file...', ToastAndroid.SHORT);
        await FileViewer.open(localPath, {
            showOpenWithDialog: false,
        });

    } catch (error) {
        handleApiError(error, 'Download');
    }
};

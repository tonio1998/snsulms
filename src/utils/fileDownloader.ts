import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import { Platform, Alert } from 'react-native';
import { handleApiError } from './errorHandler.ts';

export const downloadAndOpenPDF = async (fileUrl: string, fileName: string): Promise<void> => {
	try {
		const localPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;

		// console.log('fileUrl', fileUrl);
		const result = await RNFS.downloadFile({
			fromUrl: fileUrl,
			toFile: localPath,
		}).promise;

		if (result.statusCode === 200) {
			await FileViewer.open(localPath);
		} else {
			// throw new Error(`Download failed with status code ${result.statusCode}`);
		}
	} catch (error: any) {
		// handleApiError(error, 'Load Quiz');
	}
};

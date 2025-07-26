import { Alert } from 'react-native';
import { showAlert } from '../components/CAlert'; 

export const handleConfirmationAction = ({
    title = 'Confirmation',
    message,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    onConfirm,
    onSuccess,
    successMessage,
    showToast = true,
    refetch,
}) => {
    try {
        Alert.alert(
            title,
            message,
            [
                {
                    text: cancelText,
                    style: 'cancel',
                },
                {
                    text: confirmText,
                    onPress: async () => {
                        try {
                            await onConfirm();
                            if (refetch) refetch();
                            if (showToast && successMessage) {
                                showAlert('success', 'Success', successMessage);
                            }
                            if (onSuccess) onSuccess();
                        } catch (err) {
                            handleApiError(err, title || 'Action Failed');
                        }
                    },
                },
            ]
        );
    } catch (err) {
        handleApiError(err, title || 'Action Failed');
    }
};

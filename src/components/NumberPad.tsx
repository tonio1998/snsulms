import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableNativeFeedback,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = {
    onPress: (digit: string) => void;
    onDelete: () => void;
    onSubmit?: () => void;
    showSubmit?: boolean;
};

export default function NumberPad({ onPress, onDelete, onSubmit, showSubmit }: Props) {
    let keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Dynamically insert "submit" before "0"
    if (showSubmit) {
        keys.push('submit');
    } else {
        keys.push('');
    }

    keys.push('0', 'del');

    return (
        <View style={styles.container}>
            {keys.map((key, index) => {
                const isDelete = key === 'del';
                const isSubmit = key === 'submit';

                return (
                    <View key={index} style={styles.keyWrapper}>
                        <TouchableNativeFeedback
                            onPress={() => {
                                if (isDelete) onDelete();
                                else if (isSubmit && onSubmit) onSubmit();
                                else if (key !== '') onPress(key);
                            }}
                            background={TouchableNativeFeedback.Ripple('#C2EBA6', false, 35)}
                            useForeground={true}
                        >
                            <View
                                style={[
                                    styles.key,
                                ]}
                            >
                                {isDelete ? (
                                    <Icon name="backspace-outline" size={28} />
                                ) : isSubmit ? (
                                    <Icon name="send" size={28} />
                                ) : (
                                    <Text style={styles.keyText}>{key}</Text>
                                )}
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                );
            })}
        </View>
    );
}



const styles = StyleSheet.create({
    submitButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 12,
    },
    submitText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },

    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 300,
        backgroundColor: '#fff',
    },
    keyWrapper: {
        width: 110,
        height: 65,
        margin: 5,
        overflow: 'hidden', // Required for ripple clipping
        borderRadius: 12,
    },
    key: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});

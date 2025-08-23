import React, { useEffect, useRef, useState } from "react";
import {
    Modal,
    TouchableOpacity,
    Animated,
    StyleSheet,
    ViewStyle,
    TextStyle,
    StatusBar,
    View,
} from "react-native";
import { CText } from "./common/CText";
import Icon from "react-native-vector-icons/Ionicons";
import { BlurView } from "@react-native-community/blur";
import { theme } from "../theme";

interface Option {
    label: string;
    value: string;
    icon?: string;
}

interface OptionModalProps {
    visible: boolean;
    onClose: () => void;
    options: Option[];
    onSelect: (value: string) => void;
    containerStyle?: ViewStyle;
    optionStyle?: ViewStyle;
    textStyle?: TextStyle;
}

const OptionModal: React.FC<OptionModalProps> = ({
                                                     visible,
                                                     onClose,
                                                     options,
                                                     onSelect,
                                                     containerStyle,
                                                     optionStyle,
                                                     textStyle,
                                                 }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true); // Mount modal
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setShowModal(false)); // Unmount after animation
        }
    }, [visible]);

    if (!showModal) return null;

    return (
        <Modal transparent visible={showModal} animationType="none" statusBarTranslucent>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="dark"
                    blurAmount={1}
                    reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
                />
            </TouchableOpacity>

            <View style={styles.bottomWrapper}>
                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY: slideAnim }] },
                        containerStyle,
                    ]}
                >
                    {options.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.option, optionStyle]}
                            onPress={() => onSelect(option.value)}
                        >
                            {option.icon && <Icon name={option.icon} size={20} color="#333" />}
                            <CText
                                fontStyle="SB"
                                fontSize={15}
                                style={[{ marginLeft: option.icon ? 10 : 0 }, textStyle]}
                            >
                                {option.label}
                            </CText>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <CText fontStyle="SB" fontSize={15} style={{ color: "#ff5555" }}>
                        Cancel
                    </CText>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default OptionModal;

const styles = StyleSheet.create({
    bottomWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        paddingHorizontal: 24,
        elevation: 2,
        shadowColor: theme.colors.light.primary,
        maxHeight: "75%",
        flexGrow: 1,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    cancelButton: {
        marginTop: 10,
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 16,
        alignItems: "center",
        elevation: 2,
        shadowColor: theme.colors.light.primary,
    },
});

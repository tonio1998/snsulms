import React from 'react';
import { Image, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../theme/styles.ts';
import { CText } from './CText.tsx';
import { APP_NAME } from '../api/api_configuration.ts';
import { theme } from '../theme';

const QRGenerator = ({ value, size = 200 }) => {
    return (
        <View>
            <QRCode
                value={value}
                size={size}
                logo={require('../../assets/img/ic_launcher.png')}
                logoSize={50}
                logoBackgroundColor='transparent'
                logoMargin={2}
            />
        </View>
    );
};

export default QRGenerator;

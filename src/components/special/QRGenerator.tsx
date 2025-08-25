import React from 'react';
import { Image, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { globalStyles } from '../../theme/styles.ts';
import { CText } from '../common/CText.tsx';
import { APP_NAME } from '../../../env.ts';
import { theme } from '../../theme';

const QRGenerator = ({ value, size = 200 }) => {
    return (
        <View>
            <QRCode
                value={value}
                size={size}
                backgroundColor="#FFFFFF"
                logo={require('../../../assets/img/ic_launcher.png')}
                logoSize={50}
                logoBackgroundColor="transparent"
                logoMargin={2}
                ecl="H"
            />
        </View>
    );
};

export default QRGenerator;

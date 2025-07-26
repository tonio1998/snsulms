import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu, Button } from 'react-native-paper';

const suffixOptions = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V', 'None'];

const SuffixDropdown = ({ form, handleChange }) => {
    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    return (
        <View style={{ marginVertical: 10 }}>
            <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={openMenu}
                        textColor={form.Suffix ? '#000' : '#ccc'}
                        style={{ borderColor: '#ccc' }}
                    >
                        {form.Suffix || 'Select Suffix'}
                    </Button>
                }
            >
                {suffixOptions.map((suffix) => (
                    <Menu.Item
                        key={suffix}
                        onPress={() => {
                            handleChange('Suffix', suffix === 'None' ? '' : suffix);
                            closeMenu();
                        }}
                        title={suffix}
                    />
                ))}
            </Menu>
        </View>
    );
};

export default SuffixDropdown;

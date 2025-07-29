import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { CText } from './common/CText.tsx';
import { globalStyles } from '../theme/styles.ts';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';

interface FileItem {
    FilePath: string;
    FileName: string;
    size: number;
    file_details: {
        type: string;
    };
}

interface GroupedFileListProps {
    files: FileItem[];
    onView: (filePath: string, fileName: string) => void;
    getFileSize: (size: number) => string;
    showDeleteButton?: boolean;
    onDelete?: (file: FileItem) => void;
}

const GroupedFileList: React.FC<GroupedFileListProps> = ({
                                                             files,
                                                             onView,
                                                             getFileSize,
                                                             showDeleteButton = false,
                                                             onDelete,
                                                         }) => {
    const groupedFiles = files.reduce((groups: Record<string, FileItem[]>, file) => {
        const type = file.file_details.type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(file);
        return groups;
    }, {});

    if (Object.keys(groupedFiles).length === 0) {
        return <CText fontSize={16}>No files uploaded yet.</CText>;
    }

    return (
        <>
            {Object.entries(groupedFiles).map(([type, group]) => (
                <View key={type}>
                    <CText fontSize={16} style={{ fontWeight: 'bold', marginBottom: 4 }}>{type}</CText>
                    {group.map((file, index) => (
                        <TouchableOpacity
                            key={file.FilePath + index}
                            style={[globalStyles.card, globalStyles.cardSpacing]}
                            onPress={() => onView(file.FilePath, file.FileName)}
                        >
                            <View style={globalStyles.cardRow}>
                                <View>
                                    <CText fontSize={16} numberOfLines={1} style={{ fontWeight: 'bold', width: 250 }}>{file.FileName}</CText>
                                    <CText fontSize={14}>{getFileSize(file.size)}</CText>
                                </View>
                                {showDeleteButton && (
                                    <TouchableOpacity onPress={() => onDelete?.(file)}>
                                        <View style={[globalStyles.cardFooter, { alignItems: 'flex-end', marginTop: 8, marginRight: 10, borderWidth: 1, padding: 4, borderColor: theme.colors.light.danger, borderRadius: 5 }]}>
                                            <Icon name="trash" size={20} color="red" />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </>
    );
};

export default GroupedFileList;

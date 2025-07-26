import React, { createContext, useContext, useState, ReactNode } from 'react';
import Loading from '../components/Loading.tsx';
import {Alert, ToastAndroid} from "react-native";

interface LoadingContextType {
    showLoading: (text?: string) => void;
    hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const showLoading = (text: string) => {
        setLoadingText(text);
        setLoading(true);
    };

    const hideLoading = () => {
        setLoading(false);
    };

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading }}>
            {children}
            {/*<Loading loading={loading} text={loadingText} />*/}
            <Loading
                loading={loading}
                text={loadingText}
                onTimeout={(msg) => {
                    ToastAndroid.show(msg, ToastAndroid.SHORT);
                    setLoading(false);
                }}
            />

        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

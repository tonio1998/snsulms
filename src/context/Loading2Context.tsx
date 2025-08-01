import React, { createContext, useContext, useState, ReactNode } from 'react';
import Loading from '../components/loaders/Loading.tsx';
import {Alert, ToastAndroid} from "react-native";
import Loading2 from "../components/loaders/Loading2.tsx";

interface Loading2ContextType {
    showLoading2: (text?: string, bottom?: number) => void;
    hideLoading2: () => void;
}

const Loading2Context = createContext<Loading2ContextType | undefined>(undefined);

export const Loading2Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [bottom, setBottom] = useState(65);

    const showLoading2 = (text = '', newBottom?: number) => {
        if (newBottom !== undefined) setBottom(newBottom);
        setLoadingText(text);
        setLoading(true);
    };


    const hideLoading2 = () => {
        setLoading(false);
    };

    return (
        <Loading2Context.Provider value={{ showLoading2, hideLoading2 }}>
            {children}
            {/*<Loading loading={loading} text={loadingText} />*/}
            <Loading2
                loading={loading}
                text={loadingText}
                bottom={
                    bottom > 0
                        ? 65
                        : bottom === -1
                            ? 0
                            : 65
                }
                onTimeout={(msg) => {
                    ToastAndroid.show(msg, ToastAndroid.SHORT);
                    setLoading(false);
                }}
            />

        </Loading2Context.Provider>
    );
};

export const useLoading2 = (): Loading2ContextType => {
    const context = useContext(Loading2Context);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};

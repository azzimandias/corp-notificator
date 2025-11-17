import {createContext, useContext} from 'react';
import type {AlertInfo, UserData} from "../types/types.ts";

interface NotificationSocketContextType {
    connected: boolean;
    connectionStatus: string;
    isAlertVisibleKey: number;
    alertInfo: AlertInfo;

    userdata: UserData | null;
    setUserData: (data: UserData) => void;

    HTTP_HOST: string | null;
    SET_HTTP_HOST: (host: string) => void;
    CSRF_TOKEN: string | null;
    SET_CSRF_TOKEN: (token: string) => void;
    PRODMODE: boolean | null;
    SET_PRODMODE: (mode: boolean) => void;
    SET_BFF_PORT: (port: number) => void;

    setSubscribeToNotificationPath: (path: string | null) => void;
    setNewNotificationPath: (path: string | null) => void;
    setReadNotificationPath: (path: string | null) => void;

    init: boolean;
    setInit: (bool: boolean) => void;
    refreshKey: number;
}

export const NotificatorSocketContext = createContext<NotificationSocketContextType | undefined>(undefined);

export const useNotificationSocket = () => {
    const context = useContext(NotificatorSocketContext);
    if (!context) throw new Error('useNotificationSocket must be used within NotificationSocketProvider');
    return context;
};

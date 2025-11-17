import React, {useCallback, useEffect, useRef, useState} from "react";
import {io, Socket} from "socket.io-client";
import type {AlertInfo, UserData} from "../types/types";
import dayjs from "dayjs";
import axios from "axios";
import { NotificatorSocketContext } from "../context/NotificatorSocketContext";

export const NotificationSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');

    const [userdata, setUserData ] = useState<UserData | null>(null);
    const userdataRef = useRef<UserData | null>(userdata);

    const [HTTP_HOST, SET_HTTP_HOST] = useState<string>('');
    const [CSRF_TOKEN, SET_CSRF_TOKEN] = useState<string>('');
    const [PRODMODE, SET_PRODMODE] = useState<boolean>(false);
    const [BFF_PORT, SET_BFF_PORT] = useState<number>(0);

    const [subscribeToNotificationPath, setSubscribeToNotificationPath] = useState<string | null>(null);
    const [newNotificationPath, setNewNotificationPath] = useState<string | null>(null);
    const [readNotificationPath, setReadNotificationPath] = useState<string | null>(null);

    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [isAlertVisibleKey, setIsAlertVisibleKey] = useState<number>(0);
    const [alertInfo, setAlertInfo] = useState<AlertInfo>({
        message: '',
        description: '',
        type: 'info',
    });

    const [init, setInit] = useState<boolean>(false);

    const connect = useCallback(() => {
        if (!PRODMODE || !BFF_PORT || !HTTP_HOST || !CSRF_TOKEN) {
            return;
        }
        if (socketRef.current?.connected) {
            socketRef.current.disconnect();
        }
        const socket = init ? io(`${HTTP_HOST}:${BFF_PORT}`, { transports: ['websocket', 'polling'], withCredentials: true }) : null;
        socketRef.current = socket;
        if (!socket) return;
        // --- подключение к ws и подписка ---
        socket.on('connect', () => {
            console.log('CHAT WEBSOCKET CONNECTED')
            setConnected(true);
            setConnectionStatus('connected');
            const userId = userdataRef.current?.user?.id;
            if (!userId) {
                console.error('User ID is undefined');
                return;
            }
            socket.emit(subscribeToNotificationPath ?? '', userId);
        });
        socket.on(newNotificationPath ?? '', (data) => {
            console.log('WS new:notification', data);
            setRefreshKey(dayjs().unix());
            setIsAlertVisibleKey(dayjs().unix());
            setAlertInfo({
                message: 'Новое уведомление.',
                description: data.message,
                type: 'info',
            });
        });
        socket.on(readNotificationPath ?? '', () => {
            setRefreshKey(dayjs().unix());
        });
        socket.on('disconnect', () => {
            console.log('CHAT WEBSOCKET DISCONNECTED');
            setConnected(false);
            setConnectionStatus('disconnected');
        });
        socket.on('connect_error', () => {
            console.log('CHAT WEBSOCKET CONNECT ERROR');
        });
    }, [init, PRODMODE, BFF_PORT, HTTP_HOST, CSRF_TOKEN, subscribeToNotificationPath, newNotificationPath, readNotificationPath]);


    useEffect(() => {
        /*console.log('init', init)*/
        if (init && userdata && HTTP_HOST && BFF_PORT && CSRF_TOKEN) {
            /*console.log('Attempting to connect with:', { HTTP_HOST, BFF_PORT, userdata });*/
            const timer = setTimeout(() => {
                connect();
            },0);

            return () => {
                clearTimeout(timer);
                console.log('Cleaning up socket connection');
                socketRef.current?.disconnect();
            };
        } else {
            console.log('Connection conditions not met:', {
                hasUserdata: !!userdata,
                hasHTTP_HOST: !!HTTP_HOST,
                hasBFF_PORT: !!BFF_PORT,
                hasCSRF_TOKEN: !!CSRF_TOKEN
            });
        }
    }, [userdata, HTTP_HOST, BFF_PORT, CSRF_TOKEN, init, connect]);

    useEffect(() => {
        if (!HTTP_HOST) return;
        /*console.log('SET_PROD_AXIOS_INSTANCE')*/
        const instance = axios.create({
            baseURL: HTTP_HOST,
            timeout: 300000,
        });
        console.log(instance);
    }, [HTTP_HOST]);
    useEffect(() => {
        if (!userdata) return;
        /*console.log('userdataRef')*/
        userdataRef.current = userdata;
    }, [userdata]);

    return (
        <NotificatorSocketContext.Provider
            value={{

                connected,
                connectionStatus,

                isAlertVisibleKey,
                alertInfo,

                userdata,

                HTTP_HOST,
                CSRF_TOKEN,
                PRODMODE,

                setUserData,

                SET_HTTP_HOST,
                SET_CSRF_TOKEN,
                SET_PRODMODE,
                SET_BFF_PORT,

                setSubscribeToNotificationPath,
                setNewNotificationPath,
                setReadNotificationPath,

                init,
                setInit,
                refreshKey,
            }}
        >
            {children}
        </NotificatorSocketContext.Provider>
    );
};

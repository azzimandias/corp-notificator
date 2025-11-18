// src/index.ts - точка входа для библиотеки
export { default as Notificator } from './Notificator';
export { useNotificationSocket } from './NOTIFICATOR/context/NotificatorSocketContext';
export { NotificationSocketProvider } from './NOTIFICATOR/provider/NotificationProvider';
export type {
    NotificatorParams,
    UserData,
    User,
    Company,
    Place,
    HttpParams,
    SocketActions,
    SocketSubscribe,
    Notification
} from './NOTIFICATOR/types/types.ts';

// Default export
export { default } from './Notificator';

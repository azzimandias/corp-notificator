import { Button, Drawer } from 'antd';
import {useCallback, useEffect, useState} from 'react';
import NotiCard from './NotiCard';
import { MOCK_NOTICES } from '../mock/mock';
import {useNotificationSocket} from "../context/NotificatorSocketContext";
import type {Notification} from "../types/types";

interface FreshResponse {
    count?: number;
    message: string;
    status: number;
    data: Notification[];
}

/**
 * Компонент нотификации - показывает уведомления, присланные с бэка
 * @param {object} params - объект конфигурации
 * @param {boolean} params.is_open - статус
 * @param {function} params.on_count_change - коллбек при изменении количества уведомлений
 * @param {function} params.on_close - коллбек на закрытие
 * @returns
 */
const NotifierDrawer = ({is_open, on_count_change, on_close}: {
    is_open: boolean;
    on_count_change: (count: number) => void;
    on_close: () => void;
}) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [noticePage, setNoticePage] = useState<number>(1);
    const [noticeIgnore, setNoticeIgnore] = useState<number[]>([]);
    const [countOfNewNotifications, setCountOfNewNotifications] = useState<number>(0);

    const [notificatorOpened, setNotificatorOpened] = useState<boolean>(false);
    const [notificatorLoading, setNotificatorLoading] = useState<boolean>(true);

    const {
        PRODMODE,
        CSRF_TOKEN,
        refreshKey,  // провоцирует refetch
    } = useNotificationSocket();

    const notificationRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id
                    ? { ...notification, is_read: true }
                    : notification
            )
        );
        markNoteRead(id);
        setCountOfNewNotifications(countOfNewNotifications - 1);
    };

    const markNoteRead = useCallback(async (note_id: number) => {
        if (!PRODMODE || !CSRF_TOKEN) return;
        try {
            await fetch('/api/notice/read/' + note_id + '?_token=' + CSRF_TOKEN, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN ?? '',
                },
                body: JSON.stringify({
                    data: note_id,
                    _token: CSRF_TOKEN,
                }),
            });
        } catch (e) {
            console.log(e);
        }
    }, [CSRF_TOKEN, PRODMODE]);

    const getFreshNotices = useCallback(async ()=> {
        try {
            if (!PRODMODE || !CSRF_TOKEN) return;
            const response = await fetch('/api/notice/fresh' + '?_token=' + CSRF_TOKEN);
            const responseData: FreshResponse = await response.json();

            setNotifications(responseData.data);
            const ignore: number[] = [];
            for (let i = 0; i < responseData.data.length; i++){
                ignore.push(responseData.data[i].id);
            }
            setNoticeIgnore(ignore);
            setCountOfNewNotifications(ignore.length);
        } catch (e) {
            console.log(e);
        }
    }, [CSRF_TOKEN, PRODMODE]);


    const getOldNotices = useCallback(async ()=> {
        if (!PRODMODE || !CSRF_TOKEN) return;
        try {
            const response = await fetch('/api/notice/old?_token=' + CSRF_TOKEN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': CSRF_TOKEN ?? '',
                },
                body: JSON.stringify({
                    page: noticePage,
                    ignore: noticeIgnore,
                    _token: CSRF_TOKEN
                }),
            });
            const responseData: FreshResponse = await response.json();
            if (responseData.data.length){
                setNoticePage(noticePage + 1);
                setNotifications(prev => [...prev, ...responseData.data]);

            }
            if (responseData.data.length < 12){
                setNoticePage(-1);
            }
        } catch (e) {
            console.log(e);
        }
    }, [CSRF_TOKEN, PRODMODE, noticeIgnore, noticePage]);




    const handleClose = () => {
        setNotificatorOpened(false);
        if (on_close){
            on_close();
        }
    }

    useEffect(() => {
        getFreshNotices().then();
    }, [refreshKey, getFreshNotices]);
    useEffect(() => {
        if (on_count_change){
            on_count_change(countOfNewNotifications);
        }
    }, [countOfNewNotifications, on_count_change]);
    useEffect(() => {
        console.log(is_open);
        setNotificatorOpened(is_open);
    }, [is_open]);
    useEffect(() => {
        if (notificatorOpened){
            getFreshNotices().then();
        }
    }, [notificatorOpened, getFreshNotices]);
    useEffect(() => {
        if (PRODMODE){
            getFreshNotices().then();
        } else {
            setNotifications(MOCK_NOTICES);
            /*console.log("MANOK" , MOCK_NOTICES);*/
        }
    }, [PRODMODE, getFreshNotices, setNotifications]);
    useEffect(() => {
        setNotificatorLoading(false);
    }, [notifications]);

    return (
        <Drawer
            closable
            destroyOnClose
            title={<p>Уведомления</p>}
            placement="right"
            open={notificatorOpened}
            loading={notificatorLoading}
            onClose={handleClose}
        >
            <div>
                {notifications.map((item)=>(
                    <NotiCard
                        data={item}
                        key={`notic_${item.id}`}
                        on_read={notificationRead}
                    />
                ))}
            </div>

            { noticePage > 0 && (
                <Button type="dashed" block
                        onClick={getOldNotices}
                >
                    Показать старые уведомления
                </Button>
            )}

        </Drawer>
    );
};

export default NotifierDrawer;

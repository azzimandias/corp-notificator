import { Button, Drawer } from 'antd';
import {useCallback, useEffect, useState} from 'react';
import NotiCard from './NotiCard';
import { MOCK_NOTICES } from '../mock/mock';
import {useNotificationSocket} from "../context/NotificatorSocketContext";
import type {Notification} from "../types/types";
import dayjs from "dayjs";

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
        init,
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

            setNotifications(prev => {
                const newNoties = filterNoties(responseData.data, prev);
                return ([
                    ...newNoties,
                    ...prev,
                ]);
            });
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


    const filterNoties = (noties: Notification[], prev: Notification[]): Notification[] => {
        return noties.filter(res => !prev.find(n => +n.id === +res.id));
    };


    const handleClose = () => {
        setNotificatorOpened(false);
        if (on_close){
            on_close();
        }
    }

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
        if (init){
            getFreshNotices().then();
        } else if (!PRODMODE) {
            setNotifications(MOCK_NOTICES);
        }
    }, [init, refreshKey, PRODMODE, getFreshNotices, setNotifications]);
    useEffect(() => {
        const ignore: number[] = [];
        for (let i = 0; i < notifications.length; i++){
            ignore.push(notifications[i].id);
        }
        setNoticeIgnore(ignore);
        setCountOfNewNotifications((notifications.filter(noti => !noti.is_read)).length);
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
                {notifications.slice()
                              .sort((a, b) => dayjs(b.created_at).valueOf() - dayjs(a.created_at).valueOf())
                              .map((item) => (
                                    <NotiCard
                                        data={item}
                                        key={`notic_${item.id}`}
                                        on_read={notificationRead}
                                    />
                              ))
                }
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

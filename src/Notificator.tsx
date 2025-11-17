import './App.css'
import NotiBtn from "./NOTIFICATOR/NotiBtn.tsx";
import {NotificationSocketProvider} from "./NOTIFICATOR/provider/NotificationProvider.tsx";
import type {NotificatorParams} from "./NOTIFICATOR/types/types.ts";
import {useNotificationSocket} from "./NOTIFICATOR/context/NotificatorSocketContext.tsx";
import {useEffect} from "react";

const NotificatorInner = ({
                       userdata,
                       httpParams,
                       fetchParams,
                       socketSubscribe,
                       socketActions
                   }: NotificatorParams) => {
    const {
        setUserData,

        SET_HTTP_HOST,
        SET_CSRF_TOKEN,
        SET_PRODMODE,
        SET_BFF_PORT,

        setSubscribeToNotificationPath,
        setNewNotificationPath,
        setReadNotificationPath,

        setInit,
    } = useNotificationSocket();

    useEffect(() => {
        /*console.log('CORP-CHAT userdata', userdata);
        console.log('CORP-CHAT httpParams', httpParams);
        console.log('CORP-CHAT fetchParams', fetchParams);
        console.log('CORP-CHAT socketSubscribe', socketSubscribe);
        console.log('CORP-CHAT socketActions', socketActions);*/

        let userdataFlag = false;
        let httpParamsFlag = false;
        let fetchParamsFlag = false;
        let socketSubscribeFlag = false;
        let socketActionsFlag = false;

        if (userdata) setUserData(userdata);
        if (userdata) userdataFlag = true;

        if (httpParams && httpParams?.HTTP_HOST) SET_HTTP_HOST(httpParams?.HTTP_HOST);
        if (httpParams && httpParams?.CSRF_TOKEN) SET_CSRF_TOKEN(httpParams?.CSRF_TOKEN);
        if (httpParams && httpParams?.PRODMODE) SET_PRODMODE(httpParams?.PRODMODE);
        if (httpParams && httpParams?.BFF_PORT) SET_BFF_PORT(httpParams?.BFF_PORT);
        if (httpParams && httpParams?.HTTP_HOST && httpParams?.CSRF_TOKEN && httpParams?.PRODMODE && httpParams?.BFF_PORT)
            httpParamsFlag = true;

        if (fetchParams && fetchParams?.fetchChatsListPath) setFetchChatsListPath(fetchParams?.fetchChatsListPath);
        if (fetchParams && fetchParams?.fetchChatMessagesPath) setFetchChatMessagesPath(fetchParams?.fetchChatMessagesPath);
        if (fetchParams && fetchParams?.sendSmsPath) setSendSmsPath(fetchParams?.sendSmsPath);
        if (fetchParams && fetchParams?.markMessagesAsReadPath) setMarkMessagesAsReadPath(fetchParams?.markMessagesAsReadPath);
        if (fetchParams && fetchParams?.fetchChatsListPath && fetchParams?.fetchChatMessagesPath && fetchParams?.sendSmsPath && fetchParams?.markMessagesAsReadPath)
            fetchParamsFlag = true;

        if (socketSubscribe && socketSubscribe?.subscribeToNotification) setSubscribeToNotificationPath(socketSubscribe?.subscribeToNotification);
        if (socketSubscribe && socketSubscribe?.subscribeToNotification) socketSubscribeFlag = true;

        if (socketActions && socketActions?.newNotification) setNewNotificationPath(socketActions?.newNotification);
        if (socketActions && socketActions?.readNotification) setReadNotificationPath(socketActions?.readNotification);
        if (socketActions && socketActions?.newNotification && socketActions?.readNotification) socketActionsFlag = true;

        if (userdataFlag && httpParamsFlag && fetchParamsFlag && socketSubscribeFlag && socketActionsFlag)
            setInit(true);
    }, [
        userdata,
        httpParams,
        fetchParams,
        socketSubscribe,
        socketActions,

        setUserData,

        SET_HTTP_HOST,
        SET_CSRF_TOKEN,
        SET_PRODMODE,
        SET_BFF_PORT,

        setSubscribeToNotificationPath,
        setNewNotificationPath,
        setReadNotificationPath,

        setInit,
    ]);

    return <NotiBtn />;
}

const Notificator = (props: NotificatorParams) => {

  return (
      <NotificationSocketProvider>
          <NotificatorInner {...props}/>
      </NotificationSocketProvider>
  )
}

export default Notificator

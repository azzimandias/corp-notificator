import {useState} from 'react';
import {NotificationOutlined} from "@ant-design/icons";
import {Button, Space} from "antd";
import NotifierDrawer from "./components/NotifierDrawer";

const NotiBtn = () => {
    const [totalUnread, setTotalUnread] = useState(0);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);

    const openDrawer = () => {
        setIsOpenDrawer(true);
    };

    const changeCount = (newCount: number) => {
        setTotalUnread(newCount);
    };

    const closeDrawer = () => {
        setIsOpenDrawer(false);
    };

    return (
        <Space style={{ padding: 0 }}>
            <Button type="primary"
                    onClick={openDrawer}
            >
                <NotificationOutlined/>
                {totalUnread > 0 && (
                    <span className={'notification-badge'}>{totalUnread}</span>
                )}
            </Button>
            <NotifierDrawer is_open={isOpenDrawer}
                            on_close={closeDrawer}
                            on_count_change={changeCount}
            />
        </Space>
    );
};

export default NotiBtn;

import { Button } from "antd";
import { useState, useEffect } from "react";
import "../styles/noticard.css";
import { CheckSquareOutlined, ExclamationOutlined } from "@ant-design/icons";
import dayjs, {Dayjs} from "dayjs";
import MDEditor from "@uiw/react-md-editor";
import type {Notification} from "../types/types";


const NotiCard = ({data, on_read}: {
    data: Notification,
    on_read: (id: number) => void
}) => {

    const [isRead, setIsRead] = useState<boolean | number | undefined>(data.is_read);
    const [isReq, setIsReq] = useState<boolean | number | undefined>(data.mandatory);

    const [color, setColor] = useState<string | undefined>(data.color && !data.is_read ? data.color : "#b3b3b3");
    const [name, setName] = useState<string | undefined>(data.name ? data.name : "Сообщение");
    const [updated, setUpdated] = useState<Dayjs | null | undefined>(data.updated_at? dayjs(data.updated_at) : null);


    const [readAnimation, setReadAnimation] = useState<boolean>(false);

    const mouseOver = () => {
        if (!isReq && !isRead){
            makeUpdate();
        }
    }

    const makeRead = () => {
        if (!isRead){
            makeUpdate();
        }
    }

    const makeUpdate = () => {
        setReadAnimation(true);
        setIsRead(true);
        setTimeout(() => {
            setReadAnimation(false);
        }, 600);
        setUpdated(dayjs());
        if (on_read){
            on_read(data.id);
        }
        setColor('#b3b3b3');
    }

    useEffect(()=>{
        setIsReq(data.mandatory);
        setName(data.name);
    },[data]);

    return (
        <div className={`ma-noticard ${!isRead ? "ma-notread" : ""} ${readAnimation ? "ma-blow" : ""}`  }
             onMouseOver={mouseOver}
             style={{ borderColor: color, background: 'white'}}

        >
            <div className={"ma-notcontent"}>
                {name && (
                    <div className="ma-notihead">{name}</div>
                )}
                <MDEditor.Markdown source={data.content}
                                   data-color-mode="light"
                                   className="my-markdown-light"
                />
            </div>
            <div className={"ma-notfooter"}>

                {isReq && !isRead ? (
                    <Button color="danger" variant="solid"
                            onClick={makeRead}
                    >Прочитано!</Button>
                ) : ""}

                {isRead ? (
                    <CheckSquareOutlined title={"Прочитано"} style={{ color: 'green', fontSize: 'x-large', borderRadius: '3px'}} />
                ) : ""}

                {!isReq && !isRead ? (
                    <ExclamationOutlined title={"Нужно прочесть"} style={{border: '1px solid red', color: 'red', fontSize: 'large', borderRadius: '3px'}} />
                ) : ""}


                {isRead ? (
                    <span>
                        <span style={{color: 'gray', fontStyle: 'italic'}}>Прочитано</span> {updated?.format('DD-MM-YYYY')}
                    </span>
                ) : (
                    <span>
                        <span style={{color: 'gray', fontStyle: 'italic'}}>Создано</span> {dayjs(data.created_at).format('DD-MM-YYYY')}
                    </span>
                )
                }

            </div>
        </div>
    );
}

export default NotiCard;

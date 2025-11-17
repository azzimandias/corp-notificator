export interface NotificatorParams {
    userdata: UserData;
    httpParams: HttpParams;
    fetchParams: FetchParams;
    socketSubscribe: SocketSubscribe;
    socketActions: SocketActions;
}

export interface HttpParams {
    CSRF_TOKEN: string;
    PRODMODE: boolean;
    HTTP_HOST: string;
    BFF_PORT: number;
}

export interface FetchParams {
    fetchChatsListPath: string;
    fetchChatMessagesPath: string;
    sendSmsPath: string;
    markMessagesAsReadPath: string;
}

export interface SocketSubscribe {
    subscribeToNotification: string;
}

export interface SocketActions {
    newNotification: string;
    readNotification: string;
}

export interface UserData {
    acls: number[],
    companies: Company[],
    user: User,
    mode: number,
    duration: number,
    status: number,
}

export interface Company {
    id: number,
    name: string,
    description: string,
    is_active: number,
    template_prefix: string,
    folder: string,
    color: string,
    ext_address_offers: string,
    path_logo: string,
    places: Place[],
}

export interface Place {
    id: number,
    name: string,
    label: string,
    accessgroup: number,
    accessname: string,
    position: number,
    place: number,
}

export interface User {
    id: number,
    name: string,
    surname: string,
    secondname: string,
    occupy: string,
    passcard: string | null | undefined,
    id_role: number,
    email: string | null | undefined,
    sales_role: number,
    password2: string,
    active_company: number,
    id_departament: number,
    id_company: number,
    super?: number | null,
}

export interface AlertInfo {
    message: string,
    description: string,
    type: "success" | "info" | "warning" | "error"
}
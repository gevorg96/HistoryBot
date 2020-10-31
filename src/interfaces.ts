export interface IMessage {
    message_id: number,
    from: IFrom,
    chat: IChat,
    date: Date,
    text: string,
    entities: IEntity[]
    data: string
}

export interface Identified {
    id: number
}

export interface IFrom extends Identified {
    is_bot: boolean,
    first_name: string,
    last_name: string,
    username: string,
    language_code: string
};

export interface IChat extends Identified {
    first_name: string,
    username: string,
    type: string
};

export interface IEntity {
    offset: number,
    length: number,
    type: string
}

export interface Period {
    id: number,
    year: string,
    event: string
}

export interface Subscriptions {
    tgid :number,
    firstperiod: number,
    secondperiod: number,
    thirdperiod: number,
    foreignperiod: number
}

export interface TgEvent {
    tgid: number,
    eventnumber: number,
    year: string,
    event: string
}

export interface IAuthCredentials {
    login: string,
    password: string
}

export interface IQueueItem {
    tgid: number,
    tglogin: string,
    name: string
}

export interface IAdmin {
    login: string,
    password: string
}
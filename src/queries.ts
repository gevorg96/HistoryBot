import { IMessage } from "./interfaces";


export const insertOnQueue = (msg: IMessage) => {
    const name = msg.from.first_name ?? '' + ' ' + msg.from.last_name ?? '';
    
    return `INSERT INTO onqueue (tgid, tglogin, name) 
    SELECT ${msg.from.id}, '${msg.from.username}', '${name}'
    WHERE NOT EXISTS (
        SELECT tgid, tglogin, name FROM onqueue WHERE tgid=${msg.from.id}
    );`;
}

export const getSubscriptPerson = (msg: IMessage) =>
    `select tgid from subscriptions where tgid = ${msg.from.id}`;

export const setSubscription = (msg: IMessage) => 
    `update subscriptions set ${msg.data} = 1 where tgid = ${msg.from.id}`;

export const selectTgEvent = (period: string, tableAlias: string) => 
    `select s.tgid, s.firstperiod as eventnumber, fp.year, fp.event 
    from subscriptions s join ${period} p on p.id = s.${tableAlias}`;

export const revertSubscription = (tableAlias: string, tgid: number) => 
    `update subscriptions set ${tableAlias} = null where tgid = ${tgid}`;

export const iterateSubscriptions = (tableAlias: string) => 
    `UPDATE subscriptions SET ${tableAlias} = ${tableAlias} + 1 where ${tableAlias} is not null`;
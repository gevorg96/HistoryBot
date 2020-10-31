import { IMessage, Subscriptions, TgEvent } from './interfaces';
import TelegramBot from './TelegramBot';
import { getValues, update, getValue, create } from './dbContext';
import { getSubscriptPerson, insertOnQueue, setSubscription, selectTgEvent, revertSubscription, iterateSubscriptions } from './queries';
import { text } from 'express';

interface IButton {
    text: string,
    callback_data: string
}

const buttons = {
    inline_keyboard: [
      [{ text: 'I период', callback_data: 'firstperiod' }],
      [{ text: 'II период', callback_data: 'secondperiod' }],
      [{ text: 'III период', callback_data: 'thirdperiod' }],
      [{ text: 'Всемирная история', callback_data: 'foreignperiod' }]
    ]
}

const getButtonInfo = (field: string, value: string) => {
    if (field === 'text' || field === 'callback_data') {
        return buttons.inline_keyboard.find(x => x.find(y => y[field] === value))?.[0]
    }
}

var options = {
    reply_markup: JSON.stringify(buttons)
  };
  
export default class Bot {
    private bot: TelegramBot | undefined = undefined;

    constructor(apiKey: string) {
        this.bot = new TelegramBot(apiKey, { polling: true });
        this.bot.onText(/start/, async (msg: IMessage) => {            
            const result = await getValue<number>(getSubscriptPerson(msg));

            if (result) {
                this.sendMessageWithKeyboard(msg.from.id, 'Выберите любой период:', options);
            }
            else {
                this.sendMessage(msg.from.id, 'Вы не можете подписаться...');        
                await create(insertOnQueue(msg));
            }
        });
        this.bot.on('callback_query', async (msg: IMessage) => {
            console.log(msg);
            const match = getButtonInfo('callback_data', msg.data);
            if (match) {
                await update(setSubscription(msg));
                this.bot.sendMessage(msg.from.id, `Вы подписаны на ${match.text}`);
            }
            else {
                this.bot.sendMessage(msg.from.id, 'Такой период ещё не добавлен...');
            }
        });
    }

    private sendMessageWithKeyboard = (id: number, text: string, options: any) => {
        this.bot.sendMessage(id, text, options);
    }

    public sendMessage = (id: number, text: string) => {
        this.bot.sendMessage(id, text)
    };

    public processStep = async (period: string) => {
        const tableAlias = this.getTableAlias(period);

        const eventsCount = await getValue<number>(`select count(*) from ${period}`);
        const result = await getValues<TgEvent>(selectTgEvent(period, tableAlias));
        
        result.forEach(async x => {
            if (x.eventnumber === eventsCount) {
                await update(revertSubscription(tableAlias, x.tgid));
                this.bot.sendMessage(x.tgid, `Подписка на ${getButtonInfo('callback_data', tableAlias)?.text} закончена`)
            }
            this.bot.sendMessage(x.tgid, x.year + ' - ' + x.event)
        });
        await update(iterateSubscriptions(tableAlias));
    }

    private getTableAlias = (period: string) => {
        switch (period) {
            case 'period_1':
                return 'firstperiod';
            case 'period_2':
                return 'secondperiod';
            case 'period_3':
                return 'thirdperiod';
            case 'period_foreign':
                return 'foreignperiod';
            default:
                return 'period_1';
        }
    }
}
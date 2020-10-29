import { IMessage, Subscriptions, TgEvent } from './interfaces';
import TelegramBot from './TelegramBot';
import { getValues, update } from './dbContext';


const buttons = {
    inline_keyboard: [
      [{ text: 'I период', callback_data: 'period_1' }],
      [{ text: 'II период', callback_data: 'period_2' }],
      [{ text: 'III период', callback_data: 'period_3' }],
      [{ text: 'Всемирная история', callback_data: 'period_foreign' }]
    ]
}

var options = {
    reply_markup: JSON.stringify(buttons)
  };
  
export default class Bot {
    private bot: TelegramBot | undefined = undefined;

    constructor(apiKey: string) {
        this.bot = new TelegramBot(apiKey, { polling: true });
        this.bot.onText(/start/, (msg: IMessage) => {
            this.sendMessageWithKeyboard(msg.from.id, 'Выберите любой период:', options)
        });
        this.bot.on('callback_query', (msg: IMessage) => {
            console.log(msg);
            const match = buttons.inline_keyboard.find(y => y.find(x => x.callback_data === msg.data))?.[0];
            if (match) {
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

    public processStep = async () => {
        const result = await getValues<TgEvent>('select s.tgid, fp.year, fp.event from subscriptions s join period_1 fp on fp.id = s.firstperiod');
        result.forEach(x => {
            this.bot.sendMessage(x.tgid, x.year + ' - ' + x.event)
        });
        await update('UPDATE subscriptions SET firstperiod = firstperiod + 1 where firstperiod is not null');
    }
}
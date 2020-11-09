import express, { Application, Request, Response } from 'express';
import Bot from './Bot';
import fs from 'fs';
import path from 'path';
import { getValue, getValues, create } from './dbContext';
import { IAuthCredentials, IQueueItem, IAdmin } from './interfaces';

const port = process.env.PORT || 3000;
const app: Application = express();
const bot = new Bot('1267759829:AAFWmMdTe1Q1NZDmUp-ylKY_NboxUXbrjRo');

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.post('/auth', async (req : Request, res : Response) => {
  const authcredentials: IAuthCredentials = req.body;
  const result = await getValue<IAdmin>(`select * from admin where login = '${authcredentials.login}' and password = '${authcredentials.password}'`);
  
  if (result) {  
    res.writeHead(200, { 'Content-type': 'application/json'});
    const queueItems = await getValues<IQueueItem>('select * from onqueue');
    res.end(JSON.stringify({data: JSON.stringify(queueItems), auth: result.login}));
  }
  else {
    res.writeHead(404, { 'Content-type': 'text/html' });
    res.end();
  }
});

app.get('/', async (req : Request, res : Response) => {
  fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, data) => {
    if (err)
      throw err;
    res.end(data);
  });
});

app.post('/allowaccess', async (req : Request, res : Response) => {
  const auth_token = req.body.auth_token;
  const result = await getValue<IAdmin>(`select * from admin where login = '${auth_token}'`);
  if (!result) {
    res.writeHead(401, { 'Content-type': 'application/json'});
    res.end(JSON.stringify({message: 'Нет доступа'}));
  }
  res.writeHead(200, { 'Content-type': 'application/json'});  
  const tgid = req.body.tgid;
  await create(`delete from onqueue where tgid = ${tgid}; insert into subscriptions(tgid) values (${tgid})`);
  res.end(JSON.stringify({message: 'Пользователь добавлен'}));
});


const map = [
  {key: 9, value: 'period_1'},
  {key: 12, value: 'period_2'},
  {key: 15, value: 'period_3'},
  {key: 18, value: 'period_foreign'},
]

app.get('/update', async (req : Request, res : Response) => {
  await bot.processStep('period_1');
  // const value = map.find(x => x.key === new Date().getHours());
  // if (value) {
  //   await bot.processStep(value.value);
  // }
  res.send('Ok');
})

app.listen(port, () => {
  console.log(`> App listening on port ${port}`)
});
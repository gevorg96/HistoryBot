import express, { Application, Request, Response } from 'express';
import Bot from './Bot';

const port = process.env.PORT || 3000;
const app: Application = express();
const bot = new Bot('1267759829:AAFWmMdTe1Q1NZDmUp-ylKY_NboxUXbrjRo');

app.use(express.json());

app.get('/', async (req : Request, res : Response) => {
    res.send('Bot works');
});

app.get('/update', async (req : Request, res : Response) => {
    await bot.processStep();
    res.send('Ok');
})

app.listen(port, () => {
  console.log(`> App listening on port ${port}`)
});
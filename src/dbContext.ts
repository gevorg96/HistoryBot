import { Period } from "./interfaces";
import { Client, Pool } from "pg";

export const pgOptions = {
    user: 'yscymdjkzzmbjt',
    host: 'ec2-54-246-90-10.eu-west-1.compute.amazonaws.com',
    database: 'dajlrg1593ue4i',
    password: '4b17436aafae072b341f2477816bf859fd8e8f9398377eeae955faaba4634d2f',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
};

export async function getValues<T>(q: string) : Promise<T[]> {
    const client = new Client(pgOptions)
    await client.connect();
    let rows: T[] = []

    try {
        const res = await client.query<T>(q);
        return res.rows;
    }
    catch(e) {
        console.log('Message: ' + e)
    }
    finally {
        await client.end();
    }
    return rows;
}


export async function getValue<T>(q: string) : Promise<T | undefined> {
    const client = new Client(pgOptions)
    await client.connect();
    let row: T | undefined = undefined;

    try {
        const res = await client.query<T>(q);
        row = res.rows?.[0];
    }
    catch(e) {
        console.log('Message: ' + e)
    }
    finally {
        await client.end();
    }
    return row;
}

export async function create<T>(q: string) : Promise<boolean> {
    const client = new Client(pgOptions)
    await client.connect();
    try {
        const res = await client.query<T>(q);
        return true;
    }
    catch(e) {
        console.log('Message: ' + e)
        return false;
    }
    finally {
        await client.end();
    }
}

export async function update(q: string) : Promise<boolean> {
    const client = new Client(pgOptions)
    await client.connect();
    try {
        const res = await client.query<any>(q);
        return true;
    }
    catch(e) {
        console.log('Message: ' + e)
        return false;
    }
    finally {
        await client.end();
    }
}


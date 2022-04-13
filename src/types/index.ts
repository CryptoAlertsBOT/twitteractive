export interface IPricePayload {
    symbol: string,
    price: number
}

export interface IConfig {
    readonly [key: string]: string
}

export type APISymbolResponse = {
    symbol: string,
    price: string,
} & {
    code: number,
    msg: string
}

export interface INotificationData {
    readonly userID: string,
    readonly last_price: number,
    readonly symbol: string,
    readonly change: number,
    readonly triggerTime: number
}

export enum Base {
    USDT= "USDT",
    BTC ="BTC"
}
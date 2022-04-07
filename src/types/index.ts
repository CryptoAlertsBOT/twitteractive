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
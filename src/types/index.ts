export interface IPricePayload {
    symbol: String,
    price: number
}

export interface IConfig {
    readonly [key: string]: string
}

export type APISymbolResponse = {
    symbol: string,
    price: string,
}
import mongoose from "mongoose"
import { ICustomAlertSchema } from "../models/CustomAlert/types"

export interface IPricePayload {
    symbol: string,
    price: number
}

export interface IThresholdPayload {
    symbol: string,
    last_price: number,
    change: number,
    triggerTime: number
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

export interface IThresholdData {
    readonly userID: string,
    readonly last_price: number,
    readonly symbol: string,
    readonly change: number,
    readonly triggerTime: number
}

export interface ICustomAlertData {
    readonly alert_id: ICustomAlertSchema['_id'],
    readonly twitterID: string,
    readonly username: string,
    readonly symbol: string,
    readonly trigger_price: ICustomAlertSchema['trigger_price'],
    readonly price_when_set: ICustomAlertSchema['price_when_set'],
    readonly last_price: number
}

export enum Base {
    USDT= "USDT",
    BTC ="BTC"
}

export enum Change {
    UP="UP",
    DOWN="DOWN"
}
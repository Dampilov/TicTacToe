import { BigNumber } from "ethers"

export const duration = {
    seconds: function (val: string) {
        return BigNumber.from(val)
    },
    minutes: function (val: string) {
        return BigNumber.from(val).mul(this.seconds("60"))
    },
    hours: function (val: string) {
        return BigNumber.from(val).mul(this.minutes("60"))
    },
    days: function (val: string) {
        return BigNumber.from(val).mul(this.hours("24"))
    },
    weeks: function (val: string) {
        return BigNumber.from(val).mul(this.days("7"))
    },
    years: function (val: string) {
        return BigNumber.from(val).mul(this.days("365"))
    },
}

export const convert = {
    seconds: function (val: string) {
        return BigNumber.from(val)
    },
    minutes: function (val: string) {
        return BigNumber.from(val).div(duration.seconds("60"))
    },
    hours: function (val: string) {
        return BigNumber.from(val).div(duration.minutes("60"))
    },
    days: function (val: string) {
        return BigNumber.from(val).div(duration.hours("24"))
    },
    weeks: function (val: string) {
        return BigNumber.from(val).div(duration.days("7"))
    },
    years: function (val: string) {
        return BigNumber.from(val).div(duration.days("365"))
    },
}

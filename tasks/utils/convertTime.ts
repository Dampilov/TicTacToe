import { subtask } from "hardhat/config"
import { convert, duration } from "./time"
import { BigNumber } from "ethers"

subtask("convertTime", "Get game")
    .addParam("time", "Time")
    .setAction(async ({ time }, hre) => {
        let waiting = BigNumber.from(time)

        const years = convert.years(waiting.toString())
        waiting = BigNumber.from(waiting).sub(duration.years(years.toString()))

        const weeks = convert.weeks(waiting.toString())
        waiting = BigNumber.from(waiting).sub(duration.weeks(weeks.toString()))

        const days = convert.days(waiting.toString())
        waiting = BigNumber.from(waiting).sub(duration.days(days.toString()))

        const hours = convert.hours(waiting.toString())
        waiting = BigNumber.from(waiting).sub(duration.hours(hours.toString()))

        const minutes = convert.minutes(waiting.toString())
        waiting = BigNumber.from(waiting).sub(duration.minutes(minutes.toString()))

        const seconds = convert.seconds(waiting.toString())
        waiting = BigNumber.from(waiting).sub(duration.seconds(seconds.toString()))

        return { years, weeks, days, hours, minutes, seconds }
    })

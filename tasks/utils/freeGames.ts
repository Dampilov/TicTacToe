import { task } from "hardhat/config"
import "./getContract"

task("freeGames", "Get list of free games", async (taskArgs, hre) => {
    const contract = await hre.run("get-contract", { name: "TicTacToe" })

    try {
        const games = await contract.freeGames()

        for (const game of games) {
            const { years, weeks, days, hours, minutes, seconds } = await hre.run("convertTime", { time: game.waitingTime.toString() })
            console.log(`\nID: ${game.id}`)
            console.log(`Owner: ${game.owner}`)
            console.log(`Game state: ${game.state}`)
            console.log("Time for move:")
            console.log(`\tYears: ${years}`)
            console.log(`\tWeeks: ${weeks}`)
            console.log(`\tDays: ${days}`)
            console.log(`\tHours: ${hours}`)
            console.log(`\tMinutes: ${minutes}`)
            console.log(`\tSeconds: ${seconds}`)
            if (game.state == 0) console.log(`Created in: ${new Date(game.lastActiveTime * 1000)}`)
        }
    } catch (e) {
        console.log(e)
    }
})
